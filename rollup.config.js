import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

export default [
  ...createConfig("umd"),
  ...createConfig("esm"),
  ...createConfig("system"),
];

function createConfig(format) {
  return [
    {
      input: "./src/single-spa-vue.js",
      output: {
        dir: `dist/${format}`,
        name: format === "umd" ? "singleSpaVue" : null,
        sourcemap: true,
        format: format,
      },
      plugins: [
        babel({
          exclude: "node_modules/**",
        }),
        resolve(),
        commonjs(),
        terser(),
      ],
    },
    {
      input: "./src/parcel.js",
      output: {
        dir: `dist/${format}`,
        name: format === "umd" ? "singleSpaVueParcel" : null,
        sourcemap: true,
        format,
      },
      plugins: [
        babel({
          exclude: "node_modules/**",
        }),
        resolve(),
        commonjs(),
        terser(),
      ],
      external: ["vue"],
    },
  ];
}
