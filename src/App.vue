<template>
	<a-config-provider :locale="zhCN">
		<a-layout style="height: 100vh">
			<div class="main">
				<router-view></router-view>
			</div>
			<!-- <a-layout-sider v-model:collapsed="collapsed" collapsible>
				<a-menu
					v-model:selectedKeys="selectedKeys"
					theme="dark"
					mode="inline"
					:openKeys="['replay']"
					@click="menuClick"
				>
					<template v-for="menu in menus">
						<a-sub-menu v-if="menu.children" :key="menu.key">
							<template #icon>
								<component :is="menu.icon"></component>
							</template>
							<template #title>{{ menu.label }}</template>
							<a-menu-item v-for="child in menu.children" :key="child.key">
								{{ child.label }}
							</a-menu-item>
						</a-sub-menu>
						<a-menu-item :key="menu.key + ''" v-else>
							<component :is="menu.icon"></component>
							<span>{{ menu.label }}</span>
						</a-menu-item>
					</template>
				</a-menu>
			</a-layout-sider>
			<a-layout>
				<a-layout-content style="margin: 0 16px">
					<a-breadcrumb style="margin: 16px 0">
						<a-breadcrumb-item v-for="item in breadcrumbs" :key="item.key">
							<component :is="item.icon"></component>
							{{ item.label }}
						</a-breadcrumb-item>
					</a-breadcrumb>
					<div class="main">
						<router-view></router-view>
					</div>
				</a-layout-content>
			</a-layout> -->
		</a-layout>
	</a-config-provider>
</template>
<script setup lang="ts">
import {
	AreaChartOutlined,
	LineChartOutlined,
	RadarChartOutlined,
	StockOutlined,
} from '@ant-design/icons-vue'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'
// 获取当前路由
const route = useRoute()
// 获取路由实例
const router = useRouter()
const collapsed = ref<boolean>(false)
const selectedKeys = ref<string[]>([])
const menus = ref<MenuItem[]>([
	{
		icon: LineChartOutlined,
		label: '复盘',
		key: 'replay',
	},
	{
		icon: LineChartOutlined,
		label: '悟道',
		key: 'stock',
	},
	{
		icon: LineChartOutlined,
		label: '进销存管理',
		key: 'inventory',
	},
	{
		icon: AreaChartOutlined,
		label: '数据映射管理',
		key: 'dataMap',
	},
	// {
	// 	icon: AreaChartOutlined,
	// 	label: '情绪周期',
	// 	key: 'emotionalCycle',
	// },
	// {
	// 	icon: LineChartOutlined,
	// 	label: '主线周期',
	// 	key: 'mainlineCycle',
	// },
	// {
	// 	icon: StockOutlined,
	// 	label: '趋势周期',
	// 	key: 'trendCycle',
	// },
])
const menuMap = new Map()
menus.value.forEach((m) => {
	menuMap.set(m.key, m)
	if (m.children) {
		m.children.forEach((c) => {
			menuMap.set(c.key, c)
		})
	}
})
const breadcrumbs = ref<BreadcrumbItem[]>([])
// 当前路由发生变化时，调用回调函数
watch(route, () => {
	selectedKeys.value.push(route.name as string)
	breadcrumbs.value = [menuMap.get(route.name)]
})
function menuClick(item: any) {
	router.push({
		name: item.key,
	})
}
</script>
<style lang="scss" scoped>
.ant-layout-content {
	.main {
		background-color: #fff;
		margin-bottom: 18px;
		height: calc(100% - 72px);
	}
}
.main {
	background-color: #fff;
	height: 100vh;
}
</style>
<style>
::-webkit-scrollbar-thumb {
	border-radius: 8px;
	background-color: #c9c9c9;
}
::-webkit-scrollbar {
	width: 6px;
	height: 6px;
	background-color: transparent;
}
.ant-modal-body {
	padding: 0 !important;
}
.ant-table-wrapper {
	height: 100%;
	.ant-spin-nested-loading {
		height: 100%;
		.ant-spin-container,
		.ant-table,
		.ant-table-container {
			height: 100%;
		}
	}
}
</style>
