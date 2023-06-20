import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		Components({
			resolvers: [AntDesignVueResolver()],
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	server: {
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
