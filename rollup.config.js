import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import scss from 'rollup-plugin-scss'
import sourcemaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2'
import { terser } from "rollup-plugin-terser";
import pkg from './package.json'

const copyright = `/*! ${pkg.name} v${pkg.version} | (c) ${pkg.author} | GNU GPLv3 */`;
const defaultPlugins = [
  typescript({
    typescript: require('typescript')
  }),
  commonjs({
    include: 'node_modules/**'
  }),
  resolve()
];
const externals = [
  "d3-array",
  'd3-collection',
  "d3-ease",
  "d3-scale",
  "d3-selection",
  "d3-shape",
  "d3-transition"
];
const globals = {
  'd3-array': 'd3',
  'd3-collection': 'd3',
  'd3-ease': 'd3',
  'd3-selection': 'd3',
  'd3-scale': 'd3',
  'd3-shape': 'd3',
  'd3-simple-gauge': 'd3SimpleGauge',
  'd3-tip': 'd3Tip',
  'd3-transition': 'd3',
};
const mainFileName = pkg.main.toString();

export default [
  {
    external: externals,
    input: 'src/main.ts',
    output: [
      {
        banner: copyright,
        file: mainFileName,
        format: 'umd',
        name: pkg.name,
        sourcemap: true,
        globals: globals
      },
    ],
    plugins: [
      ...defaultPlugins,
      sourcemaps(),
      scss({
        output: `${mainFileName.substr(0, mainFileName.indexOf('.'))}.css`
      })
    ],
  },
  {
    external: externals,
    input: 'src/main.ts',
    output: [
      {
        file: `${mainFileName.substr(0, mainFileName.indexOf('.'))}.min.js`,
        format: 'umd',
        name: pkg.name,
        sourcemap: false,
        globals: globals
      },
    ],
    plugins: [
      ...defaultPlugins,
      terser({ output: { preamble: copyright } })
    ],
  }
]
