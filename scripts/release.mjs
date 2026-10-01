import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const STORE_ID = 'ijgghnbmgbapfckfnkcapbkbbobjochh';
const hosts = ['https://mountainproject.com/*', 'https://www.mountainproject.com/*'];
const hash = (data) => createHash('sha256').update(data).digest('hex');
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
const save = (path, data) => writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

export function versionParts(value) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)) throw Error('버전은 0.1.1 같은 숫자 3자리 형식이어야 합니다.');
  const parts = value.split('.').map(Number);
  if (parts.some(n => n > 65535) || parts.every(n => n === 0)) throw Error('Chrome 버전 범위를 벗어났습니다.');
  return parts;
}
export function newer(next, current) {
  const a = versionParts(next), b = versionParts(current);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
}
function clean(cwd) {
  if (git(cwd, 'status', '--porcelain', '--untracked-files=all')) throw Error('미커밋 변경이 있습니다. 소스·문서·버전을 검토하고 커밋한 뒤 다시 실행하세요.');
}
export function bump(cwd, next) {
  versionParts(next);
  const pkgPath = join(cwd, 'package.json'), lockPath = join(cwd, 'package-lock.json');
  const pkg = json(pkgPath), lock = json(lockPath);
  if (!newer(next, pkg.version)) throw Error('새 버전은 현재 버전보다 커야 합니다.');
  if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) throw Error('package.json과 lockfile 버전이 다릅니다.');
  pkg.version = next; lock.version = next; lock.packages[''].version = next;
  save(pkgPath, pkg); save(lockPath, lock);
}
// Read the actual ZIP, not only the build directory. ZIP64/encrypted/oversized archives fail closed.
export function zipEntries(bytes) {
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (bytes.readUInt32LE(i) === 0x06054b50 && i + 22 + bytes.readUInt16LE(i + 20) === bytes.length) { end = i; break; }
  }
  if (end < 0) throw Error('유효한 ZIP 종료 레코드가 없습니다.');
  const count = bytes.readUInt16LE(end + 10), size = bytes.readUInt32LE(end + 12);
  let at = bytes.readUInt32LE(end + 16), total = 0;
  const stop = at + size, result = new Map();
  if (bytes.readUInt32LE(end + 4) !== 0 || count !== bytes.readUInt16LE(end + 8) || count > 1000 || stop !== end) throw Error('지원하지 않는 ZIP 구조입니다.');
  for (let i = 0; i < count; i++) {
    if (at + 46 > stop || bytes.readUInt32LE(at) !== 0x02014b50) throw Error('ZIP 중앙 디렉터리가 손상되었습니다.');
    const flags = bytes.readUInt16LE(at + 8), method = bytes.readUInt16LE(at + 10);
    const compressed = bytes.readUInt32LE(at + 20), raw = bytes.readUInt32LE(at + 24);
    const n = bytes.readUInt16LE(at + 28), extra = bytes.readUInt16LE(at + 30), comment = bytes.readUInt16LE(at + 32);
    const local = bytes.readUInt32LE(at + 42);
    if (at + 46 + n + extra + comment > stop || local + 30 > bytes.length) throw Error('ZIP 범위를 벗어났습니다.');
    const name = bytes.subarray(at + 46, at + 46 + n).toString('utf8');
    if (!name || name.startsWith('/') || name.includes('\\') || name.split('/').includes('..') || result.has(name)) throw Error('안전하지 않거나 중복된 ZIP 경로입니다.');
    if ((flags & 1) || ![0, 8].includes(method) || raw > 25_000_000 || (total += raw) > 50_000_000) throw Error('허용하지 않는 ZIP 크기/압축 방식입니다.');
    if (bytes.readUInt32LE(local) !== 0x04034b50) throw Error('ZIP 로컬 헤더가 없습니다.');
    const localNameLength = bytes.readUInt16LE(local + 26);
    const start = local + 30 + localNameLength + bytes.readUInt16LE(local + 28);
    if (start + compressed > bytes.readUInt32LE(end + 16) || bytes.subarray(local + 30, local + 30 + localNameLength).toString('utf8') !== name) throw Error('ZIP 파일 헤더가 일치하지 않습니다.');
    const packed = bytes.subarray(start, start + compressed);
    const data = method === 8 ? inflateRawSync(packed, { maxOutputLength: 25_000_000 }) : packed;
    if (data.length !== raw) throw Error('ZIP 파일 크기가 일치하지 않습니다.');
    result.set(name, data); at += 46 + n + extra + comment;
  }
  if (at !== stop) throw Error('ZIP 디렉터리 길이가 일치하지 않습니다.');
  return result;
}
export function inspectZip(bytes, version) {
  const files = zipEntries(bytes);
  const manifest = JSON.parse(files.get('manifest.json')?.toString() ?? '{}');
  const same = (a, b) => JSON.stringify([...(a ?? [])].sort()) === JSON.stringify([...b].sort());
  if (manifest.version !== version || manifest.manifest_version !== 3 || manifest.name !== 'Mountain Project Korea (비공식)') throw Error('ZIP 제품명·버전·MV3가 일치하지 않습니다.');
  if (!same(manifest.permissions, ['storage']) || !same(manifest.host_permissions, hosts) || (manifest.optional_permissions?.length || manifest.optional_host_permissions?.length)) throw Error('권한이 출시 기준과 다릅니다. 개인정보·스토어 문안과 함께 검토하세요.');
  if (manifest.content_scripts?.length !== 1 || !same(manifest.content_scripts[0].matches, hosts)) throw Error('콘텐츠 스크립트 호스트가 다릅니다.');
  const required = ['THIRD_PARTY_NOTICES.txt', manifest.action?.default_popup, ...Object.values(manifest.icons ?? {}), ...manifest.content_scripts.flatMap(s => s.js ?? [])];
  if (required.some(p => !p || !files.has(p))) throw Error('패키지 참조 파일 또는 고지가 없습니다.');
  for (const name of files.keys()) {
    if (!/^(manifest\.json|popup\.html|THIRD_PARTY_NOTICES\.txt|(?:assets|chunks|content-scripts|icon)\/[\w./-]+)$/.test(name) || /\.(map|ts)$/.test(name)) throw Error(`예상 밖의 배포 파일: ${name}`);
  }
  return { manifest, files: Object.fromEntries([...files].map(([name, data]) => [name, hash(data)])) };
}
function sourceState(cwd) {
  clean(cwd);
  return git(cwd, 'rev-parse', 'HEAD');
}
function npmRun(cwd, args) {
  if (!process.env.npm_execpath) throw Error('npm run release -- ... 형식으로 실행하세요.');
  execFileSync(process.execPath, [process.env.npm_execpath, ...args], { cwd, stdio: 'inherit' });
}
export function prepare(cwd, run = args => npmRun(cwd, args)) {
  const commit = sourceState(cwd), pkg = json(join(cwd, 'package.json'));
  versionParts(pkg.version);
  const lock = json(join(cwd, 'package-lock.json'));
  if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) throw Error('버전과 lockfile이 일치하지 않습니다.');
  if (!readFileSync(join(cwd, 'CHANGELOG.md'), 'utf8').includes(`## ${pkg.version} `)) throw Error('CHANGELOG에 해당 버전의 변경 내역을 먼저 작성하세요.');
  const dest = join(cwd, '.output', 'releases', pkg.version);
  if (existsSync(dest)) throw Error('같은 버전의 배포 기록이 이미 있습니다. 기존 파일을 덮어쓰지 않습니다.');
  const zipName = `${pkg.name}-${pkg.version}-chrome.zip`, zipPath = join(cwd, '.output', zipName);
  rmSync(zipPath, { force: true });
  run(['ci']);
  run(['run', 'typecheck']);
  run(['run', 'typecheck:test']);
  run(['run', 'test:release']);
  run(['exec', '--', 'vitest', 'run', '--maxWorkers=4']);
  run(['run', 'zip']);
  if (sourceState(cwd) !== commit) throw Error('검증 중 소스 커밋이 바뀌었습니다. 다시 준비하세요.');
  const bytes = readFileSync(zipPath), checked = inspectZip(bytes, pkg.version);
  mkdirSync(dest, { recursive: true });
  writeFileSync(join(dest, zipName), bytes);
  save(join(dest, 'release.json'), { schema: 1, version: pkg.version, commit, zip: zipName, sha256: hash(bytes), createdAt: new Date().toISOString(), storeId: STORE_ID, status: 'prepared', ...checked });
  writeFileSync(join(dest, 'CHECKLIST.md'), `# ${pkg.version} 배포\n\n준비 완료는 스토어 제출·승인이 아닙니다.\n\n- [ ] 이 ZIP을 Chrome에 설치해 번역·원문·재번역·ON/OFF·지도·통계와 변경 기능 확인\n- [ ] README·변경 내역·Notion·권한·개인정보·스토어 설명 대조\n- [ ] npm run release -- verify ${pkg.version}\n- [ ] 소스 커밋 ${commit}의 GitHub 반영 확인\n- [ ] 기존 스토어 항목 ${STORE_ID}에 ${zipName} 업로드\n- [ ] 심사 제출 및 승인 후 자동 게시 설정 확인\n- [ ] 승인·공개 버전 확인 후 로컬·Notion 출시 상태 갱신\n\nZIP SHA-256: ${hash(bytes)}\n`);
  return dest;
}
export function verify(cwd, version) {
  versionParts(version);
  const dest = join(cwd, '.output', 'releases', version), receipt = json(join(dest, 'release.json'));
  const pkg = json(join(cwd, 'package.json'));
  if (receipt.schema !== 1 || receipt.version !== version || pkg.version !== version || receipt.storeId !== STORE_ID || receipt.zip !== `${pkg.name}-${version}-chrome.zip`) throw Error('배포 기록이 현재 버전과 일치하지 않습니다.');
  if (sourceState(cwd) !== receipt.commit) throw Error('준비 이후 소스가 바뀌었습니다. 현재 코드를 검증한 ZIP이 아닙니다.');
  const bytes = readFileSync(join(dest, receipt.zip));
  if (hash(bytes) !== receipt.sha256) throw Error('준비 이후 ZIP이 변경되었습니다. 업로드하지 마세요.');
  const checked = inspectZip(bytes, version);
  if (JSON.stringify(checked.files) !== JSON.stringify(receipt.files)) throw Error('ZIP 파일 목록이 배포 기록과 다릅니다.');
  return join(dest, receipt.zip);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, value, ...extra] = process.argv.slice(2);
    if (extra.length) throw Error('인수가 너무 많습니다.');
    if (command === 'version' && value) { bump(root, value); console.log('버전 갱신 완료. 변경 내역·문서를 정리하고 커밋한 뒤 prepare를 실행하세요.'); }
    else if (command === 'prepare' && !value) console.log('준비 완료:', prepare(root));
    else if (command === 'verify' && value) console.log('업로드 파일 확인 완료:', verify(root, value));
    else if (!command || command === 'help') console.log('npm run release -- version 0.1.1\nnpm run release -- prepare\nnpm run release -- verify 0.1.1\n스토어 업로드·Git 커밋·Notion 수정은 자동 수행하지 않습니다.');
    else throw Error('사용법: version <버전> | prepare | verify <버전>');
  } catch (error) { console.error('배포 중단:', error.message); process.exitCode = 1; }
}
