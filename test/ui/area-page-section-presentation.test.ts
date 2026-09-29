import fixture from './fixtures/south-korea-area-priority.html?raw';
import { OriginalPreservingRenderer } from '@/rendering/original-preserving-renderer';
import { DirectPageLocalizer } from '@/localization/direct-page-localizer';
import { MountainProjectPageAdapter } from '@/sites/mountain-project/dom/page-adapter';
import { SECTION_TITLE_TRANSLATIONS } from '@/sites/mountain-project/contract/text/sections';
import {
  AreaPageSectionPresentation,
  RoutePageSectionPresentation,
} from '@/ui/area-page-section-presentation';
import { CHOUINARD_B_ROUTE_FIXTURE } from '../fixtures/mountain-project/chouinard-b-route';

describe('AreaPageSectionPresentation', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = fixture;
  });

  it('uses the heading rows as accessible collapsed controls with state chevrons', () => {
    const priority = new AreaPageSectionPresentation();

    expect(priority.mount()).toBe(true);

    const headings = Array.from(document.querySelectorAll<HTMLHeadingElement>('.mpkr-area-section-heading'));
    const bodies = Array.from(document.querySelectorAll<HTMLElement>('.mpkr-area-section-body'));
    expect(document.querySelector('.mpkr-area-section-toggle')).toBeNull();
    expect(headings).toHaveLength(2);
    expect(bodies).toHaveLength(2);
    expect(bodies.every((body) => body.hidden)).toBe(true);
    expect(headings[0]!.getAttribute('role')).toBe('button');
    expect(headings[0]!.getAttribute('tabindex')).toBe('0');
    expect(headings[0]!.getAttribute('aria-expanded')).toBe('false');
    expect(headings[0]!.getAttribute('aria-controls')).toBe(bodies[0]!.id);
    expect(headings[0]!.getAttribute('aria-label')).toBe('설명 내용 펼치기');
    expect(headings[0]!.classList.contains('title-with-border-bottom')).toBe(true);
    expect(headings[0]!.classList.contains('mb-1')).toBe(true);
    expect(headings[0]!.classList.contains('mpkr-info-heading')).toBe(true);
    expect(headings[0]!.querySelectorAll('.mpkr-area-section-chevron')).toHaveLength(1);
    expect(headings[0]!.querySelector('.mpkr-area-section-hint')?.textContent)
      .toBe('눌러서 내용 보기');
    expect(bodies[0]!.querySelector('#description-content')).not.toBeNull();
    expect(bodies[0]!.querySelector('.description-details')).toBeNull();

    const details = document.querySelector<HTMLElement>('.description-details')!;
    const infoHeading = details.previousElementSibling!;
    expect(infoHeading.classList.contains('title-with-border-bottom')).toBe(true);
    expect(infoHeading.classList.contains('mb-1')).toBe(true);
    expect(infoHeading.querySelector('h2')?.textContent).toBe('지역 정보');
    expect(details.hidden).toBe(false);

    const style = document.querySelector<HTMLStyleElement>(
      'style[data-mpkr-area-section-presentation]',
    )!;
    expect(style.textContent).toContain('display: block');
    expect(style.textContent).not.toContain('gap: 0.75rem');
    expect(style.textContent).toContain('right: 0.35rem');
    expect(style.textContent).not.toContain('border-bottom: 2px solid #0060a9');
    expect(window.getComputedStyle(headings[0]!).display).toBe('block');
    expect(style.textContent).toContain('text-indent: 0');
    expect(style.textContent).toContain('font-size: 0.9rem');
    expect(style.textContent).not.toContain('box-shadow: inset 3px 0 #0060a9');
    expect(style.textContent).toContain('background: rgba(0, 96, 169, 0.12)');
    expect(style.textContent).toContain('outline: 3px solid #0060a9');

    headings[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(bodies[0]!.hidden).toBe(false);
    expect(headings[0]!.getAttribute('aria-expanded')).toBe('true');
    expect(headings[0]!.getAttribute('aria-label')).toBe('설명 내용 접기');
    expect(headings[0]!.querySelector('.mpkr-area-section-hint')?.textContent)
      .toBe('눌러서 접기');
    headings[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(bodies[0]!.hidden).toBe(true);
    headings[0]!.click();
    expect(bodies[0]!.hidden).toBe(false);
    expect(bodies[1]!.hidden).toBe(true);

    headings[0]!.querySelector<HTMLAnchorElement>('a')!.click();
    expect(bodies[0]!.hidden).toBe(false);
  });

  it('neutralizes only the narrative Area height wrapper without hiding its content', () => {
    const priority = new AreaPageSectionPresentation();
    const processed = document.querySelector<HTMLElement>('#processed-height-region')!;
    const unrelated = document.querySelector<HTMLElement>('#unrelated-height-region')!;
    const processedParent = processed.parentNode;
    const processedClass = processed.getAttribute('class');
    const processedStyle = processed.getAttribute('style');
    const processedAttributes = Array.from(processed.attributes).map(({ name, value }) => [name, value]);
    const description = document.querySelector<HTMLElement>('#description-content')!;
    const unrelatedClass = unrelated.getAttribute('class');
    const unrelatedStyle = unrelated.getAttribute('style');
    const classicHeading = Array.from(document.querySelectorAll<HTMLHeadingElement>('h2'))
      .find((heading) => heading.textContent?.includes('Classic Climbing Routes'))!;
    const classicClass = classicHeading.getAttribute('class');

    expect(priority.mount()).toBe(true);

    expect(document.querySelector('#processed-height-region')).toBe(processed);
    expect(processed.hidden).toBe(false);
    expect(processed.classList.contains('max-height')).toBe(false);
    expect(processed.classList.contains('max-height-processed')).toBe(false);
    expect(processed.classList.contains('area-copy')).toBe(true);
    expect(processed.style.maxHeight).toBe('');
    expect(processed.style.height).toBe('');
    expect(processed.style.overflow).toBe('');
    expect(processed.style.color).toBe('rgb(1, 2, 3)');
    expect(processed.getAttribute('data-original-region')).toBe('description');
    expect(processed.contains(description)).toBe(true);
    const descriptionHeading = processed.querySelector<HTMLHeadingElement>('.mpkr-area-section-heading')!;
    const descriptionBody = document.getElementById(descriptionHeading.getAttribute('aria-controls')!)!;
    expect(descriptionHeading.hidden).toBe(false);
    expect(descriptionHeading.querySelector('.mpkr-area-section-hint')?.textContent)
      .toBe('눌러서 내용 보기');
    expect(descriptionHeading.querySelector('.mpkr-area-section-chevron')).not.toBeNull();
    expect(descriptionBody.hidden).toBe(true);
    descriptionHeading.click();
    expect(descriptionBody.hidden).toBe(false);
    expect(descriptionBody.contains(description)).toBe(true);
    expect(unrelated.getAttribute('class')).toBe(unrelatedClass);
    expect(unrelated.getAttribute('style')).toBe(unrelatedStyle);
    expect(classicHeading.classList.contains('mpkr-classic-routes-heading')).toBe(true);
    expect(classicHeading.classList.contains('title-with-border-bottom')).toBe(true);
    expect(classicHeading.classList.contains('mb-1')).toBe(true);
    expect(classicHeading.classList.contains('mpkr-info-heading')).toBe(true);
    expect(classicHeading.hasAttribute('role')).toBe(false);
    expect(classicHeading.hasAttribute('aria-expanded')).toBe(false);

    priority.destroy();

    expect(processed.parentNode).toBe(processedParent);
    expect(processed.getAttribute('class')).toBe(processedClass);
    expect(processed.getAttribute('style')).toBe(processedStyle);
    expect(Array.from(processed.attributes).map(({ name, value }) => [name, value]))
      .toEqual(processedAttributes);
    expect(processed.contains(description)).toBe(true);
    expect(description.hasAttribute('hidden')).toBe(false);
    expect(unrelated.getAttribute('class')).toBe(unrelatedClass);
    expect(unrelated.getAttribute('style')).toBe(unrelatedStyle);
    expect(classicHeading.getAttribute('class')).toBe(classicClass);
  });

  it('finds localized section headings and remains idempotent when remounted', () => {
    const headings = document.querySelectorAll<HTMLHeadingElement>('#climb-area-page h2');
    headings[0]!.childNodes[1]!.nodeValue = '설명';
    headings[1]!.childNodes[0]!.nodeValue = '가는 방법 ';
    const priority = new AreaPageSectionPresentation();

    expect(priority.mount()).toBe(true);
    expect(priority.mount()).toBe(true);

    const headingsAfterMount = document.querySelectorAll<HTMLHeadingElement>('.mpkr-area-section-heading');
    expect(headingsAfterMount).toHaveLength(2);
    expect(headingsAfterMount[0]!.getAttribute('aria-label')).toBe('설명 내용 펼치기');
    expect(headingsAfterMount[1]!.getAttribute('aria-label')).toBe('가는 방법 내용 펼치기');
    expect(document.querySelectorAll('.mpkr-area-section-chevron')).toHaveLength(2);
  });

  it('keeps dynamically rendered translations and their original toggles inside the collapsed region', () => {
    const content = document.querySelector<HTMLElement>('#description-content')!;
    const original = document.querySelector<HTMLElement>('#description-original')!;
    const priority = new AreaPageSectionPresentation();
    priority.mount();

    const renderer = new OriginalPreservingRenderer();
    renderer.render({
      id: 'description-live',
      category: 'description',
      source: original.textContent ?? '',
      sourceElements: [original],
      parent: content,
      insertBefore: original.nextSibling,
    }, '긴 대한민국 설명입니다.');

    const translation = content.querySelector<HTMLElement>('.mpkr-machine-translation')!;
    const originalToggle = translation.querySelector<HTMLButtonElement>('.mpkr-original-toggle')!;

    const body = content.closest<HTMLElement>('.mpkr-area-section-body')!;
    expect(body.hidden).toBe(true);
    expect(body.contains(translation)).toBe(true);
    expect(body.contains(originalToggle)).toBe(true);
    expect(original.style.display).toBe('none');

    document.querySelector<HTMLHeadingElement>('.mpkr-area-section-heading')!.click();
    expect(body.hidden).toBe(false);
    expect(body.contains(translation)).toBe(true);

    priority.destroy();
    expect(document.querySelector('.mpkr-area-section-body')).toBeNull();
    expect(content.hasAttribute('hidden')).toBe(false);
    expect(content.contains(translation)).toBe(true);
    renderer.destroy();
    expect(original.style.display).toBe('');
    expect(content.querySelector('.mpkr-machine-translation')).toBeNull();
  });

  it('collapses a nested live Area section after its heading has been localized', () => {
    document.body.innerHTML = `
      <div id="climb-area-page">
        <div class="text-section mt-3">
          <h2>설명 <a href="#edit"><img alt="변경 제안"></a></h2>
          <div class="section-content">
            <div class="fr-view" id="nested-area-description">
              <p>도시 위의 긴 화강암 설명입니다.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    const priority = new AreaPageSectionPresentation();

    expect(priority.mount()).toBe(true);

    const content = document.querySelector<HTMLElement>('#nested-area-description')!;
    const heading = document.querySelector<HTMLHeadingElement>('.mpkr-area-section-heading')!;
    const body = document.getElementById(heading.getAttribute('aria-controls')!)!;
    expect(body.hidden).toBe(true);
    expect(body.contains(content)).toBe(true);
    expect(heading.getAttribute('aria-label')).toBe('설명 내용 펼치기');

    heading.click();
    expect(body.hidden).toBe(false);
  });

  it('normalizes legacy Area accordions into the same translated accessible toggles', () => {
    document.body.innerHTML = `
      <div id="climb-area-page">
        <main class="main-content">
          <div class="max-height max-height-xs-600 max-height-md-600">
            <h2>OVERVIEW</h2>
            <div class="fr-view"><p>General climbing information for this area.</p></div>
          </div>
          <div class="list-group mt-2">
            <div class="list-group-item">
              <h2 class="list-group-item-heading" data-toggle="collapse" data-target="#text-2">
                Travel Information
                <span class="expander" id="expander-2"><img src="expand.svg"></span>
              </h2>
              <div class="list-group-item-text collapse p-1" id="text-2" data-expander="expander-2" style="height: 0px; display: none">
                <div class="fr-view"><p>Use public transit where available.</p></div>
              </div>
            </div>
            <div class="list-group-item">
              <h2 class="list-group-item-heading" data-toggle="collapse" data-target="#text-3">
                Helpful Hints
                <span class="expander" id="expander-3"><img src="expand.svg"></span>
              </h2>
              <div class="list-group-item-text collapse p-1" id="text-3" data-expander="expander-3">
                <div class="fr-view"><p>Bring enough water for the day.</p></div>
              </div>
            </div>
          </div>
        </main>
      </div>`;
    const before = document.body.innerHTML;
    const adapter = new MountainProjectPageAdapter();
    const targets = adapter.collectPageTargets();
    const presentation = new AreaPageSectionPresentation();
    const localizer = new DirectPageLocalizer();

    expect(targets.map(({ source }) => source)).toEqual([
      'General climbing information for this area.',
      'Use public transit where available.',
      'Bring enough water for the day.',
    ]);
    expect(presentation.mount()).toBe(true);
    localizer.apply();

    const headings = Array.from(document.querySelectorAll<HTMLHeadingElement>('.mpkr-area-section-heading'));
    expect(headings).toHaveLength(3);
    expect(headings.map((heading) => heading.childNodes[0]?.textContent?.trim()))
      .toEqual(['개요', '여행 정보', '유용한 팁']);
    expect(headings.every((heading) => !heading.hasAttribute('data-toggle'))).toBe(true);
    expect(headings.every((heading) => !heading.hasAttribute('data-target'))).toBe(true);
    expect(Array.from(document.querySelectorAll<HTMLElement>('.expander'))
      .every((expander) => expander.hidden)).toBe(true);
    expect(Array.from(document.querySelectorAll<HTMLElement>('.list-group-item-text'))
      .every((body) => !body.classList.contains('collapse') && body.style.display === '')).toBe(true);
    expect(Array.from(document.querySelectorAll<HTMLElement>('.mpkr-area-section-body'))
      .every((body) => body.hidden)).toBe(true);

    headings[1]!.click();
    const controlled = document.getElementById(headings[1]!.getAttribute('aria-controls')!)!;
    expect(controlled.hidden).toBe(false);
    expect(controlled.querySelector('#text-2')).not.toBeNull();

    presentation.destroy();
    localizer.restore();
    adapter.restore();
    expect(document.body.innerHTML).toBe(before);
  });

  it('covers the supplemental section titles sampled from five popular Area pages', () => {
    const sampledTitles = [
      'Official Park Info', 'Weather', 'Access',
      'Climbing Gear', 'Fixed Anchors in the Gunks', 'Guidebooks',
      'Where to Stay', 'Where to Eat', 'Other Resources',
      'Rain and Wet Rock', 'Human Waste',
      'The Scenic Loop: Entry Fee, Reservation System, and Late Exit Passes',
      'Commercial, Large Groups (>15), and Guest Permit Lottery',
      'Camping', 'Red Rock or Rocks?',
    ];

    expect(sampledTitles.every((title) => Boolean(SECTION_TITLE_TRANSLATIONS[title]))).toBe(true);
  });

  it('discovers a dynamically inserted h3 section and keeps later body nodes in its wrapper', async () => {
    document.body.innerHTML = `
      <div id="route-page">
        <main id="route-copy">
          <section><h2>Description</h2><div class="fr-view"><p>Initial copy</p></div></section>
        </main>
      </div>
    `;
    const priority = new RoutePageSectionPresentation();

    expect(priority.mount()).toBe(true);

    document.querySelector('#route-copy')!.insertAdjacentHTML('beforeend', `
      <section class="route-description">
        <h3 class="route-heading">가는 방법</h3>
        <div class="fr-view"><p>접근 설명</p></div>
      </section>
    `);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const heading = document.querySelector<HTMLHeadingElement>('h3.mpkr-area-section-heading')!;
    const body = document.getElementById(heading.getAttribute('aria-controls')!)!;
    const delayedList = document.createElement('ul');
    delayedList.id = 'delayed-access-list';
    delayedList.innerHTML = '<li>버스 정보</li>';
    body.insertAdjacentElement('afterend', delayedList);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(body.hidden).toBe(true);
    expect(body.contains(delayedList)).toBe(true);
    expect(document.querySelectorAll('.mpkr-area-section-heading')).toHaveLength(2);
    expect(document.querySelectorAll('.mpkr-area-section-chevron')).toHaveLength(2);
  });

  it('mounts all live Route sections and keeps delayed translations inside their section body', () => {
    document.body.innerHTML = CHOUINARD_B_ROUTE_FIXTURE;
    const priority = new RoutePageSectionPresentation();
    const renderer = new OriginalPreservingRenderer();
    const content = document.querySelector<HTMLElement>('.route-section .fr-view')!;
    const paragraphs = Array.from(content.querySelectorAll<HTMLElement>('p'));
    const summary = document.querySelector<HTMLElement>('#route-summary')!;
    const details = summary.querySelector<HTMLElement>('.description-details')!;
    const originalSummaryNodes = Array.from(summary.childNodes);
    const supportingList = document.createElement('ul');
    supportingList.id = 'route-description-list';
    supportingList.innerHTML = '<li>60 m rope</li>';
    content.after(supportingList);

    expect(priority.mount()).toBe(true);
    const heading = document.querySelector<HTMLHeadingElement>('.mpkr-area-section-heading')!;
    const body = document.getElementById(heading.getAttribute('aria-controls')!)!;
    expect(body.hidden).toBe(true);
    expect(body.contains(supportingList)).toBe(true);
    expect(document.querySelector('.mpkr-info-heading h2')?.textContent).toBe('루트 정보');
    expect(details.closest('.mpkr-area-section-body')).toBeNull();
    expect(details.hidden).toBe(false);

    paragraphs.forEach((paragraph, index) => {
      renderer.render({
        id: `route-description-${index}`,
        category: 'description',
        source: paragraph.textContent ?? '',
        sourceElements: [paragraph],
        parent: content,
        insertBefore: paragraph.nextSibling,
      }, `번역 ${index + 1}`);
    });
    priority.mount();

    expect(document.querySelectorAll('.mpkr-area-section-heading')).toHaveLength(4);
    expect(document.querySelectorAll('.mpkr-area-section-chevron')).toHaveLength(4);
    expect(Array.from(document.querySelectorAll<HTMLElement>('.mpkr-area-section-body'))
      .every((sectionBody) => sectionBody.hidden)).toBe(true);
    expect(content.querySelectorAll('.mpkr-section-translation')).toHaveLength(1);
    expect(content.querySelectorAll('.mpkr-original-toggle')).toHaveLength(1);
    expect(body.hidden).toBe(true);

    heading.click();
    expect(body.hidden).toBe(false);
    expect(content.textContent).toContain('번역 1');
    expect(content.textContent).toContain('번역 2');

    priority.destroy();
    expect(content.hasAttribute('hidden')).toBe(false);
    expect(content.nextElementSibling).toBe(supportingList);
    expect(document.querySelector('.mpkr-info-heading')).toBeNull();
    expect(summary.querySelector('.description-details')).toBe(details);
    expect(Array.from(summary.childNodes)).toEqual(originalSummaryNodes);
    expect(content.querySelectorAll('.mpkr-section-translation')).toHaveLength(1);
    renderer.destroy();
    expect(paragraphs.every((paragraph) => paragraph.style.display === '')).toBe(true);
  });

  it('preserves heading, content, route, link, and action node identity', () => {
    const heading = document.querySelector<HTMLHeadingElement>('h2')!;
    const content = document.querySelector<HTMLElement>('#description-content')!;
    const route = document.querySelector<HTMLTableRowElement>('#desktop-seoul-one')!;
    const routeLink = route.querySelector<HTMLAnchorElement>('a')!;
    const action = document.querySelector<HTMLAnchorElement>('#more-classics')!;
    let clicks = 0;
    routeLink.addEventListener('click', (event) => {
      event.preventDefault();
      clicks += 1;
    });

    new AreaPageSectionPresentation().mount();

    expect(document.querySelector('h2')).toBe(heading);
    expect(document.querySelector('#description-content')).toBe(content);
    expect(document.querySelector('#desktop-seoul-one')).toBe(route);
    expect(route.querySelector('a')).toBe(routeLink);
    expect(document.querySelector('#more-classics')).toBe(action);
    expect(action.hidden).toBe(false);
    routeLink.click();
    expect(clicks).toBe(1);
  });

  it('restores the exact original positions and attributes on destroy and reapplies without drift', () => {
    const priority = new AreaPageSectionPresentation();
    const descriptionHeading = document.querySelector<HTMLHeadingElement>('h2')!;
    const descriptionParent = descriptionHeading.parentElement!;
    const originalDescriptionNodes = Array.from(descriptionParent.childNodes);
    const originalHeadingAttributes = Array.from(descriptionHeading.attributes)
      .map(({ name, value }) => [name, value]);
    const description = document.querySelector<HTMLElement>('#description-content')!;
    const access = document.querySelectorAll<HTMLElement>('.fr-view')[1]!;

    priority.mount();
    priority.mount();
    expect(document.querySelectorAll('.mpkr-area-section-heading')).toHaveLength(2);
    priority.destroy();

    expect(description.id).toBe('description-content');
    expect(description.hasAttribute('hidden')).toBe(false);
    expect(access.hasAttribute('id')).toBe(false);
    expect(access.hasAttribute('hidden')).toBe(false);
    expect(document.querySelector('.mpkr-area-section-heading')).toBeNull();
    expect(document.querySelector('.mpkr-area-section-body')).toBeNull();
    expect(document.querySelector('.mpkr-area-section-chevron')).toBeNull();
    expect(document.querySelector('.mpkr-area-section-hint')).toBeNull();
    expect(document.querySelector('[data-mpkr-area-route-group]')).toBeNull();
    expect(document.querySelector('style[data-mpkr-area-section-presentation]')).toBeNull();
    expect(Array.from(descriptionParent.childNodes)).toEqual(originalDescriptionNodes);
    expect(Array.from(descriptionHeading.attributes).map(({ name, value }) => [name, value]))
      .toEqual(originalHeadingAttributes);

    expect(priority.mount()).toBe(true);
    expect(document.querySelectorAll('.mpkr-area-section-heading')).toHaveLength(2);
  });
});
