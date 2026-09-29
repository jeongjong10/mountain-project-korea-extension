import { AreaPagePresentation } from '@/ui/area-page-presentation';

describe('AreaPagePresentation', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = `
      <div id="climb-area-page">
        <div class="float-xs-right ml-1">
          <div id="photo-carousel">
            <div class="carousel-item active">
              <a class="photo-link" href="/photo/121689336/south-korea"></a>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  it('enlarges the existing carousel responsively without replacing its nodes or links', () => {
    const container = document.querySelector<HTMLElement>('.float-xs-right.ml-1')!;
    const carousel = document.querySelector<HTMLElement>('#photo-carousel')!;
    const photoLink = document.querySelector<HTMLAnchorElement>('.photo-link')!;
    const presentation = new AreaPagePresentation();

    expect(presentation.mount()).toBe(true);

    expect(document.querySelector('#photo-carousel')).toBe(carousel);
    expect(document.querySelector('.photo-link')).toBe(photoLink);
    expect(photoLink.getAttribute('href')).toBe('/photo/121689336/south-korea');
    expect(container.classList.contains('mpkr-area-photo')).toBe(true);
    const style = document.querySelector<HTMLStyleElement>('style[data-mpkr-area-presentation]');
    expect(style?.textContent).toContain('width: min(360px, 100%)');
    expect(style?.textContent).toContain('aspect-ratio: 6 / 5');
    expect(style?.textContent).toContain('@media (max-width: 575px)');
    expect(style?.textContent).toContain('float: none !important');

    presentation.destroy();
    expect(container.classList.contains('mpkr-area-photo')).toBe(false);
    expect(document.querySelector('style[data-mpkr-area-presentation]')).toBeNull();
    expect(document.querySelector('#photo-carousel')).toBe(carousel);
    expect(document.querySelector('.photo-link')).toBe(photoLink);
  });

  it('does not style unrelated floating controls', () => {
    document.body.innerHTML = `
      <div id="climb-area-page">
        <div class="float-xs-right ml-1"><span>Not a carousel</span></div>
      </div>
    `;

    expect(new AreaPagePresentation().mount()).toBe(false);
    expect(document.querySelector('.mpkr-area-photo')).toBeNull();
  });

  it('migrates legacy markers and applies to a dynamically inserted carousel once', async () => {
    document.body.innerHTML = '<div id="climb-area-page"><h1>Asia</h1></div>';
    const legacyStyle = document.createElement('style');
    legacyStyle.dataset.mpKoreaAreaPresentation = 'photo-size';
    document.head.append(legacyStyle);
    const presentation = new AreaPagePresentation();

    expect(presentation.mount()).toBe(false);
    document.querySelector('#climb-area-page')!.insertAdjacentHTML('beforeend', `
      <div class="float-xs-right ml-1 mp-korea-area-photo">
        <div id="photo-carousel"><a class="photo-link" href="/photo/1/example"></a></div>
      </div>
    `);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const container = document.querySelector<HTMLElement>('.float-xs-right.ml-1')!;
    expect(container.classList.contains('mp-korea-area-photo')).toBe(false);
    expect(container.classList.contains('mpkr-area-photo')).toBe(true);
    expect(document.querySelectorAll('style[data-mpkr-area-presentation]')).toHaveLength(1);
    expect(document.querySelector('style[data-mp-korea-area-presentation]')).toBeNull();

    presentation.destroy();
    expect(container.getAttribute('class')).toBe('float-xs-right ml-1');
    expect(document.querySelector('style[data-mpkr-area-presentation]')).toBeNull();
  });
});
