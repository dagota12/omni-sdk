import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import path from 'path';

const createConfig = (pkgName) => ({
  input: `packages/${pkgName}/src/index.ts`,
  output: [
    {
      file: `packages/${pkgName}/dist/index.cjs.js`,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: `packages/${pkgName}/dist/index.esm.js`,
      format: 'esm',
      sourcemap: true,
    },
    // UMD format is primarily for the core SDK for direct <script> use
    ...(pkgName === 'sdk' ? [{
      file: `packages/${pkgName}/dist/index.umd.js`,
      format: 'umd',
      name: 'OmniAnalytics', // Global variable name
      sourcemap: true,
      plugins: [terser()], // Minify UMD output
    }] : []),
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({ tsconfig: `./packages/${pkgName}/tsconfig.json` }),
  ],
  // For react package, externalize react/react-dom
  external: pkgName === 'react' ? ['react', 'react-dom'] : [],
});

// Build configurations for both packages
export default [
  createConfig('sdk'),
  createConfig('react'),
];
