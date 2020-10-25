import resolve from 'rollup-plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import { injectManifest } from 'rollup-plugin-workbox';
import html from '@open-wc/rollup-plugin-html';
import copy from 'rollup-plugin-copy';
import wasm from '@rollup/plugin-wasm';

export default {
  input: 'index.html',
  output: {
    dir: 'dist/app/',
    format: 'es',
  },
  plugins: [
    resolve(),
    wasm(),
    html(),
    terser(),
    copy({
      targets: [
        { src: 'assets/**/*', dest: 'dist/app/assets/' },
        { src: 'styles/global.css', dest: 'dist/app/styles/'},
        { src: 'manifest.json', dest: 'dist/app/'},
        { src: '.well-known/*', dest: 'dist/app/.well-known/' },
        { src: 'routes.json', dest: 'dist/' },
      ]
    }),
    injectManifest({
      swSrc: 'pwabuilder-sw.js',
      swDest: 'dist/app/pwabuilder-sw.js',
      globDirectory: 'dist/',
      globPatterns: [
        'styles/*.css',
        '**/*/*.svg',
        '*.js',
        '*.html',
        'assets/**'
      ]
    }),
  ]
};