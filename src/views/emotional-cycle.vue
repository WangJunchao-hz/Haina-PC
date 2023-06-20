<template>
	<div style="display: flex">
		<holiday-date @change="dateChange"></holiday-date>
		<span style="line-height: 32px">
			当前时间往后
			<a-input-search
				style="width: 88px"
				v-model:value="dateRange"
				enter-button
				@search="onSearch"
			/>
			天
		</span>
	</div>
	<div class="content">
		<a-card title="全情指数" class="chart-card">
			<single-chart :options="charts.qqzs" style="height: 518px"></single-chart>
			<single-chart :options="charts.zqzs" style="height: 518px"></single-chart>
			<single-chart :options="charts.kqzs" style="height: 518px"></single-chart>
			<single-chart :options="charts.lHzs" style="height: 280px"></single-chart>
		</a-card>
	</div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { EChartsOption } from 'echarts'
import dayjs from 'dayjs'
import { GetEmotionStatistics } from '@/common/api/uni-cloud-api'
import HolidayDate from '@/components/HolidayDate.vue'
import SingleChart from '@/components/SingleChart.vue'
import { resolutionEmotion } from '@/common/utils'
const charts = ref<{
	[name: string]: EChartsOption
}>({
	qqzs: {
		xAxis: {
			data: [],
		},
		series: [],
	},
	lHzs: {
		xAxis: {
			data: [],
		},
		series: [
			{
				data: [],
			},
		],
	},
	zqzs: {
		xAxis: {
			data: [],
		},
		series: [
			{
				data: [],
			},
		],
	},
	kqzs: {
		xAxis: {
			data: [],
		},
		series: [
			{
				data: [],
			},
		],
	},
})
const dateRange = ref<number>(28)
let endDate: string = dayjs().format('YYYY-MM-DD')
let startDate: string = dayjs(endDate)
	.subtract(dateRange.value, 'd')
	.format('YYYY-MM-DD')
getEmotionData({
	startDate,
	endDate,
})
function dateChange(d: string) {
	endDate = d
	startDate = dayjs(endDate).subtract(dateRange.value, 'd').format('YYYY-MM-DD')
	getEmotionData({
		startDate,
		endDate,
	})
}
function onSearch() {
	startDate = dayjs(endDate).subtract(dateRange.value, 'd').format('YYYY-MM-DD')
	getEmotionData({
		startDate,
		endDate,
	})
}
function getEmotionData(param: {
	date?: string
	endDate: string
	startDate: string
}) {
	GetEmotionStatistics(param).then((res) => {
		if (res.data) {
			const resData = resolutionEmotion(res.data.data)
			console.log(resData)
			const commonOpts = {
				type: 'line',
				areaStyle: {},
				lineStyle: {
					width: 0,
				},
				showSymbol: false,
				smooth: true,
				markLine: {
					data: [{ type: 'average', name: '平均值' }],
				},
				markPoint: {
					data: [
						{ type: 'max', name: '最大值' },
						{ type: 'min', name: '最小值' },
					],
				},
			}
			;(charts.value.qqzs as any).xAxis.data = resData.dates
			;(charts.value.qqzs as any).series = []
			;(charts.value.qqzs as any).series.push(
				{
					name: '全情指数',
					data: resData.qqzs,
					...commonOpts,
				},
				{
					name: '市场指数',
					data: resData.sczs.data,
					...commonOpts,
				},
				{
					name: '连板指数',
					data: resData.lbzs.data,
					...commonOpts,
				},
				{
					name: '首板指数',
					data: resData.firstZs.data,
					...commonOpts,
				},
				{
					name: '反包指数',
					data: resData.fbzs.data,
					...commonOpts,
				},
				{
					name: '断板指数',
					data: resData.dbzs.data,
					...commonOpts,
				}
			)
			;(charts.value.lHzs as any).xAxis.data = resData.dates
			;(charts.value.lHzs as any).series = []
			;(charts.value.lHzs as any).series.push(
				{
					name: '连板高度',
					type: 'bar',
					barWidth: '28%',
					data: resData.lbH,
				},
				{
					name: '连停高度',
					type: 'bar',
					barWidth: '28%',
					data: resData.ltH,
				}
			)
			;(charts.value.zqzs as any).xAxis.data = resData.dates
			;(charts.value.zqzs as any).series = []
			;(charts.value.zqzs as any).series.push(
				{
					name: '总赚钱效应',
					data: resData.profitzs,
					...commonOpts,
				},
				{
					name: '市场赚钱效应',
					data: resData.sczs.profit,
					...commonOpts,
				},
				{
					name: '连板赚钱效应',
					data: resData.lbzs.profit,
					...commonOpts,
				},
				{
					name: '首板赚钱效应',
					data: resData.firstZs.profit,
					...commonOpts,
				},
				{
					name: '反包赚钱效应',
					data: resData.fbzs.profit,
					...commonOpts,
				},
				{
					name: '断板赚钱效应',
					data: resData.dbzs.profit,
					...commonOpts,
				}
			)
			;(charts.value.kqzs as any).xAxis.data = resData.dates
			;(charts.value.kqzs as any).series = []
			;(charts.value.kqzs as any).series.push(
				{
					name: '总亏钱效应',
					data: resData.losszs,
					...commonOpts,
				},
				{
					name: '市场亏钱效应',
					data: resData.sczs.loss,
					...commonOpts,
				},
				{
					name: '连板亏钱效应',
					data: resData.lbzs.loss,
					...commonOpts,
				},
				{
					name: '首板亏钱效应',
					data: resData.firstZs.loss,
					...commonOpts,
				},
				{
					name: '反包亏钱效应',
					data: resData.fbzs.loss,
					...commonOpts,
				},
				{
					name: '断板亏钱效应',
					data: resData.dbzs.loss,
					...commonOpts,
				}
			)
		}
	})
}
</script>
<style scoped lang="scss">
.content {
	height: calc(100% - 32px);
	overflow: auto;
}
.chart-card {
	:deep(.ant-card-body) {
		padding: 0;
	}
}
</style>
