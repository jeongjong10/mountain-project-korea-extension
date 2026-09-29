import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const snapshot = JSON.parse(await readFile('design/review/translation-policy-baseline-2026-09-29.json', 'utf8'));
const policyPath = 'src/sites/mountain-project/translation/mountain-project-translation-policy.ts';
const bundle = await build({
  stdin: { contents: `
    import { MountainProjectTranslationPolicy as Current } from './${policyPath}';
    import { MountainProjectTranslationPolicy as Previous } from 'baseline:${policyPath}';
    import { TRANSLATION_QUALITY_CORPUS } from './test/fixtures/mountain-project/translation-quality-corpus.ts';
    window.comparisonInputs = TRANSLATION_QUALITY_CORPUS.map(entry => {
      const prepare = Policy => {
        const policy = new Policy();
        return policy.prepare({ text: entry.source, trustedValues: [], context: {
          category: entry.category, pageKind: 'route', policyVersion: policy.policyVersion,
          glossaryVersion: policy.glossaryVersion,
        }});
      };
      return { ...entry, previous: prepare(Previous), current: prepare(Current) };
    });`, resolveDir: root, loader: 'ts' },
  bundle: true, write: false, format: 'iife', platform: 'browser',
  plugins: [{ name: 'baseline', setup(builder) {
    builder.onResolve({ filter: /^baseline:/ }, args => ({ path: args.path.slice(9), namespace: 'baseline' }));
    builder.onResolve({ filter: /^\./, namespace: 'baseline' }, args => {
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(args.importer), args.path)) + '.ts';
      return snapshot.files[resolved] ? { path: resolved, namespace: 'baseline' } : { path: path.resolve(root, resolved) };
    });
    builder.onLoad({ filter: /.*/, namespace: 'baseline' }, args => ({ contents: snapshot.files[args.path], loader: 'ts' }));
  }}],
});
const script = bundle.outputFiles[0].text;
const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>번역 정책 비교</title>
<style>body{font:16px system-ui;max-width:1100px;margin:40px auto}pre{white-space:pre-wrap}td,th{border:1px solid #bbb;padding:10px;vertical-align:top}table{border-collapse:collapse}button{padding:12px;margin:10px}</style>
<h1>Translator API 정책 비교</h1><p>합성 원문 40개. 이전 정책 / 개선 정책 / 원문 직접 호출. 결과는 의미 품질 판정이 아닙니다. Chrome 메뉴 번역은 별도로 비교하세요.</p>
<button id="run">언어팩 준비 및 비교 시작</button><button id="save" disabled>JSON 저장</button><pre id="status">API 확인 중</pre><table><thead><tr><th>원문</th><th>이전 정책</th><th>개선 정책</th><th>직접 호출</th></tr></thead><tbody id="rows"></tbody></table>
<script>${script.replaceAll('</script', '<\\/script')}</script><script>
const status = document.querySelector('#status');
const pair = {sourceLanguage:'en',targetLanguage:'ko'};
const result = {createdAt:new Date().toISOString(),userAgent:navigator.userAgent,sourceLanguage:'en',targetLanguage:'ko',rows:[]};
async function available(){try{status.textContent='API 상태: '+(globalThis.Translator ? await Translator.availability(pair) : 'unsupported')}catch(e){status.textContent=String(e)}}
available();
document.querySelector('#run').onclick=async()=>{
 document.querySelector('#run').disabled=true; let translator;
 try{
  translator=await Translator.create({...pair,monitor(m){m.addEventListener('downloadprogress',e=>{status.textContent='언어팩 다운로드: '+Math.round(e.loaded*100)+'%'})}});
  for(const [index,item] of window.comparisonInputs.entries()){
   status.textContent='비교 중 '+(index+1)+'/'+window.comparisonInputs.length;
   const row={source:item.source,category:item.category,reviewHint:item.expected};
   // Rotate order to reduce systematic warm-up bias. Timing is descriptive only.
   const modes=['previous','current','direct'];
   for(const mode of [...modes.slice(index%3),...modes.slice(0,index%3)]){
    const prepared=item[mode]; const input=prepared?.text??item.source;const started=performance.now();
    try{const raw=await translator.translate(input);row[mode]={input,raw,output:prepared?prepared.restore(raw):raw,milliseconds:performance.now()-started};}
    catch(e){row[mode]={input,error:String(e),milliseconds:performance.now()-started};}
   }
   result.rows.push(row);const tr=document.createElement('tr');
   for(const value of [row.source,...modes.map(mode=>row[mode].output??row[mode].error)]){const td=document.createElement('td');td.textContent=value;tr.append(td)}
   document.querySelector('#rows').append(tr);
  }
  status.textContent='완료: '+result.rows.length+'개. 의미 정확도와 자연스러움은 별도 평가 필요.';
 }catch(e){status.textContent=String(e)}finally{translator?.destroy();document.querySelector('#save').disabled=false}
};
document.querySelector('#save').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='translation-comparison.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
</script></html>`;
await writeFile('design/review/translation-comparison.html',html);
console.log('Built design/review/translation-comparison.html');
