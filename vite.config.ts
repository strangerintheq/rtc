import {defineConfig} from 'vite'
import preact from '@preact/preset-vite'
import {resolve} from 'path';
import mkcert from 'vite-plugin-mkcert'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
    build: {
        minify: true,
    },
    plugins: [
        mkcert(),
        preact(),
        viteStaticCopy({
            targets: [
                {
                    src: resolve(__dirname, './cfg.js') ,
                    dest: './',
                },
            ],
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    }
})
