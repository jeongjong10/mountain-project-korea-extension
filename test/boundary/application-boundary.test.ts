import { readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { API } from 'typescript/unstable/sync';
import { createVirtualFileSystem } from 'typescript/unstable/fs';
import {
  isCallExpression, isElementAccessExpression, isExportDeclaration,
  isExternalModuleReference, isIdentifier, isImportDeclaration, isImportTypeNode,
  isLiteralTypeNode, isPropertyAccessExpression, isStringLiteralLikeNode,
  NodeFlags, SyntaxKind, type Node,
} from 'typescript/unstable/ast';

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : /\.tsx?$/.test(path) ? [path] : [];
  });
}

function boundaryViolations(sources: Record<string, string>): string[] {
  const violations: string[] = [];
  const config = resolve('/tmp/mpkr-boundary/tsconfig.json');
  // A virtual, no-resolve project provides lexical bindings without loading dependencies.
  const api = new API({ fs: createVirtualFileSystem({
    ...sources,
    [config]: JSON.stringify({ compilerOptions: { noLib: true, noResolve: true, types: [] }, files: Object.keys(sources) }),
  }) });
  try {
    const snapshot = api.updateSnapshot({ openProjects: [config] });
    const project = snapshot.getProject(config)!;
    for (const path of Object.keys(sources)) {
      const source = project.program.getSourceFile(path)!;
      const name = relative(resolve('src'), path).replaceAll('\\', '/');
      const local = (node: Node): boolean => project.checker.getSymbolAtLocation(node)?.declarations.some((handle) => {
        const declaration = handle.resolve();
        return handle.path === source.path && declaration !== undefined
          && !(declaration.flags & NodeFlags.Ambient);
      }) ?? false;
      let usesApi = false;
      const visit = (node: Node): void => {
        if (isStringLiteralLikeNode(node)) {
          const parent = node.parent;
          const dependency = (isImportDeclaration(parent) || isExportDeclaration(parent)) && parent.moduleSpecifier === node
            || isExternalModuleReference(parent)
            || isLiteralTypeNode(parent) && isImportTypeNode(parent.parent)
            || isCallExpression(parent) && parent.arguments[0] === node
              && (parent.expression.kind === SyntaxKind.ImportKeyword
                || isIdentifier(parent.expression) && parent.expression.text === 'require');
          if (dependency && (/^(wxt|webextension-polyfill)(\/|$)/.test(node.text)
            || /(^|\/)(platforms|entrypoints)(\/|$)/.test(node.text))) {
            violations.push(`${name}: forbidden dependency ${node.text}`);
          }
        }
        if (isPropertyAccessExpression(node) || isElementAccessExpression(node)) {
          const base = node.expression;
          if (isIdentifier(base) && /^(browser|chrome|globalThis|window|self)$/.test(base.text) && !local(base)) {
            const member = isPropertyAccessExpression(node) ? node.name.text
              : isStringLiteralLikeNode(node.argumentExpression) ? node.argumentExpression.text : undefined;
            usesApi ||= /^(browser|chrome)$/.test(base.text)
              || /^(globalThis|window|self)$/.test(base.text) && /^(browser|chrome)$/.test(member ?? '');
          }
        }
        if (isCallExpression(node) && isIdentifier(node.expression)
          && /^define(ContentScript|Background)$/.test(node.expression.text) && !local(node.expression)) {
          usesApi = true;
        }
        node.forEachChild(visit);
      };
      visit(source);
      if (usesApi) violations.push(`${name}: extension or WXT API`);
    }
    snapshot.dispose();
  } finally {
    api.close();
  }
  return violations;
}

it('keeps platform imports and extension APIs inside entrypoints/platforms', () => {
  const sources: Record<string, string> = {};
  for (const path of files(resolve('src'))) {
    const name = relative(resolve('src'), path).replaceAll('\\', '/');
    if (/^(entrypoints|platforms)\//.test(name)) continue;
    sources[path] = readFileSync(path, 'utf8');
  }
  expect(boundaryViolations(sources)).toEqual([]);
});

function check(source: string): string[] {
  return boundaryViolations({ [resolve('src/boundary-fixture.ts')]: `export {};\n${source}` });
}

it('allows local DOM bindings and ignores API-looking comments and strings', () => {
  expect(check(`
    const browser = document.createElement('div'); browser.hidden = true;
    function render(chrome: HTMLElement) { chrome.append(browser); }
    // browser.storage.local.get(); defineContentScript({}); import 'wxt';
    const text = "chrome.storage; import('wxt/browser')";
  `)).toEqual([]);
});

it('retains global API detection outside a local binding and through explicit globals', () => {
  for (const source of [
    '{ const browser = document.createElement("div"); browser.hidden = true; } browser.storage.local.get();',
    'chrome["storage"].local.get();',
    'const browser = document.createElement("div"); globalThis.browser.storage.local.get();',
    'window["chrome"].runtime.sendMessage({});',
    'declare const browser: any; browser.storage.local.get();',
    'defineContentScript({});',
    'defineBackground(() => {});',
  ]) {
    expect(check(source), source).toContain('boundary-fixture.ts: extension or WXT API');
  }
});

it('retains forbidden imports including aliases, re-exports, types and dynamic loads', () => {
  for (const [source, dependency] of [
    ['import { browser as extension } from "wxt/browser"; extension.storage.local.get();', 'wxt/browser'],
    ['import "webextension-polyfill";', 'webextension-polyfill'],
    ['export { Provider } from "../platforms/provider";', '../platforms/provider'],
    ['type Provider = import("../platforms/provider").Provider;', '../platforms/provider'],
    ['import("../entrypoints/content");', '../entrypoints/content'],
    ['const extension = require("wxt/browser");', 'wxt/browser'],
  ] as const) {
    expect(check(source), source).toContain(`boundary-fixture.ts: forbidden dependency ${dependency}`);
  }
});
