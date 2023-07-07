import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
const EmotionalCycle = () => import('@/views/emotional-cycle.vue')
const MainlineCycle = () => import('@/views/mainline-cycle.vue')
const EmotionStatistics = () => import('@/views/emotion-statistics.vue')
const ThemeStatistics = () => import('@/views/theme-statistics.vue')
const Emotion = () => import('@/views/emotion.vue')
const routersConfig: Readonly<RouteRecordRaw[]> = [
	{
		path: '/',
		redirect: '/emotional-cycle',
	},
	{
		name: 'emotionalCycle',
		path: '/emotional-cycle',
		component: EmotionalCycle,
	},
	{
		name: 'mainlineCycle',
		path: '/mainline-cycle',
		component: MainlineCycle,
	},
	{
		name: 'emotionStatistics',
		path: '/emotion-statistics',
		component: EmotionStatistics,
	},
	{
		name: 'emotion',
		path: '/emotion',
		component: Emotion,
	},
	{
		name: 'themeStatistics',
		path: '/theme-statistics',
		component: ThemeStatistics,
	},
]
const router = createRouter({
	history: createWebHashHistory(),
	routes: routersConfig,
})
export default router
