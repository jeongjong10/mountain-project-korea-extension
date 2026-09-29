import { PageTranslationController } from '@/localization/page-translation-controller';
import { TranslationLedger } from '@/core/translation-record';
import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';
import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';
import { TranslationNotice } from '@/ui/translation-notice';
import type { TranslationProvider } from '@/core/translation-provider';
import { PlaceholderIntegrityError } from '@/core/translation-text-policy';

let controller: PageTranslationController;
const settle = async () => { await new Promise(resolve => setTimeout(resolve, 0)); };
const notice = () => document.querySelector<HTMLElement>('.mpkr-translation-notice');
const button = () => notice()!.querySelector<HTMLButtonElement>('button')!;
const source = '<section><h2>Description</h2><div class="fr-view"><p>A classic crack above the valley.</p></div></section>';
function setup(availability: 'available' | 'downloadable' | 'unavailable') {
  document.body.innerHTML = source;
  const provider = {
    id: 'notice-test',
    availability: vi.fn<TranslationProvider['availability']>(async () => availability),
    translate: vi.fn<TranslationProvider['translate']>(async () => '계곡 위의 멋진 크랙.'),
  };
  const view = new TranslationNotice(() => controller.retry());
  controller = new PageTranslationController(provider, new TranslationLedger(),
    new MountainProjectPageAdapter(), new OriginalPreservingRenderer(),
    { onNoticeChange: state => view.render(state) });
  return provider;
}
afterEach(() => controller?.destroy());

it('keeps successful translation quiet and removes all UI on disposal', async () => {
  const provider = setup('available');
  await controller.start(); await settle();
  expect(provider.translate).toHaveBeenCalledTimes(1);
  expect(notice()).toBeNull();
  controller.destroy();
  expect(document.body.innerHTML).toBe(source);
});

it('shows only one unsupported notice, preserves the original, and cleans up across OFF/ON', async () => {
  const provider = setup('unavailable');
  await controller.start(); await settle();
  expect(notice()?.dataset.state).toBe('unsupported');
  expect(button().hidden).toBe(true);
  expect(notice()?.querySelector('a')?.hidden).toBe(false);
  expect(document.querySelector('.fr-view p')?.textContent).toBe('A classic crack above the valley.');
  expect(provider.translate).not.toHaveBeenCalled();
  await settle();
  expect(document.querySelectorAll('.mpkr-translation-notice')).toHaveLength(1);
  controller.destroy();
  expect(document.body.innerHTML).toBe(source);
  expect(document.querySelector('[data-mpkr-translation-notice]')).toBeNull();
  await controller.start(); await settle();
  expect(document.querySelectorAll('.mpkr-translation-notice')).toHaveLength(1);
});

it('starts preparation from one button click, prevents duplicate work, and hides the notice after success', async () => {
  const provider = setup('downloadable');
  let finish!: (value: string) => void;
  provider.translate.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  await controller.start(); await settle();
  expect(notice()?.dataset.state).toBe('waiting');
  button().click();
  await settle();
  expect(notice()?.dataset.state).toBe('preparing');
  expect(button().disabled).toBe(true);
  button().click();
  expect(provider.translate).toHaveBeenCalledTimes(1);
  finish('계곡 위의 멋진 크랙.');
  await settle();
  expect(notice()).toBeNull();
});

it('offers recovery after availability or translation failure without hiding the original', async () => {
  const provider = setup('available');
  provider.availability.mockRejectedValueOnce(new Error('query failed'));
  await controller.start(); await settle();
  expect(notice()?.dataset.state).toBe('failed');
  provider.translate.mockRejectedValueOnce(new Error('model failed'));
  button().click(); await settle();
  expect(notice()).toBeNull();
  expect(document.querySelector<HTMLElement>('.mpkr-translation-status')?.hidden).toBe(false);
  expect(document.querySelector('.fr-view > p')?.textContent).toBe('A classic crack above the valley.');
  document.querySelector<HTMLButtonElement>('.mpkr-retranslate')!.click(); await settle();
  expect(notice()).toBeNull();
});

it('silences integrity rejection and repeated manual retry while retaining the original', async () => {
  const provider = setup('available');
  provider.translate.mockRejectedValue(new PlaceholderIntegrityError(['protected']));
  await controller.start(); await settle();
  expect(notice()).toBeNull();
  expect(document.querySelector<HTMLElement>('.mpkr-translation-status')?.hidden).toBe(true);
  expect(document.querySelector('.mpkr-translation-status')?.textContent).toBe('');
  expect(document.querySelector<HTMLElement>('.fr-view > p')?.style.display).toBe('');
  await controller.retry(); await settle();
  expect(provider.translate).toHaveBeenCalledTimes(1);

  const retry = document.querySelector<HTMLButtonElement>('.mpkr-retranslate')!;
  retry.click(); await settle();
  expect(provider.translate).toHaveBeenCalledTimes(2);
  expect(notice()).toBeNull();
  expect(document.querySelector<HTMLElement>('.mpkr-translation-feedback')?.hidden).toBe(true);
  retry.click(); await settle();
  expect(provider.translate).toHaveBeenCalledTimes(2);
  expect(document.querySelector<HTMLElement>('.mpkr-translation-feedback')?.hidden).toBe(true);
  controller.destroy();
  expect(document.body.innerHTML).toBe(source);
});

it('keeps a provider failure retryable after a quiet integrity rejection', async () => {
  const provider = setup('available');
  provider.translate.mockRejectedValueOnce(new PlaceholderIntegrityError(['protected']))
    .mockRejectedValueOnce(new Error('provider offline'));
  await controller.start(); await settle();
  document.querySelector<HTMLButtonElement>('.mpkr-retranslate')!.click(); await settle();
  expect(document.querySelector<HTMLElement>('.mpkr-translation-status')?.hidden).toBe(false);
  expect(document.querySelector('.mpkr-translation-status')?.textContent).toContain('잠시 후 재번역');
  await controller.retry(); await settle();
  expect(provider.translate).toHaveBeenCalledTimes(3);
  expect(document.querySelector('.mpkr-translation-body')?.textContent).toBe('계곡 위의 멋진 크랙.');
  expect(notice()).toBeNull();
});

it('continues showing recoverable errors beside silently preserved content', async () => {
  const provider = setup('available');
  document.querySelector('.fr-view')!.insertAdjacentHTML('beforeend', '<p>A second paragraph.</p>');
  provider.translate.mockRejectedValueOnce(new PlaceholderIntegrityError(['protected']))
    .mockRejectedValueOnce(new Error('network offline'));
  await controller.start(); await settle();
  expect(document.querySelector<HTMLElement>('.mpkr-translation-status')?.hidden).toBe(false);
  expect(document.querySelector('.mpkr-translation-status')?.textContent).toContain('잠시 후 재번역');
  await controller.retry(); await settle();
  expect(provider.translate).toHaveBeenCalledTimes(3);
  expect(document.querySelector<HTMLElement>('.fr-view > p')?.style.display).toBe('');
  expect(document.querySelector<HTMLElement>('.mpkr-translation-status')?.hidden).toBe(true);
  expect(notice()).toBeNull();
});

it('does not reinsert a notice when a pending preparation settles after OFF', async () => {
  const provider = setup('downloadable');
  let fail!: (reason: Error) => void;
  provider.translate.mockImplementationOnce(() => new Promise((_resolve, reject) => { fail = reject; }));
  await controller.start(); await settle();
  button().click(); await settle();
  controller.destroy();
  fail(new Error('late failure')); await settle();
  expect(notice()).toBeNull();
  expect(document.body.innerHTML).toBe(source);
});

it('does not show an engine notice on a page without authored translation targets', async () => {
  const provider = setup('unavailable');
  document.body.innerHTML = '<main><h1>Route Finder</h1></main>';
  await controller.start(); await settle();
  expect(provider.availability).not.toHaveBeenCalled();
  expect(notice()).toBeNull();
});

it('removes a stale notice when its source content is removed', async () => {
  setup('unavailable');
  await controller.start(); await settle();
  document.querySelector('section')!.remove();
  await settle();
  expect(notice()).toBeNull();
});

it('keeps the preparation action outside a collapsed authored section', async () => {
  setup('downloadable');
  document.body.innerHTML = '<section><h2>Description</h2><div class="mpkr-area-section-body" hidden><div class="fr-view"><p>A classic crack above the valley.</p></div></div></section>';
  await controller.start(); await settle();
  expect(notice()?.dataset.state).toBe('waiting');
  expect(notice()?.closest('[hidden]')).toBeNull();
  expect(notice()?.nextElementSibling?.classList.contains('mpkr-area-section-body')).toBe(true);
});
