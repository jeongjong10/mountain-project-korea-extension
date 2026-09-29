import { defineConfig } from "wxt";
import { MOUNTAIN_PROJECT_MATCH_PATTERNS } from "./src/sites/mountain-project/contract/origins";

const toolbarIcon = { 16: "icon/16.png", 32: "icon/32.png" };

export default defineConfig({
    srcDir: "src",
    manifest: ({ browser }) => ({
        name: "Mountain Project Korea (비공식)",
        description:
            "Mountain Project 지원 페이지의 한국어 번역과 탐색을 돕는 비공식 확장 프로그램.",
        icons: {
            16: "icon/16.png",
            32: "icon/32.png",
            48: "icon/48.png",
            128: "icon/128.png",
        },
        ...(browser === "firefox"
            ? { browser_action: { default_icon: toolbarIcon } }
            : { action: { default_icon: toolbarIcon } }),
        permissions: ["storage"],
        host_permissions: [...MOUNTAIN_PROJECT_MATCH_PATTERNS],
        ...(browser === "firefox"
            ? {
                  browser_specific_settings: {
                      gecko: {
                          id: "mountain-project-korea@extension.local",
                          data_collection_permissions: {
                              required: ["none"],
                          },
                      },
                      gecko_android: {},
                  },
              }
            : {}),
    }),
});
