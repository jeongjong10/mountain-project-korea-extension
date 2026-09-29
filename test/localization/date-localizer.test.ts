import { DirectPageLocalizer } from '@/localization/direct-page-localizer';
import { DateLocalizer } from '@/localization/date-localizer';
import { localizeEnglishDateText } from '@/sites/mountain-project/contract/text/date';
import { DATE_UI_FIXTURE } from '../fixtures/mountain-project/date-ui';

async function flushMutations(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('English date contract', () => {
  it.each([
    ['January', 'Jan', 1],
    ['February', 'Feb', 2],
    ['March', 'Mar', 3],
    ['April', 'Apr', 4],
    ['May', 'May', 5],
    ['June', 'Jun', 6],
    ['July', 'Jul', 7],
    ['August', 'Aug', 8],
    ['September', 'Sep', 9],
    ['October', 'Oct', 10],
    ['November', 'Nov', 11],
    ['December', 'Dec', 12],
  ])('localizes %s and %s', (full, abbreviated, month) => {
    expect(localizeEnglishDateText(`${full} 5, 2026`)).toBe(`2026년 ${month}월 5일`);
    expect(localizeEnglishDateText(`5 ${abbreviated} 2026`)).toBe(`2026년 ${month}월 5일`);
  });

  it('supports Sep and Sept while requiring a complete calendar date', () => {
    expect(localizeEnglishDateText('Sep 9, 2026')).toBe('2026년 9월 9일');
    expect(localizeEnglishDateText('9 Sept 2026')).toBe('2026년 9월 9일');
    expect(localizeEnglishDateText('May is a climber name')).toBeUndefined();
    expect(localizeEnglishDateText('We climbed in January 2026')).toBeUndefined();
    expect(localizeEnglishDateText('이미 2026년 1월 5일')).toBeUndefined();
  });
});

describe('DateLocalizer semantic DOM integration', () => {
  beforeEach(() => {
    document.head.innerHTML = '<base href="https://www.mountainproject.com/">';
    document.body.innerHTML = DATE_UI_FIXTURE;
  });

  it('localizes representative route, comment, tick, stats, and user metadata only', () => {
    const sharedUser = document.querySelector<HTMLAnchorElement>('#shared-user')!;
    const updates = document.querySelector<HTMLAnchorElement>('#updates')!;
    const permalink = document.querySelector<HTMLAnchorElement>('#comment-permalink')!;
    const time = document.querySelector<HTMLTimeElement>('#activity-date')!;
    const localizer = new DateLocalizer();

    localizer.apply(document);

    expect(document.querySelector('#shared-metadata')?.textContent)
      .toContain('2008년 8월 18일');
    expect(permalink.textContent).toBe('2016년 10월 10일');
    expect(document.querySelector('#tick-date')?.textContent).toBe('2026년 9월 5일');
    expect(document.querySelector('#member-since')?.textContent).toBe('2026년 1월 5일');
    expect(document.querySelector('#last-visit')?.textContent)
      .toBe('Last Visit: 2026년 2월 6일');
    expect(time.textContent).toBe('2026년 3월 7일');
    expect(document.querySelector('#contribution-date')?.textContent)
      .toBe('2026년 4월 8일');

    expect(document.querySelector('#shared-user')).toBe(sharedUser);
    expect(document.querySelector('#updates')).toBe(updates);
    expect(sharedUser.getAttribute('href')).toBe('/user/1/climber');
    expect(updates.getAttribute('href')).toBe('/updates/route');
    expect(permalink.getAttribute('href')).toBe('#Comment-1');
    expect(permalink.getAttribute('title')).toBe('Oct 10, 2016');
    expect(time.getAttribute('datetime')).toBe('2026-03-07');
    expect(time.dataset.date).toBe('2026-03-07');
    expect(time.getAttribute('title')).toBe('March 7, 2026');

    expect(document.querySelector('#month-in-comment')?.textContent)
      .toBe("May is a climber's name here, not a date.");
    expect(document.querySelector('#date-route-name')?.textContent)
      .toBe('January 5, 2026');
  });

  it('restores and re-enables idempotently', () => {
    const localizer = new DateLocalizer();

    localizer.apply(document);
    localizer.apply(document);
    expect(document.querySelector('#tick-date')?.textContent).toBe('2026년 9월 5일');

    localizer.restore();
    expect(document.querySelector('#tick-date')?.textContent).toBe('5 Sept 2026');
    expect(document.querySelector('#shared-metadata')?.textContent)
      .toContain('on Aug 18, 2008');

    localizer.apply(document);
    expect(document.querySelector('#tick-date')?.textContent).toBe('2026년 9월 5일');
    expect(document.querySelectorAll('#tick-date')).toHaveLength(1);
  });

  it('uses the existing DirectPageLocalizer observer for dates added by AJAX', async () => {
    const localizer = new DirectPageLocalizer();
    localizer.apply(document);
    const comments = document.querySelector('.comments')!;
    comments.insertAdjacentHTML(
      'beforeend',
      '<span id="late-date" class="comment-time"><a href="#Comment-2">December 31, 2026</a></span>',
    );
    const contributionRow = document.createElement('tr');
    contributionRow.innerHTML = '<td>Late contribution</td><td id="late-table-date">Nov 30, 2026</td>';
    document.querySelector('#contributions')?.append(contributionRow);
    await flushMutations();

    expect(document.querySelector('#late-date')?.textContent).toBe('2026년 12월 31일');
    expect(document.querySelector('#late-table-date')?.textContent).toBe('2026년 11월 30일');
    localizer.restore();
    expect(document.querySelector('#late-date')?.textContent).toBe('December 31, 2026');
    expect(document.querySelector('#late-table-date')?.textContent).toBe('Nov 30, 2026');
  });
});
