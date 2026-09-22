import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: ({ browser }) => ({
    name: 'Mountain Project Korea',
    description: 'Mountain Project 페이지를 한국어 중심으로 현지화하는 비공식 확장 프로그램',
    permissions: ['storage'],
    host_permissions: [
      'https://mountainproject.com/*',
      'https://www.mountainproject.com/*',
    ],
    ...(browser === 'firefox'
      ? {
          browser_specific_settings: {
            gecko: {
              id: 'mountain-project-korea@extension.local',
              data_collection_permissions: {
                required: ['none'],
              },
            },
            gecko_android: {},
          },
        }
      : {}),
  }),
});
