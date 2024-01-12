import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
const EmotionalCycle = () => import('@/views/emotional-cycle.vue')
const MainlineCycle = () => import('@/views/mainline-cycle.vue')
const TrendCycle = () => import('@/views/trend-cycle.vue')
const EmotionStatistics = () => import('@/views/emotion-statistics.vue')
const ThemeStatistics = () => import('@/views/theme-statistics.vue')
const TrendStatistics = () => import('@/views/trend-statistics.vue')
const PriceAnalysis = () => import('@/views/price-analysis.vue')
const DataMap = () => import('@/views/data-map.vue')
const Inventory = () => import('@/views/inventory.vue')
const Stock = () => import('@/views/stock.vue')
const routersConfig: Readonly<RouteRecordRaw[]> = [
	{
		path: '/',
		redirect: '/stock',
	},
	{
		name: 'stock',
		path: '/stock',
		component: Stock,
	},
	// {
	// 	name: 'inventory',
	// 	path: '/inventory',
	// 	component: Inventory,
	// },
	// {
	// 	name: 'priceAnalysis',
	// 	path: '/price-analysis',
	// 	component: PriceAnalysis,
	// },
	// {
	// 	name: 'dataMap',
	// 	path: '/data-map',
	// 	component: DataMap,
	// },

	// {
	// 	name: 'emotionalCycle',
	// 	path: '/emotional-cycle',
	// 	component: EmotionalCycle,
	// },
	// {
	// 	name: 'mainlineCycle',
	// 	path: '/mainline-cycle',
	// 	component: MainlineCycle,
	// },
	// {
	// 	name: 'trendCycle',
	// 	path: '/trend-cycle',
	// 	component: TrendCycle,
	// },
	// {
	// 	name: 'emotionStatistics',
	// 	path: '/emotion-statistics',
	// 	component: EmotionStatistics,
	// },
	// {
	// 	name: 'trendStatistics',
	// 	path: '/trend-statistics',
	// 	component: TrendStatistics,
	// },
	// {
	// 	name: 'themeStatistics',
	// 	path: '/theme-statistics',
	// 	component: ThemeStatistics,
	// },
]
const router = createRouter({
	history: createWebHashHistory(),
	routes: routersConfig,
})
export default router
