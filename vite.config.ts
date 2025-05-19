import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/single-spa-vue.ts",
      formats: ["es"],
    },
  },
});
