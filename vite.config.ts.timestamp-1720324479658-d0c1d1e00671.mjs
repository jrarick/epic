// vite.config.ts
import { vitePlugin as remix } from "file:///C:/Users/deran/Documents/Projects/epic/node_modules/@remix-run/dev/dist/index.js";
import { sentryVitePlugin } from "file:///C:/Users/deran/Documents/Projects/epic/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import { glob } from "file:///C:/Users/deran/Documents/Projects/epic/node_modules/glob/dist/esm/index.js";
import { flatRoutes } from "file:///C:/Users/deran/Documents/Projects/epic/node_modules/remix-flat-routes/dist/index.js";
import { defineConfig } from "file:///C:/Users/deran/Documents/Projects/epic/node_modules/vite/dist/node/index.js";
var MODE = process.env.NODE_ENV;
var vite_config_default = defineConfig({
  build: {
    cssMinify: MODE === "production",
    rollupOptions: {
      external: [/node:.*/, "stream", "crypto", "fsevents"]
    },
    assetsInlineLimit: (source) => {
      if (source.endsWith("sprite.svg")) {
        return false;
      }
    },
    sourcemap: true
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*"],
      serverModuleFormat: "esm",
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes, {
          ignoredRouteFiles: [
            ".*",
            "**/*.css",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/__*.*",
            // This is for server-side utilities you want to colocate
            // next to your routes without making an additional
            // directory. If you need a route that includes "server" or
            // "client" in the filename, use the escape brackets like:
            // my-route.[server].tsx
            "**/*.server.*",
            "**/*.client.*"
          ]
        });
      }
    }),
    process.env.SENTRY_AUTH_TOKEN ? sentryVitePlugin({
      disable: MODE !== "production",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      release: {
        name: process.env.COMMIT_SHA,
        setCommits: {
          auto: true
        }
      },
      sourcemaps: {
        filesToDeleteAfterUpload: await glob([
          "./build/**/*.map",
          ".server-build/**/*.map"
        ])
      }
    }) : null
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxkZXJhblxcXFxEb2N1bWVudHNcXFxcUHJvamVjdHNcXFxcZXBpY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcZGVyYW5cXFxcRG9jdW1lbnRzXFxcXFByb2plY3RzXFxcXGVwaWNcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2RlcmFuL0RvY3VtZW50cy9Qcm9qZWN0cy9lcGljL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgdml0ZVBsdWdpbiBhcyByZW1peCB9IGZyb20gJ0ByZW1peC1ydW4vZGV2J1xuaW1wb3J0IHsgc2VudHJ5Vml0ZVBsdWdpbiB9IGZyb20gJ0BzZW50cnkvdml0ZS1wbHVnaW4nXG5pbXBvcnQgeyBnbG9iIH0gZnJvbSAnZ2xvYidcbmltcG9ydCB7IGZsYXRSb3V0ZXMgfSBmcm9tICdyZW1peC1mbGF0LXJvdXRlcydcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5cbmNvbnN0IE1PREUgPSBwcm9jZXNzLmVudi5OT0RFX0VOVlxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRidWlsZDoge1xuXHRcdGNzc01pbmlmeTogTU9ERSA9PT0gJ3Byb2R1Y3Rpb24nLFxuXG5cdFx0cm9sbHVwT3B0aW9uczoge1xuXHRcdFx0ZXh0ZXJuYWw6IFsvbm9kZTouKi8sICdzdHJlYW0nLCAnY3J5cHRvJywgJ2ZzZXZlbnRzJ10sXG5cdFx0fSxcblxuXHRcdGFzc2V0c0lubGluZUxpbWl0OiAoc291cmNlOiBzdHJpbmcpID0+IHtcblx0XHRcdGlmIChzb3VyY2UuZW5kc1dpdGgoJ3Nwcml0ZS5zdmcnKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0c291cmNlbWFwOiB0cnVlLFxuXHR9LFxuXHRwbHVnaW5zOiBbXG5cdFx0cmVtaXgoe1xuXHRcdFx0aWdub3JlZFJvdXRlRmlsZXM6IFsnKiovKiddLFxuXHRcdFx0c2VydmVyTW9kdWxlRm9ybWF0OiAnZXNtJyxcblx0XHRcdHJvdXRlczogYXN5bmMgZGVmaW5lUm91dGVzID0+IHtcblx0XHRcdFx0cmV0dXJuIGZsYXRSb3V0ZXMoJ3JvdXRlcycsIGRlZmluZVJvdXRlcywge1xuXHRcdFx0XHRcdGlnbm9yZWRSb3V0ZUZpbGVzOiBbXG5cdFx0XHRcdFx0XHQnLionLFxuXHRcdFx0XHRcdFx0JyoqLyouY3NzJyxcblx0XHRcdFx0XHRcdCcqKi8qLnRlc3Que2pzLGpzeCx0cyx0c3h9Jyxcblx0XHRcdFx0XHRcdCcqKi9fXyouKicsXG5cdFx0XHRcdFx0XHQvLyBUaGlzIGlzIGZvciBzZXJ2ZXItc2lkZSB1dGlsaXRpZXMgeW91IHdhbnQgdG8gY29sb2NhdGVcblx0XHRcdFx0XHRcdC8vIG5leHQgdG8geW91ciByb3V0ZXMgd2l0aG91dCBtYWtpbmcgYW4gYWRkaXRpb25hbFxuXHRcdFx0XHRcdFx0Ly8gZGlyZWN0b3J5LiBJZiB5b3UgbmVlZCBhIHJvdXRlIHRoYXQgaW5jbHVkZXMgXCJzZXJ2ZXJcIiBvclxuXHRcdFx0XHRcdFx0Ly8gXCJjbGllbnRcIiBpbiB0aGUgZmlsZW5hbWUsIHVzZSB0aGUgZXNjYXBlIGJyYWNrZXRzIGxpa2U6XG5cdFx0XHRcdFx0XHQvLyBteS1yb3V0ZS5bc2VydmVyXS50c3hcblx0XHRcdFx0XHRcdCcqKi8qLnNlcnZlci4qJyxcblx0XHRcdFx0XHRcdCcqKi8qLmNsaWVudC4qJyxcblx0XHRcdFx0XHRdLFxuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblx0XHR9KSxcblx0XHRwcm9jZXNzLmVudi5TRU5UUllfQVVUSF9UT0tFTlxuXHRcdFx0PyBzZW50cnlWaXRlUGx1Z2luKHtcblx0XHRcdFx0XHRkaXNhYmxlOiBNT0RFICE9PSAncHJvZHVjdGlvbicsXG5cdFx0XHRcdFx0YXV0aFRva2VuOiBwcm9jZXNzLmVudi5TRU5UUllfQVVUSF9UT0tFTixcblx0XHRcdFx0XHRvcmc6IHByb2Nlc3MuZW52LlNFTlRSWV9PUkcsXG5cdFx0XHRcdFx0cHJvamVjdDogcHJvY2Vzcy5lbnYuU0VOVFJZX1BST0pFQ1QsXG5cdFx0XHRcdFx0cmVsZWFzZToge1xuXHRcdFx0XHRcdFx0bmFtZTogcHJvY2Vzcy5lbnYuQ09NTUlUX1NIQSxcblx0XHRcdFx0XHRcdHNldENvbW1pdHM6IHtcblx0XHRcdFx0XHRcdFx0YXV0bzogdHJ1ZSxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRzb3VyY2VtYXBzOiB7XG5cdFx0XHRcdFx0XHRmaWxlc1RvRGVsZXRlQWZ0ZXJVcGxvYWQ6IGF3YWl0IGdsb2IoW1xuXHRcdFx0XHRcdFx0XHQnLi9idWlsZC8qKi8qLm1hcCcsXG5cdFx0XHRcdFx0XHRcdCcuc2VydmVyLWJ1aWxkLyoqLyoubWFwJyxcblx0XHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0pXG5cdFx0XHQ6IG51bGwsXG5cdF0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVCxTQUFTLGNBQWMsYUFBYTtBQUNwVixTQUFTLHdCQUF3QjtBQUNqQyxTQUFTLFlBQVk7QUFDckIsU0FBUyxrQkFBa0I7QUFDM0IsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTSxPQUFPLFFBQVEsSUFBSTtBQUV6QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixPQUFPO0FBQUEsSUFDTixXQUFXLFNBQVM7QUFBQSxJQUVwQixlQUFlO0FBQUEsTUFDZCxVQUFVLENBQUMsV0FBVyxVQUFVLFVBQVUsVUFBVTtBQUFBLElBQ3JEO0FBQUEsSUFFQSxtQkFBbUIsQ0FBQyxXQUFtQjtBQUN0QyxVQUFJLE9BQU8sU0FBUyxZQUFZLEdBQUc7QUFDbEMsZUFBTztBQUFBLE1BQ1I7QUFBQSxJQUNEO0FBQUEsSUFFQSxXQUFXO0FBQUEsRUFDWjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsTUFBTTtBQUFBLE1BQ0wsbUJBQW1CLENBQUMsTUFBTTtBQUFBLE1BQzFCLG9CQUFvQjtBQUFBLE1BQ3BCLFFBQVEsT0FBTSxpQkFBZ0I7QUFDN0IsZUFBTyxXQUFXLFVBQVUsY0FBYztBQUFBLFVBQ3pDLG1CQUFtQjtBQUFBLFlBQ2xCO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBTUE7QUFBQSxZQUNBO0FBQUEsVUFDRDtBQUFBLFFBQ0QsQ0FBQztBQUFBLE1BQ0Y7QUFBQSxJQUNELENBQUM7QUFBQSxJQUNELFFBQVEsSUFBSSxvQkFDVCxpQkFBaUI7QUFBQSxNQUNqQixTQUFTLFNBQVM7QUFBQSxNQUNsQixXQUFXLFFBQVEsSUFBSTtBQUFBLE1BQ3ZCLEtBQUssUUFBUSxJQUFJO0FBQUEsTUFDakIsU0FBUyxRQUFRLElBQUk7QUFBQSxNQUNyQixTQUFTO0FBQUEsUUFDUixNQUFNLFFBQVEsSUFBSTtBQUFBLFFBQ2xCLFlBQVk7QUFBQSxVQUNYLE1BQU07QUFBQSxRQUNQO0FBQUEsTUFDRDtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1gsMEJBQTBCLE1BQU0sS0FBSztBQUFBLFVBQ3BDO0FBQUEsVUFDQTtBQUFBLFFBQ0QsQ0FBQztBQUFBLE1BQ0Y7QUFBQSxJQUNELENBQUMsSUFDQTtBQUFBLEVBQ0o7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
