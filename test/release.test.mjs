import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { deflateRawSync } from 'node:zlib';
import { bump, newer, versionParts, zipEntries, inspectZip, prepare, verify, releaseArguments, STORE_ID } from '../scripts/release.mjs';

function zip(files) {
  const local = [], central = []; let offset = 0;
  for (const [name, value] of Object.entries(files)) {
    const n = Buffer.from(name), raw = Buffer.from(value), packed = deflateRawSync(raw);
    const h = Buffer.alloc(30); h.writeUInt32LE(0x04034b50); h.writeUInt16LE(8, 8);
    h.writeUInt32LE(packed.length, 18); h.writeUInt32LE(raw.length, 22); h.writeUInt16LE(n.length, 26);
    const c = Buffer.alloc(46); c.writeUInt32LE(0x02014b50); c.writeUInt16LE(8, 10);
    c.writeUInt32LE(packed.length, 20); c.writeUInt32LE(raw.length, 24); c.writeUInt16LE(n.length, 28); c.writeUInt32LE(offset, 42);
    local.push(h, n, packed); central.push(c, n); offset += h.length + n.length + packed.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(Object.keys(files).length, 8); end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, cd, end]);
}
function archive(version = '0.1.1', patch = {}, extra = {}) {
  return zip({
    'manifest.json': JSON.stringify({ name: 'Mountain Project Korea (비공식)', version, manifest_version: 3,
      permissions: ['storage'], host_permissions: ['https://mountainproject.com/*', 'https://www.mountainproject.com/*'],
      action: { default_popup: 'popup.html' }, icons: { 128: 'icon/128.png' },
      content_scripts: [{ matches: ['https://mountainproject.com/*', 'https://www.mountainproject.com/*'], js: ['content-scripts/content.js'] }], ...patch }),
    'popup.html': '<html></html>', 'icon/128.png': 'fixture', 'content-scripts/content.js': 'void 0;', 'THIRD_PARTY_NOTICES.txt': 'notices', ...extra,
  });
}
function repo(t) {
  const dir = mkdtempSync(join(tmpdir(), 'mpkr-release-')); t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'example', version: '0.1.1' }));
  writeFileSync(join(dir, 'package-lock.json'), JSON.stringify({ version: '0.1.1', packages: { '': { version: '0.1.1' } } }));
  writeFileSync(join(dir, 'CHANGELOG.md'), '## 0.1.1 — test\n'); writeFileSync(join(dir, '.gitignore'), '.output/\n');
  const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'pipe' });
  git('init'); git('config', 'user.email', 'test@example.invalid'); git('config', 'user.name', 'Release test'); git('add', '.'); git('commit', '-m', 'fixture');
  return { dir, git };
}
function build(dir, calls, browser = 'chrome') {
  return args => {
    calls.push(args.join(' '));
    if (args.join(' ') === (browser === 'chrome' ? 'run zip' : 'run zip:whale')) {
      mkdirSync(join(dir, '.output'), { recursive: true });
      writeFileSync(join(dir, `.output/example-0.1.1-${browser}.zip`), archive());
    }
  };
}
test('versions reject downgrades, leading zeros and Chrome overflow', () => {
  assert.equal(newer('0.2.0', '0.1.9'), true); assert.equal(newer('0.1.0', '0.1.0'), false);
  for (const v of ['../1.0', '1.0.0-beta', '01.0.0', '65536.0.0', '0.0.0']) assert.throws(() => versionParts(v));
});
test('version change keeps package and lock in sync and refuses inconsistent input', t => {
  const { dir } = repo(t); bump(dir, '0.1.2');
  assert.equal(JSON.parse(readFileSync(join(dir, 'package-lock.json'))).packages[''].version, '0.1.2');
  assert.throws(() => bump(dir, '0.1.1'));
  writeFileSync(join(dir, 'package-lock.json'), '{}'); assert.throws(() => bump(dir, '0.1.3'));
});
test('actual ZIP inspection rejects incorrect version, permissions, unexpected files and malformed archives', () => {
  assert.equal(inspectZip(archive(), '0.1.1').manifest.version, '0.1.1');
  assert.throws(() => inspectZip(archive(), '0.1.2'));
  assert.throws(() => inspectZip(archive('0.1.1', { permissions: ['storage', 'tabs'] }), '0.1.1'));
  assert.throws(() => inspectZip(archive('0.1.1', {}, { 'test/private.txt': 'no' }), '0.1.1'));
  assert.throws(() => zipEntries(zip({ '../secret': 'no' })));
  assert.throws(() => zipEntries(archive().subarray(0, 40)));
});
test('prepare runs ordered gates, creates immutable receipt and detects ZIP tampering', t => {
  const { dir } = repo(t), calls = []; const dest = prepare(dir, build(dir, calls));
  assert.deepEqual(calls, ['ci', 'run typecheck', 'run typecheck:test', 'run test:release', 'exec -- vitest run --maxWorkers=4', 'run zip']);
  const receipt = JSON.parse(readFileSync(join(dest, 'release.json')));
  assert.equal(receipt.schema, 2);
  assert.equal(receipt.browser, 'chrome');
  assert.equal(receipt.storeId, STORE_ID);
  assert.ok(receipt.checks.every(check => check.status === 'passed'));
  assert.ok(verify(dir, '0.1.1').endsWith('.zip'));
  assert.throws(() => prepare(dir, build(dir, [])), /이미/);
  writeFileSync(join(dest, 'example-0.1.1-chrome.zip'), 'tampered'); assert.throws(() => verify(dir, '0.1.1'), /ZIP이 변경/);
});
test('dirty source, changed commit and failed validation never pass release gates', t => {
  const { dir, git } = repo(t);
  writeFileSync(join(dir, 'unfinished.ts'), 'work'); assert.throws(() => prepare(dir, () => assert.fail('must not run')), /미커밋/);
  rmSync(join(dir, 'unfinished.ts'));
  assert.throws(() => prepare(dir, () => { throw Error('test failure'); }), /test failure/);
  assert.equal(existsSync(join(dir, '.output/releases/0.1.1/release.json')), false);
  prepare(dir, build(dir, [])); writeFileSync(join(dir, 'CHANGELOG.md'), '## 0.1.1 — changed\n');
  assert.throws(() => verify(dir, '0.1.1'), /미커밋/);
  git('add', '.'); git('commit', '-m', 'new source'); assert.throws(() => verify(dir, '0.1.1'), /소스가 바뀌/);
});

test('prepare rejects source edits made during validation and creates no receipt', t => {
  const { dir } = repo(t), run = build(dir, []);
  assert.throws(() => prepare(dir, args => {
    run(args);
    if (args.join(' ') === 'run zip') writeFileSync(join(dir, 'CHANGELOG.md'), 'changed during build');
  }), /미커밋/);
  assert.equal(existsSync(join(dir, '.output/releases/0.1.1/release.json')), false);
});

test('Whale preparation is isolated from Chrome, records browser gates and never embeds the Chrome store ID', t => {
  const { dir } = repo(t), calls = [];
  const chrome = prepare(dir, build(dir, []));
  const whale = prepare(dir, build(dir, calls, 'whale'), 'whale');
  assert.equal(chrome, join(dir, '.output/releases/0.1.1'));
  assert.equal(whale, join(dir, '.output/releases/whale/0.1.1'));
  assert.equal(calls.at(-1), 'run zip:whale');
  const receiptText = readFileSync(join(whale, 'release.json'), 'utf8');
  const receipt = JSON.parse(receiptText);
  assert.equal(receipt.browser, 'whale');
  assert.equal(receipt.schema, 2);
  assert.equal(receipt.status, 'prepared');
  assert.match(receipt.commit, /^[a-f0-9]{40}$/);
  assert.match(receipt.sha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(receipt.checks.at(-1), { command: ['inspect-zip', 'whale'], status: 'passed' });
  assert.equal('storeId' in receipt, false);
  assert.equal(receiptText.includes(STORE_ID), false);
  const checklist = readFileSync(join(whale, 'CHECKLIST.md'), 'utf8');
  assert.equal(checklist.includes(STORE_ID), false);
  assert.ok(checklist.includes('verify 0.1.1 --browser whale'));
  assert.ok(verify(dir, '0.1.1', 'whale').endsWith('-whale.zip'));
  assert.ok(verify(dir, '0.1.1').endsWith('-chrome.zip'));
  assert.throws(() => prepare(dir, build(dir, [], 'whale'), 'whale'), /이미/);
});

test('old schema 1 Chrome receipts remain verifiable but cannot be used for Whale', t => {
  const { dir } = repo(t), dest = prepare(dir, build(dir, []));
  const receipt = JSON.parse(readFileSync(join(dest, 'release.json')));
  receipt.schema = 1; delete receipt.browser; delete receipt.checks;
  writeFileSync(join(dest, 'release.json'), JSON.stringify(receipt));
  assert.ok(verify(dir, '0.1.1').endsWith('-chrome.zip'));
  const whale = join(dir, '.output/releases/whale/0.1.1'); mkdirSync(whale, { recursive: true });
  writeFileSync(join(whale, 'release.json'), JSON.stringify(receipt));
  assert.throws(() => verify(dir, '0.1.1', 'whale'), /브라우저/);
});

test('Whale verify rejects browser, filename, store and check-result mismatches', t => {
  const { dir } = repo(t), dest = prepare(dir, build(dir, [], 'whale'), 'whale');
  const file = join(dest, 'release.json'), original = JSON.parse(readFileSync(file));
  for (const patch of [
    { browser: 'chrome' }, { zip: 'example-0.1.1-chrome.zip' }, { storeId: STORE_ID },
    { checks: [] }, { checks: [{ command: ['inspect-zip', 'whale'], status: 'failed' }] }, { version: '0.1.2' },
  ]) {
    writeFileSync(file, JSON.stringify({ ...original, ...patch }));
    assert.throws(() => verify(dir, '0.1.1', 'whale'), /브라우저/);
  }
  writeFileSync(file, JSON.stringify(original));
  writeFileSync(join(dest, original.zip), 'tampered');
  assert.throws(() => verify(dir, '0.1.1', 'whale'), /ZIP이 변경/);
});

test('Whale prepare refuses a Chrome-named output and validation failure produces no receipt', t => {
  const { dir } = repo(t);
  assert.throws(() => prepare(dir, args => {
    if (args.join(' ') === 'run zip:whale') build(dir, [])(['run', 'zip']);
  }, 'whale'), /ENOENT/);
  assert.equal(existsSync(join(dir, '.output/releases/whale/0.1.1/release.json')), false);
  assert.throws(() => prepare(dir, () => { throw Error('whale gate failure'); }, 'whale'), /whale gate/);
  assert.equal(existsSync(join(dir, '.output/releases/whale/0.1.1/release.json')), false);
});

test('actual Whale ZIP inspection applies the manifest, reference and browser guards', () => {
  assert.equal(inspectZip(archive(), '0.1.1', 'whale').manifest.manifest_version, 3);
  for (const patch of [
    { manifest_version: 2 }, { browser_action: {} }, { sidebar_action: {} },
    { action: { default_popup: 'https://example.com/popup.html' } },
    { action: { default_popup: '../popup.html' } }, { icons: { 16: 'icon/missing.png' } },
    { action: { default_popup: 'popup.html', default_icon: 'icon/missing.png' } },
    { permissions: ['storage', 'scripting'] },
  ]) assert.throws(() => inspectZip(archive('0.1.1', patch), '0.1.1', 'whale'));
  assert.throws(() => inspectZip(archive('0.1.1', {}, { 'popup.html': '' }), '0.1.1', 'whale'));
  assert.throws(() => inspectZip(archive(), '0.1.1', 'firefox'), /browser/);
});

test('CLI retains Chrome defaults and parses only supported browser selectors', () => {
  assert.deepEqual(releaseArguments(['prepare']), { command: 'prepare', value: undefined, browser: 'chrome' });
  assert.deepEqual(releaseArguments(['verify', '0.1.1', '--browser', 'whale']), { command: 'verify', value: '0.1.1', browser: 'whale' });
  assert.equal(releaseArguments(['prepare', '--browser', 'whale']).browser, 'whale');
  assert.equal(releaseArguments(['verify', '0.1.1', '--browser', 'chrome']).browser, 'chrome');
  assert.equal(releaseArguments(['version', '0.1.2']).command, 'version');
  for (const args of [
    ['prepare', '--browser'], ['prepare', '--browser', 'firefox'], ['prepare', '--browser', '../whale'],
    ['prepare', 'whale'], ['verify', '--browser', 'whale'], ['version', '0.1.2', '--browser', 'whale'],
    ['prepare', '--browser', 'whale', '--browser', 'chrome'], ['prepare', '--other', 'whale'],
  ]) assert.throws(() => releaseArguments(args));
});
