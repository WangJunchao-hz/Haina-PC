<template>
	<div ref="ChartDom"></div>
</template>
<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { extend } from '@/common/utils'
import { EChartsOption, EChartsType } from 'echarts'
import * as echarts from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import {
	GridComponent,
	TooltipComponent,
	ToolboxComponent,
	MarkLineComponent,
	MarkPointComponent,
	LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { UniversalTransition } from 'echarts/features'
echarts.use([
	LineChart,
	GridComponent,
	UniversalTransition,
	CanvasRenderer,
	TooltipComponent,
	MarkLineComponent,
	MarkPointComponent,
	BarChart,
	ToolboxComponent,
	LegendComponent,
])
const ChartDom = ref<HTMLElement>()
const { options } = defineProps<{
	options: EChartsOption
}>()
const defaultOptions = {
	tooltip: {
		trigger: 'axis',
	},
	grid: {
		left: 48,
		right: 48,
		top: 48,
		bottom: 28,
	},
	legend: {},
	xAxis: {
		type: 'category',
		data: [],
		axisTick: {
			alignWithLabel: true,
		},
	},
	yAxis: {
		type: 'value',
	},
	series: [
		{
			data: [],
			type: 'line',
			// smooth: false,
			// areaStyle: {},
			// markPoint: {
			// 	data: [
			// 		{ type: 'max', name: '最大值' },
			// 		{ type: 'min', name: '最小值' },
			// 	],
			// },
			// markLine: {
			// 	data: [{ type: 'average', name: '平均值' }],
			// },
		},
	],
}
let chart: EChartsType = null as any
watch(
	options,
	() => {
		nextTick(() => {
			if (!chart) {
				chart = echarts.init(ChartDom.value!) as any
			}
			if (options) {
				// console.log(extend(defaultOptions, options), options)
				chart.clear()
				chart.setOption(extend(defaultOptions, options))
			}
		})
	},
	{ deep: true, immediate: true }
)
</script>
