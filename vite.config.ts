import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {
	AntDesignVueResolver,
	ElementPlusResolver,
} from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		AutoImport({
			resolvers: [ElementPlusResolver()],
		}),
		Components({
			resolvers: [AntDesignVueResolver(), ElementPlusResolver()],
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	server: {
		host: '0.0.0.0',
		proxy: {
			'/holiday': {
				target: 'https://timor.tech/api/holiday/year',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/holiday/, ''),
			},
			'/wencai': {
				target: 'https://www.iwencai.com',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/wencai/, ''),
			},
			'/uni-cloud': {
				target:
					'https://fc-mp-7f470fd4-438a-472b-87c3-4f3b10bfad95.next.bspapp.com',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/uni-cloud/, ''),
			},
			'/kaipanla': {
				target: 'https://apphis.longhuvip.com',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/kaipanla/, ''),
			},
		},
	},
})
