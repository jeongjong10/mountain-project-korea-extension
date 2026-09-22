import { detectPage } from './page-detector';

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
    ['https://www.mountainproject.com/user/111529554/adam-pankratz', 'user'],
    ['https://www.mountainproject.com/user/111529554/adam-pankratz/', 'user'],
    ['https://www.mountainproject.com/user/203817867/joel-jeong/contributions', 'user'],
    ['https://www.mountainproject.com/user/203817867/joel-jeong/community', 'user'],
    ['https://www.mountainproject.com/contact-user/203817867', 'contact-user'],
    ['https://www.mountainproject.com/contact-user/203817867/', 'contact-user'],
    ['https://www.mountainproject.com/user/111529554', 'unsupported'],
    ['https://www.mountainproject.com/user/111529554/adam-pankratz/ticks', 'unsupported'],
    ['https://www.mountainproject.com/contact-user/not-a-number', 'unsupported'],
    ['https://www.mountainproject.com/photo/full/112102756', 'unsupported'],
    ['https://www.mountainproject.com/route/stats', 'unsupported'],
    ['https://www.mountainproject.com/route-finder/export', 'unsupported'],
    ['https://www.mountainproject.com/route/stats/105889783/swan-slab-gully/more', 'unsupported'],
    ['https://www.mountainproject.com/forum', 'unsupported'],
    ['https://example.com/', 'unsupported'],
  ])('classifies %s as %s', (url, expected) => {
    expect(detectPage(new URL(url))).toBe(expected);
  });
});
