import {
  buildAreaPath,
  buildMapPath,
  buildRoutePath,
  buildRouteStatsPath,
  detectPage,
  detectPath,
  isMapInformationPath,
  isInternalActionPath,
  isHelpPath,
  isRouteFinderPath,
  isStatsInformationPath,
  normalizeMountainProjectPath,
  parseAreaPath,
  parseContactUserPath,
  parseGymPath,
  parseMapPath,
  parsePhotoPath,
  parseRoutePath,
  parseRouteStatsPath,
  parseUserPath,
} from '@/sites/mountain-project/contract/routes';

describe('detectPage', () => {
  it.each([
    ['https://www.mountainproject.com/', 'main'],
    ['https://mountainproject.com', 'main'],
    ['https://www.mountainproject.com/area/105833388/yosemite-valley', 'area'],
    ['https://www.mountainproject.com/route/105924807/the-nose', 'route'],
    [
      'https://www.mountainproject.com/route/stats/105889783/swan-slab-gully',
      'route-stats',
    ],
    ['https://www.mountainproject.com/route/stats/106232568/chouinard-b/', 'route-stats'],
    ['https://www.mountainproject.com/route/stats/105889783', 'route-stats'],
    ['https://www.mountainproject.com/route-finder', 'route-finder'],
    [
      'https://www.mountainproject.com/route-finder?selectedIds=106225629&type=rock',
      'route-finder',
    ],
    ['https://www.mountainproject.com/route-finder/', 'route-finder'],
    ['https://www.mountainproject.com/photo/112102756', 'photo'],
    [
      'https://www.mountainproject.com/photo/112102756/the-huge-southern-face-of-begundae',
      'photo',
    ],
    ['https://www.mountainproject.com/user/900000011/fixture-member', 'user'],
    ['https://www.mountainproject.com/user/900000011/fixture-member/', 'user'],
    ['https://www.mountainproject.com/user/900000009/fixture-recipient/contributions', 'user'],
    ['https://www.mountainproject.com/user/900000009/fixture-recipient/community', 'user'],
    ['https://www.mountainproject.com/contact-user/900000009', 'contact-user'],
    ['https://www.mountainproject.com/contact-user/900000009/', 'contact-user'],
    ['https://www.mountainproject.com/gyms/louisiana', 'gyms'],
    ['https://www.mountainproject.com/gyms/south-korea/', 'gyms'],
    ['https://www.mountainproject.com/gym/117113100/risen-rock-climbing-gym', 'gym'],
    ['https://www.mountainproject.com/gym/117113100', 'gym'],
    ['https://www.mountainproject.com/user/900000011', 'unsupported'],
    ['https://www.mountainproject.com/user/900000011/fixture-member/ticks', 'unsupported'],
    ['https://www.mountainproject.com/contact-user/not-a-number', 'unsupported'],
    ['https://www.mountainproject.com/gym/117113100/risen-rock/add/photo', 'unsupported'],
    ['https://www.mountainproject.com/photo/full/112102756', 'unsupported'],
    ['https://www.mountainproject.com/route/stats', 'unsupported'],
    ['https://www.mountainproject.com/route-finder/export', 'unsupported'],
    ['https://www.mountainproject.com/route/stats/105889783/swan-slab-gully/more', 'unsupported'],
    ['https://www.mountainproject.com/forum', 'forum'],
    ['https://www.mountainproject.com/search?q=rope', 'search'],
    ['https://www.mountainproject.com/search/?q=rope&type=forums', 'search'],
    ['https://www.mountainproject.com/search', 'search'],
    ['https://www.mountainproject.com/search/extra', 'unsupported'],
    ['https://www.mountainproject.com/forum/', 'forum'],
    ['https://www.mountainproject.com/forum/latest?page=2', 'forum'],
    ['https://www.mountainproject.com/forum/103989405/general-climbing?page=2', 'forum'],
    ['https://www.mountainproject.com/forum/103989405/?q=belay&sort=newest', 'forum'],
    ['https://www.mountainproject.com/forum/topic/123/example?page=2#reply', 'forum-topic'],
    ['https://www.mountainproject.com/forum/topic/123#reply', 'forum-topic'],
    ['https://www.mountainproject.com/add/forum-topic/103989405', 'forum-form'],
    ['https://www.mountainproject.com/add/forum-message/123#reply', 'forum-form'],
    ['https://www.mountainproject.com/edit/forum-message/456/?returnTo=%2Fforum', 'forum-form'],
    ['https://www.mountainproject.com/edit/forum-message/0?replyToId=123&quoteId=456', 'forum-form'],
    ['https://www.mountainproject.com/forum/latest/extra', 'unsupported'],
    ['https://www.mountainproject.com/forum/topic/not-a-number/example', 'unsupported'],
    ['https://www.mountainproject.com/add/forum-message/not-a-number', 'unsupported'],
    ['https://www.mountainproject.com/edit/forum-message/not-a-number', 'unsupported'],
    ['https://www.mountainproject.com/edit/forum-message/456/extra', 'unsupported'],
    ['https://www.mountainproject.com/help', 'help'],
    ['https://www.mountainproject.com/help/', 'help'],
    ['https://www.mountainproject.com/help/31/my-account-and-community', 'help'],
    ['https://www.mountainproject.com/help-hub', 'help-hub'],
    ['https://www.mountainproject.com/about', 'about'],
    ['https://www.mountainproject.com/about/', 'about'],
    ['https://www.mountainproject.com/about/extra', 'unsupported'],
    ['https://www.mountainproject.com/name-review-process', 'name-review'],
    ['https://www.mountainproject.com/add/climb-area/106225629', 'contribution'],
    ['https://www.mountainproject.com/add/climb-area/106225629#', 'contribution'],
    ['https://www.mountainproject.com/area/106225629/add/photo', 'contribution'],
    ['https://www.mountainproject.com/area/106225629/add/photo/', 'contribution'],
    ['https://www.mountainproject.com/route/106232568/add/photo', 'contribution'],
    ['https://www.mountainproject.com/edit/imageLink/106225629?type=album', 'contribution'],
    ['https://www.mountainproject.com/edit/imageLink/106225629/?type=album', 'contribution'],
    ['https://www.mountainproject.com/upload/start/trail?areaId=106225629', 'contribution'],
    ['https://www.mountainproject.com/edit/book/0?parentId=106225629', 'contribution'],
    ['https://www.mountainproject.com/edit/route/0?parentId=106225629', 'contribution'],
    ['https://www.mountainproject.com/edit/photo/0?parentId=106225629', 'contribution'],
    ['https://www.mountainproject.com/edit/trail/0?parentId=106225629', 'contribution'],
    ['https://www.mountainproject.com/edit/text-section/106225630', 'contribution'],
    ['https://www.mountainproject.com/edit/symbol', 'contribution'],
    ['https://www.mountainproject.com/share/trail', 'contribution'],
    ['https://www.mountainproject.com/share/photo', 'contribution'],
    ['https://www.mountainproject.com/share/video', 'contribution'],
    ['https://www.mountainproject.com/suggest/climb-area/106225629', 'contribution'],
    [
      'https://www.mountainproject.com/improvement/general?objectType=Climb%5CLib%5CModels%5CArea&id=106225629',
      'contribution',
    ],
    [
      'https://www.mountainproject.com/improvement/text-section?objectType=Climb%5CLib%5CModels%5CTextSection&id=106225630',
      'contribution',
    ],
    [
      'https://www.mountainproject.com/updates/Climb-Lib-Models-Area/106225629/south-korea',
      'contribution',
    ],
    ['https://www.mountainproject.com/help/not-a-number/article', 'unsupported'],
    ['https://www.mountainproject.com/help/31', 'unsupported'],
    ['https://www.mountainproject.com/edit/imagelink/106225629?type=album', 'unsupported'],
    ['https://www.mountainproject.com/area/106225629/add/video', 'unsupported'],
    ['https://www.mountainproject.com/upload/start/photo?areaId=106225629', 'unsupported'],
    ['https://www.mountainproject.com/edit/book/not-a-number?parentId=106225629', 'unsupported'],
    ['https://example.com/', 'unsupported'],
  ])('classifies %s as %s', (url, expected) => {
    expect(detectPage(new URL(url))).toBe(expected);
  });
});

describe('Mountain Project path contracts', () => {
  it('normalizes trailing slashes and parses entity paths with optional slugs', () => {
    expect(normalizeMountainProjectPath('/area/106225629/south-korea///'))
      .toBe('/area/106225629/south-korea');
    expect(normalizeMountainProjectPath('/')).toBe('/');
    expect(parseAreaPath('/area/106225629/south-korea/')).toEqual({
      id: '106225629',
      slug: 'south-korea',
    });
    expect(parseRoutePath('/route/106232568')).toEqual({ id: '106232568' });
    expect(parseRouteStatsPath('/route/stats/106232568/chouinard-b')).toEqual({
      id: '106232568',
      slug: 'chouinard-b',
    });
    expect(parseMapPath('/map/106225629/south-korea')).toEqual({
      id: '106225629',
      slug: 'south-korea',
    });
    expect(parsePhotoPath('/photo/112102756/granite-wall')).toEqual({
      id: '112102756',
      slug: 'granite-wall',
    });
    expect(parseUserPath('/user/900000001/fixture-climber-a/community')).toEqual({
      id: '900000001',
      slug: 'fixture-climber-a',
      section: 'community',
    });
    expect(parseContactUserPath('/contact-user/900000009')).toEqual({
      id: '900000009',
    });
    expect(parseGymPath('/gym/117113100/risen-rock-climbing-gym')).toEqual({
      id: '117113100',
      slug: 'risen-rock-climbing-gym',
    });
  });

  it('builds encoded canonical entity paths from one implementation', () => {
    expect(buildAreaPath('106225629', 'south-korea'))
      .toBe('/area/106225629/south-korea');
    expect(buildMapPath('106225629', 'south korea'))
      .toBe('/map/106225629/south%20korea');
    expect(buildRoutePath('106232568', 'chouinard-b'))
      .toBe('/route/106232568/chouinard-b');
    expect(buildRouteStatsPath('106232568', 'corner/a'))
      .toBe('/route/stats/106232568/corner%2Fa');
  });

  it('keeps page detection and information-navigation families explicit', () => {
    expect(detectPath('/map/106225629/south-korea')).toBe('unsupported');
    expect(isRouteFinderPath('/route-finder/')).toBe(true);
    expect(isHelpPath('/help/31/my-account-and-community')).toBe(true);
    expect(isHelpPath('/help-hub')).toBe(false);
    expect(isMapInformationPath('/route/106232568/chouinard-b')).toBe(true);
    expect(isMapInformationPath('/forum/topic/123/example')).toBe(true);
    expect(isMapInformationPath('/ajax/map-data')).toBe(false);
    expect(isInternalActionPath('/ajax/map-data')).toBe(true);
    expect(isInternalActionPath('/auth/login')).toBe(true);
    expect(isInternalActionPath('/route/106232568/chouinard-b')).toBe(false);
    expect(isStatsInformationPath('/international-climbing-grades')).toBe(true);
    expect(isStatsInformationPath('/route/stats/106232568/chouinard-b')).toBe(true);
    expect(isStatsInformationPath('/auth/login')).toBe(false);
  });
});
