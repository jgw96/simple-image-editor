import resolve from 'rollup-plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import { injectManifest } from 'rollup-plugin-workbox';
import html from '@open-wc/rollup-plugin-html';
import strip from '@rollup/plugin-strip';
import copy from 'rollup-plugin-copy';
import wasm from '@rollup/plugin-wasm';

export default {
  input: 'index.html',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    resolve(),
    wasm(),
    html(),
    terser(),
    copy({
      targets: [
        { src: 'assets/**/*', dest: 'dist/assets/' },
        { src: 'styles/global.css', dest: 'dist/styles/'},
        { src: 'manifest.json', dest: 'dist/'},
        { src: '.well-known/*', dest: 'dist/.well-known/' },
        { src: 'routes.json', dest: 'dist/' },
      ]
    }),
    injectManifest({
      swSrc: 'pwabuilder-sw.js',
      swDest: 'dist/pwabuilder-sw.js',
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