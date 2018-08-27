import commonjs from 'rollup-plugin-commonjs';
import scss from 'rollup-plugin-scss'
import sourcemaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'

const mainFileName = pkg.main.toString();

export default {
  input: 'src/main.ts',
  output: [
    {
      file: mainFileName,
      format: 'umd',
      name: pkg.name,
      sourcemap: true,
      globals: {
        'd3': 'd3',
        'd3-collection': 'd3',
        'd3-selection': 'd3',
        'd3-simple-gauge': 'd3SimpleGauge',
        'd3-tip': 'd3Tip'
      }
    },
  ],
  external: [
    'd3',
    'd3-collection',
    'd3-selection'
  ],
  plugins: [
    commonjs({
      include: 'node_modules/**'
    }),
    typescript({
      typescript: require('typescript')
    }),
    sourcemaps(),
    scss({
      output: `${mainFileName.substr(0, mainFileName.indexOf('.'))}.css`
    })
  ],
}
