/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import path, { resolve } from 'path'

import { VitePluginNode } from 'vite-plugin-node'
import { defineConfig } from 'vite'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'

const resolvePath = (str: string) => {
  return path.resolve(__dirname, str)
}

export default defineConfig({
  mode: 'development',
  build: {
    lib: {
      entry: resolve(__dirname, './index.ts'),
      name: '@autofut/parser',
      // the proper extensions will be added
      fileName: 'index',
    },
    sourcemap: true,
    rollupOptions: {
      plugins: [
        // @ts-ignore
        typescript({
          compilerOptions: {
            target: 'es6',
            module: 'esnext',
            typeRoots: ['node_modules/@types'],
            resolveJsonModule: true,
            // include: ['index.ts', 'src', 'vite.config.ts'],
            outDir: resolve(__dirname, 'dist'),
          },
          target: 'es6',
          rootDir: resolvePath('./src'),
          declaration: true,
          declarationMap: true,
          exclude: resolvePath('./node_modules/**'),
          allowSyntheticDefaultImports: true,
          outDir: resolve(__dirname, 'dist'),
        }),
        // @ts-ignore
        ...VitePluginNode({
          adapter: 'express',
          appPath: './index.ts',
          tsCompiler: 'esbuild',
        }),
        // @ts-ignore
        commonjs(),
      ],
    },
  },
})
