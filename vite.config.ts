import { defineConfig } from "vite";
import pluginExternal from "vite-plugin-external";

export default defineConfig({
  build: {
    lib: {
      entry: ["./src/single-spa-vue.ts", "./src/parcel.ts"],
      formats: ["es"],
    },
    outDir: "lib",
  },
  plugins: [
    pluginExternal({
      externalizeDeps: ["vue"],
    }),
  ],
});
