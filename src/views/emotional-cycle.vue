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
		<a-button @click="scQ" type="primary" style="margin-left: 8px">
			分析
		</a-button>
	</div>
	<div class="content">
		<a-card title="全情指数" class="chart-card">
			<single-chart :options="charts.qqzs" style="height: 518px"></single-chart>
			<single-chart :options="charts.zqzs" style="height: 518px"></single-chart>
			<single-chart :options="charts.kqzs" style="height: 518px"></single-chart>
			<single-chart :options="charts.lHzs" style="height: 280px"></single-chart>
		</a-card>
	</div>
	<a-modal
		v-model:visible="analysis.visible"
		title="情绪分析"
		@ok="analysis.visible = false"
		:width="888"
	>
		<a-table
			:columns="analysis.columns"
			:data-source="analysis.data"
			:pagination="false"
		>
			<template #bodyCell="{ column, record }">
				<template v-if="column.dataIndex === 'action'">
					<a-button
						v-if="record[column.dataIndex]"
						@click="copy(record[column.dataIndex])"
						size="small"
						type="primary"
					>
						复制
					</a-button>
				</template>
				<template v-else>
					<span>{{ record[column.dataIndex] }}</span>
				</template>
			</template>
		</a-table>
	</a-modal>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { EChartsOption } from 'echarts'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import 'ant-design-vue/es/message/style/css'
import useClipboard from 'vue-clipboard3'
import { GetEmotionStatistics } from '@/common/api/uni-cloud-api'
import HolidayDate from '@/components/HolidayDate.vue'
import SingleChart from '@/components/SingleChart.vue'
import { replaceTpl, resolutionEmotion, getStartDate } from '@/common/utils'
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
const fixed = '不包含st，不包含新股，不包含停牌'
const qEum = {
	firstQ: '今日涨停，今日首板，' + fixed,
	lbQ: '今日涨停，今日连续涨停天数大于1，' + fixed,
	fbQ: '今日涨停，今日连续涨停天数等于1，' + fixed,
	dbQ: '昨日涨停，今日非涨停，' + fixed,
}
const today = ref<{
	firstQ: string
	lbQ: string
	fbQ: string
	dbQ: string
}>({
	firstQ: '',
	lbQ: '',
	fbQ: '',
	dbQ: '',
})
function scQ() {
	analysis.value.visible = true
	today.value.firstQ = replaceTpl(qEum.firstQ, currentDate.value)
	today.value.lbQ = replaceTpl(qEum.lbQ, currentDate.value)
	today.value.fbQ = replaceTpl(qEum.fbQ, currentDate.value)
	today.value.dbQ = replaceTpl(qEum.dbQ, currentDate.value)
}
const { toClipboard } = useClipboard()
function copy(prop: string) {
	const q = (today.value as any)[prop]
	// console.log(prop, q)
	toClipboard(q)
		.then(() => {
			message.success('复制成功')
		})
		.catch(() => {
			message.success('复制失败')
		})
}
const analysis = ref<{
	visible: boolean
	columns: {
		title: string
		dataIndex: string
		[name: string]: any
	}[]
	data: any[]
	res: string
}>({
	visible: false,
	columns: [
		{
			title: '类型',
			dataIndex: 'name',
		},
		{
			title: '指数',
			dataIndex: 'value',
		},
		{
			title: '赚钱效应',
			dataIndex: 'profit',
		},
		{
			title: '亏钱效应',
			dataIndex: 'loss',
		},
		{
			title: '操作',
			dataIndex: 'action',
		},
	],
	data: [],
	res: '',
})
const currentDate = ref<string>('')
const dateRange = ref<number>(20)
let endDate: string = dayjs().format('YYYY-MM-DD')
currentDate.value = endDate
let startDate: string = getStartDate(endDate, dateRange.value)
getEmotionData({
	startDate,
	endDate,
})
function dateChange(d: string) {
	endDate = d
	currentDate.value = d
	startDate = getStartDate(endDate, dateRange.value)
	getEmotionData({
		startDate,
		endDate,
	})
}
function onSearch() {
	startDate = getStartDate(endDate, dateRange.value)
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
		;(charts.value.qqzs as any).xAxis.data = []
		;(charts.value.qqzs as any).series = []
		;(charts.value.lHzs as any).xAxis.data = []
		;(charts.value.lHzs as any).series = []
		;(charts.value.zqzs as any).xAxis.data = []
		;(charts.value.zqzs as any).series = []
		;(charts.value.kqzs as any).xAxis.data = []
		;(charts.value.kqzs as any).series = []
		analysis.value.data = []
		if (res.data) {
			const resData = resolutionEmotion(res.data.data)
			console.log('分析完：', resData)
			const len = resData.dates.length
			analysis.value.data.push({
				name: '全情',
				value: resData.qqzs[len - 1],
				profit: resData.profitzs[len - 1],
				loss: resData.losszs[len - 1],
			})
			analysis.value.data.push({
				name: '市场',
				value: resData.sczs.data[len - 1],
				profit: resData.sczs.profit[len - 1],
				loss: resData.sczs.loss[len - 1],
			})
			analysis.value.data.push({
				name: '连板',
				value: resData.lbzs.data[len - 1],
				profit: resData.lbzs.profit[len - 1],
				loss: resData.lbzs.loss[len - 1],
				action: 'lbQ',
			})
			analysis.value.data.push({
				name: '首板',
				value: resData.firstZs.data[len - 1],
				profit: resData.firstZs.profit[len - 1],
				loss: resData.firstZs.loss[len - 1],
				action: 'firstQ',
			})
			// analysis.value.data.push({
			// 	name: '反包',
			// 	value: resData.fbzs.data[len - 1],
			// 	profit: resData.fbzs.profit[len - 1],
			// 	loss: resData.fbzs.loss[len - 1],
			// 	action: 'fbQ',
			// })
			// analysis.value.data.push({
			// 	name: '断板',
			// 	value: resData.dbzs.data[len - 1],
			// 	profit: resData.dbzs.profit[len - 1],
			// 	loss: resData.dbzs.loss[len - 1],
			// 	action: 'dbQ',
			// })
			const h1 = resData.lbH[len - 1]
			const h2 = resData.lbH[len - 2]
			let lossText = '-'
			if (h1 < h2) {
				lossText = '退潮'
			} else if (h1 === h2) {
				lossText = '分歧'
			}
			analysis.value.data.push({
				name: '高度',
				value: h1,
				profit: h1 > h2 ? '持续' : '-',
				loss: lossText,
			})
			const areaOpts = {
				areaStyle: {},
				lineStyle: {
					width: 0,
				},
				showSymbol: false,
			}
			const commonOpts = {
				type: 'line',
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
			;(charts.value.qqzs as any).series.push(
				{
					name: '全情指数',
					data: resData.qqzs,
					...commonOpts,
					...areaOpts,
				},
				{
					name: '市场指数',
					data: resData.sczs.data,
					...commonOpts,
					...areaOpts,
				},
				{
					name: '连板指数',
					data: resData.lbzs.data,
					...commonOpts,
					...areaOpts,
				},
				{
					name: '首板指数',
					data: resData.firstZs.data,
					...commonOpts,
					...areaOpts,
				},
				// {
				// 	name: '反包指数',
				// 	data: resData.fbzs.data,
				// 	...commonOpts,
				// 	...areaOpts,
				// },
				// {
				// 	name: '断板指数',
				// 	data: resData.dbzs.data,
				// 	...commonOpts,
				// 	...areaOpts,
				// },
				{
					name: '狂热指数',
					data: resData.hot,
					...commonOpts,
				},
				{
					name: '恐慌指数',
					data: resData.scare,
					...commonOpts,
				}
			)
			;(charts.value.lHzs as any).xAxis.data = resData.dates
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
			;(charts.value.zqzs as any).series.push(
				{
					name: '总赚钱效应',
					data: resData.profitzs,
					...commonOpts,
					...areaOpts,
				},
				{
					name: '市场赚钱效应',
					data: resData.sczs.profit,
					...commonOpts,
					...areaOpts,
				},
				{
					name: '连板赚钱效应',
					data: resData.lbzs.profit,
					...commonOpts,
					...areaOpts,
				},
				{
					name: '首板赚钱效应',
					data: resData.firstZs.profit,
					...commonOpts,
					...areaOpts,
				}
				// {
				// 	name: '反包赚钱效应',
				// 	data: resData.fbzs.profit,
				// 	...commonOpts,
				// },
				// {
				// 	name: '断板赚钱效应',
				// 	data: resData.dbzs.profit,
				// 	...commonOpts,
				// }
			)
			;(charts.value.kqzs as any).xAxis.data = resData.dates
			;(charts.value.kqzs as any).series.push(
				{
					name: '总亏钱效应',
					data: resData.losszs,
					...commonOpts,
					...areaOpts,
				},
				{
					name: '市场亏钱效应',
					data: resData.sczs.loss,
					...commonOpts,
					...areaOpts,
				},
				{
					name: '连板亏钱效应',
					data: resData.lbzs.loss,
					...commonOpts,
					...areaOpts,
				},
				{
					name: '首板亏钱效应',
					data: resData.firstZs.loss,
					...commonOpts,
					...areaOpts,
				}
				// {
				// 	name: '反包亏钱效应',
				// 	data: resData.fbzs.loss,
				// 	...commonOpts,
				// },
				// {
				// 	name: '断板亏钱效应',
				// 	data: resData.dbzs.loss,
				// 	...commonOpts,
				// }
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
.q {
	margin-left: 18px;
}
</style>
