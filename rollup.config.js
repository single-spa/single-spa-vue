import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import vuePlugin from "rollup-plugin-vue";

export default [
  {
    input: "./src/single-spa-vue.js",
    output: {
      dir: "lib",
      name: "singleSpaVue",
      sourcemap: true,
      format: "umd"
    },
    plugins: [
      babel({
        exclude: "node_modules/**"
      }),
      resolve(),
      commonjs(),
      terser()
    ]
  },
  {
    input: "./src/parcel.vue",
    output: {
      dir: "lib",
      name: "parcel",
      sourcemap: true,
      format: "umd"
    },
    plugins: [
      babel({
        exclude: "node_modules/**"
      }),
      resolve(),
      commonjs(),
      vuePlugin()
    ]
  }
];
