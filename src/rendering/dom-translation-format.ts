import {
  PlaceholderIntegrityError,
  type TextReplacement,
} from '../core/translation-text-policy';

const SAFE_TAGS = new Set([
  'A', 'ABBR', 'B', 'BLOCKQUOTE', 'BR', 'CODE', 'DIV', 'EM', 'H3', 'H4', 'H5', 'H6',
  'I', 'IMG', 'KBD', 'LI', 'MARK', 'OL', 'P', 'PRE', 'S', 'SMALL', 'SPAN', 'STRONG',
  'SUB', 'SUP', 'U', 'UL',
]);
const VOID_TAGS = new Set(['BR', 'IMG']);
const BLOCKED_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'FORM', 'INPUT', 'TEXTAREA', 'SELECT',
  'OPTION', 'BUTTON', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META',
]);
const GLOBAL_ATTRIBUTES = new Set(['class', 'title', 'lang', 'dir', 'role']);
const TAG_ATTRIBUTES: Readonly<Record<string, ReadonlySet<string>>> = {
  A: new Set(['href', 'target', 'rel', 'download', 'hreflang']),
  IMG: new Set(['src', 'alt', 'width', 'height', 'loading']),
  OL: new Set(['start', 'reversed', 'type']),
  LI: new Set(['value']),
  ABBR: new Set(['title']),
};

interface SafeElementDescriptor {
  readonly tagName: string;
  readonly attributes: readonly (readonly [string, string])[];
  readonly source: Element;
}

interface StructureToken {
  readonly id: number;
  readonly value: string;
  readonly kind: 'open' | 'close' | 'void' | 'opaque';
  readonly element: SafeElementDescriptor;
}

export interface DomTranslationFormat {
  readonly fingerprint: string;
  readonly root: SafeElementDescriptor;
  readonly parentList?: SafeElementDescriptor;
  readonly tokens: readonly StructureToken[];
  readonly protectedReplacements: readonly TextReplacement[];
}

export interface SerializedDomTranslation {
  readonly source: string;
  readonly semanticSource: string;
  readonly format: DomTranslationFormat;
}

export type DomTranslationParagraphPart =
  | {
      readonly kind: 'translate';
      readonly source: string;
      readonly protectedReplacements: readonly TextReplacement[];
    }
  | {
      readonly kind: 'separator';
      readonly source: string;
    };

export interface SerializeDomTranslationOptions {
  readonly opaqueElement?: (element: Element) => boolean;
  readonly omitElement?: (element: Element) => boolean;
}

function hash(value: string): string {
  let result = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 0x01000193);
  }
  return (result >>> 0).toString(36).toUpperCase();
}

function safeUrl(value: string, attribute: string): boolean {
  const normalized = value.trim().toLocaleLowerCase('en-US');
  if (attribute === 'src' && normalized.startsWith('data:image/')) return true;
  return !/^(?:javascript|vbscript|data):/u.test(normalized);
}

function descriptor(element: Element): SafeElementDescriptor {
  const attributes: Array<readonly [string, string]> = [];
  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name.toLocaleLowerCase('en-US');
    if (name === 'id' || name === 'style' || name.startsWith('on') || name.startsWith('data-')) continue;
    const allowed = GLOBAL_ATTRIBUTES.has(name)
      || name.startsWith('aria-')
      || TAG_ATTRIBUTES[element.tagName]?.has(name);
    if (!allowed) continue;
    if ((name === 'href' || name === 'src') && !safeUrl(attribute.value, name)) continue;
    attributes.push([name, attribute.value]);
  }
  return { tagName: SAFE_TAGS.has(element.tagName) ? element.tagName : 'SPAN', attributes, source: element };
}

export function serializeDomTranslation(
  root: HTMLElement,
  options: SerializeDomTranslationOptions = {},
): SerializedDomTranslation {
  // The renderer changes the source root's display style when showing a copy.
  // Only safe root attributes and original descendants define its translation.
  const rootDescriptor = descriptor(root);
  const fingerprint = hash(JSON.stringify([
    rootDescriptor.tagName, rootDescriptor.attributes, root.innerHTML,
  ]));
  const prefix = `MPKRDOM_${fingerprint}_`;
  const tokens: StructureToken[] = [];
  const parts: string[] = [];
  const semanticParts: string[] = [];
  const replacements: TextReplacement[] = [];
  let length = 0;

  const appendText = (value: string): void => {
    parts.push(value);
    semanticParts.push(value);
    length += value.length;
  };
  const appendToken = (
    kind: StructureToken['kind'],
    element: Element,
    pairId?: number,
  ): number => {
    const id = pairId ?? tokens.length;
    const code = kind === 'open' ? 'B' : kind === 'close' ? 'E' : kind === 'void' ? 'V' : 'X';
    const value = `${prefix}${code}_${id}`;
    tokens.push({ id, value, kind, element: descriptor(element) });
    replacements.push({ start: length, end: length + value.length, value, kind: 'protected' });
    parts.push(value);
    length += value.length;
    return id;
  };
  const visit = (node: Node): void => {
    if (node instanceof Text) {
      appendText(node.nodeValue ?? '');
      return;
    }
    if (!(node instanceof Element)
      || BLOCKED_TAGS.has(node.tagName)
      || options.omitElement?.(node)) return;
    if (options.opaqueElement?.(node) || node.tagName === 'CODE') {
      semanticParts.push(node.textContent ?? '');
      appendToken('opaque', node);
      return;
    }
    if (!SAFE_TAGS.has(node.tagName)) {
      node.childNodes.forEach(visit);
      return;
    }
    if (VOID_TAGS.has(node.tagName)) {
      if (node.tagName === 'BR') semanticParts.push('\n');
      appendToken('void', node);
      return;
    }
    const id = appendToken('open', node);
    node.childNodes.forEach(visit);
    appendToken('close', node, id);
  };

  root.childNodes.forEach(visit);
  const parentList = root.tagName === 'LI' && root.parentElement?.matches('ul, ol')
    ? descriptor(root.parentElement)
    : undefined;
  return {
    source: parts.join(''),
    semanticSource: semanticParts.join('').replace(/\s+/gu, ' ').trim(),
    format: {
      fingerprint,
      root: rootDescriptor,
      ...(parentList ? { parentList } : {}),
      tokens,
      protectedReplacements: replacements,
    },
  };
}

/** Splits only at root-level blank lines so structural tokens never cross requests. */
export function splitDomTranslationParagraphs(
  source: string,
  format: DomTranslationFormat,
  boundary: 'paragraph' | 'line' = 'paragraph',
): readonly DomTranslationParagraphPart[] {
  const positioned = format.tokens
    .map((token) => ({ token, start: source.indexOf(token.value) }))
    .filter((entry) => entry.start >= 0)
    .sort((left, right) => left.start - right.start);
  const rootBreaks: Array<{ start: number; end: number }> = [];
  let depth = 0;

  for (const { token, start } of positioned) {
    if (token.kind === 'close') depth = Math.max(0, depth - 1);
    if (token.kind === 'void' && token.element.tagName === 'BR' && depth === 0) {
      rootBreaks.push({ start, end: start + token.value.length });
    }
    if (token.kind === 'open') depth += 1;
  }

  const separators: Array<{ start: number; end: number }> = [];
  for (let index = 0; index < rootBreaks.length;) {
    let endIndex = index;
    while (endIndex + 1 < rootBreaks.length
      && /^\s*$/u.test(source.slice(rootBreaks[endIndex]!.end, rootBreaks[endIndex + 1]!.start))) {
      endIndex += 1;
    }
    if (boundary === 'line' || endIndex > index) {
      separators.push({
        start: rootBreaks[index]!.start,
        end: rootBreaks[endIndex]!.end,
      });
    }
    index = endIndex + 1;
  }

  if (separators.length === 0) {
    return [{ kind: 'translate', source, protectedReplacements: format.protectedReplacements }];
  }

  const parts: DomTranslationParagraphPart[] = [];
  const appendTranslation = (start: number, end: number): void => {
    if (end <= start) return;
    const value = source.slice(start, end);
    if (!value.trim()) {
      parts.push({ kind: 'separator', source: value });
      return;
    }
    parts.push({
      kind: 'translate',
      source: value,
      protectedReplacements: format.protectedReplacements
        .filter((replacement) => replacement.start >= start && replacement.end <= end)
        .map((replacement) => ({
          ...replacement,
          start: replacement.start - start,
          end: replacement.end - start,
        })),
    });
  };

  let cursor = 0;
  for (const separator of separators) {
    appendTranslation(cursor, separator.start);
    parts.push({ kind: 'separator', source: source.slice(separator.start, separator.end) });
    cursor = separator.end;
  }
  appendTranslation(cursor, source.length);
  return parts;
}

function applyClickMeaning(clone: HTMLElement, source: Element): void {
  if (clone.tagName === 'A' && clone.hasAttribute('href') && !source.hasAttribute('onclick')) return;
  if (!source.matches('a[href], [role="button"], [onclick]')) return;
  clone.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (source instanceof HTMLElement) source.click();
  });
}

function createShell(
  value: SafeElementDescriptor,
  ownerDocument: Document,
): HTMLElement {
  const element = ownerDocument.createElement(value.tagName.toLocaleLowerCase('en-US'));
  value.attributes.forEach(([name, attributeValue]) => element.setAttribute(name, attributeValue));
  applyClickMeaning(element, value.source);
  return element;
}

function safeClone(source: Element, ownerDocument: Document): Node | undefined {
  if (BLOCKED_TAGS.has(source.tagName)) return undefined;
  if (!SAFE_TAGS.has(source.tagName)) {
    const fragment = ownerDocument.createDocumentFragment();
    source.childNodes.forEach((child) => {
      if (child instanceof Text) fragment.append(ownerDocument.createTextNode(child.nodeValue ?? ''));
      else if (child instanceof Element) {
        const clone = safeClone(child, ownerDocument);
        if (clone) fragment.append(clone);
      }
    });
    return fragment;
  }
  const clone = createShell(descriptor(source), ownerDocument);
  if (!VOID_TAGS.has(source.tagName)) {
    source.childNodes.forEach((child) => {
      if (child instanceof Text) clone.append(ownerDocument.createTextNode(child.nodeValue ?? ''));
      else if (child instanceof Element) {
        const childClone = safeClone(child, ownerDocument);
        if (childClone) clone.append(childClone);
      }
    });
  }
  return clone;
}

function escaped(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function renderStructuredTranslation(
  format: DomTranslationFormat,
  translated: string,
  ownerDocument: Document,
): HTMLElement {
  const root = createShell(format.root, ownerDocument);
  if (format.tokens.length === 0) {
    root.textContent = translated;
    return root;
  }

  const byValue = new Map(format.tokens.map((token) => [token.value, token]));
  const pattern = new RegExp(
    format.tokens.map(({ value }) => value).sort((left, right) => right.length - left.length)
      .map(escaped).join('|'),
    'gu',
  );
  const seen = new Set<string>();
  const stack: Array<{ id?: number; element: HTMLElement }> = [{ element: root }];
  let cursor = 0;
  for (const match of translated.matchAll(pattern)) {
    const index = match.index;
    const value = match[0];
    const token = byValue.get(value);
    if (index === undefined || !token || seen.has(value)) {
      throw new PlaceholderIntegrityError(['protected'], 'DOM 구조 보호 토큰이 중복되거나 손상되었습니다.');
    }
    seen.add(value);
    if (index > cursor) stack.at(-1)!.element.append(ownerDocument.createTextNode(translated.slice(cursor, index)));
    if (token.kind === 'open') {
      const element = createShell(token.element, ownerDocument);
      stack.at(-1)!.element.append(element);
      stack.push({ id: token.id, element });
    } else if (token.kind === 'close') {
      if (stack.length === 1 || stack.at(-1)!.id !== token.id) {
        throw new PlaceholderIntegrityError(['protected'], 'DOM 구조 보호 토큰의 중첩 순서가 손상되었습니다.');
      }
      stack.pop();
    } else if (token.kind === 'void') {
      stack.at(-1)!.element.append(createShell(token.element, ownerDocument));
    } else {
      const clone = safeClone(token.element.source, ownerDocument);
      if (clone) stack.at(-1)!.element.append(clone);
    }
    cursor = index + value.length;
  }
  if (seen.size !== format.tokens.length || stack.length !== 1) {
    throw new PlaceholderIntegrityError(['protected'], 'DOM 구조 보호 토큰의 개수 또는 중첩이 손상되었습니다.');
  }
  if (cursor < translated.length) root.append(ownerDocument.createTextNode(translated.slice(cursor)));
  return root;
}

export function cloneStructuredListShell(
  format: DomTranslationFormat,
  ownerDocument: Document,
): HTMLElement | undefined {
  return format.parentList ? createShell(format.parentList, ownerDocument) : undefined;
}
