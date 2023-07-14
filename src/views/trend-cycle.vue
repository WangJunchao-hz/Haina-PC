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
		<a-button @click="seeCalendar" type="primary" style="margin-left: 8px">
			日历
		</a-button>
	</div>
	<a-tabs
		v-model:activeKey="activeTab"
		style="height: calc(100% - 72px); overflow: auto"
	>
		<a-tab-pane key="1" tab="个股" style="height: 100%">
			<a-card title="趋势情绪" class="chart-card">
				<single-chart
					:options="charts.stock"
					style="height: 518px"
				></single-chart>
				<div>
					<span style="padding-right: 18px"
						>指数：{{ currentZhiShu.score }}</span
					>
					<span style="padding-right: 18px"
						>赚钱效应：{{ currentZhiShu.profit }}</span
					>
					<span>亏钱效应：{{ currentZhiShu.loss }}</span>
				</div>
				<a-table
					:columns="stockList.columns"
					:data-source="stockList.data"
					:pagination="false"
					style="height: 100%"
					:scroll="{ y: 588 }"
				>
					<template #bodyCell="{ column, record }">
						<template v-if="column.dataIndex === 'gns'">
							<a-button
								type="link"
								size="small"
								v-for="gn in record[column.dataIndex]"
								@click="seeStocks(gn)"
							>
								{{ gn.label }}({{ gn.num }})
							</a-button>
						</template>
						<template v-else>
							<span v-if="column.dataIndex.includes('zdf')">
								{{ record[column.dataIndex] }}%
							</span>
							<span v-else>{{ record[column.dataIndex] }}</span>
						</template>
					</template>
				</a-table>
			</a-card>
		</a-tab-pane>
		<a-tab-pane key="2" tab="板块">
			<a-table
				:columns="gnsArray.columns"
				:data-source="gnsArray.data"
				:pagination="false"
				style="height: 100%"
				:scroll="{ y: 'calc(100% - 55px)' }"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.dataIndex === 'score'">
						<a-button type="link" @click="seeGnQS(record, 'score')">
							{{ record[column.dataIndex] }}
						</a-button>
					</template>
					<template v-else-if="column.dataIndex === 'label'">
						<a-button type="link" @click="seeGnQS(record, 'label')">
							{{ record[column.dataIndex] }}
						</a-button>
					</template>
					<template v-else>
						<span>{{ record[column.dataIndex] }}</span>
					</template>
				</template>
			</a-table>
		</a-tab-pane>
	</a-tabs>
	<a-modal
		v-model:visible="gnQS.visible"
		:title="gnQS.title"
		@ok="gnQS.visible = false"
		:width="888"
	>
		<single-chart :options="charts.gn" style="height: 518px"></single-chart>
	</a-modal>
	<a-modal
		v-model:visible="stockModel.visible"
		:title="stockModel.title"
		@ok="stockModel.visible = false"
		:width="1288"
	>
		<simple-table :columns="gna.columns" :data="gna.data"></simple-table>
		<a-table
			:columns="gnToStock.columns"
			:data-source="gnToStock.data"
			:pagination="false"
			style="height: 100%"
			:scroll="{ y: 588 }"
		>
			<template #bodyCell="{ column, record }">
				<template v-if="column.dataIndex === 'gns'">
					<a-button
						type="link"
						size="small"
						v-for="gn in record[column.dataIndex]"
						@click="seeStocks(gn)"
					>
						{{ gn.label }}({{ gn.num }})
					</a-button>
				</template>
				<template v-else>
					<span v-if="column.dataIndex.includes('zdf')">
						{{ record[column.dataIndex] }}%
					</span>
					<span v-else>{{ record[column.dataIndex] }}</span>
				</template>
			</template>
		</a-table>
	</a-modal>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UniCloudGet } from '@/common/api/uni-cloud-api'
import {
	TrendCycleGnColumns,
	TrendStockColumns,
	GNAColumns,
	TrendStockListColumns,
} from '@/common/enum'
import SimpleTable from '@/components/SimpleTable.vue'
import {
	resolutionTrendStocksCycle,
	resolutionTrendGnsCycle,
	Cache,
} from '@/common/utils'
import SingleChart from '@/components/SingleChart.vue'
import dayjs, { Dayjs } from 'dayjs'
import HolidayDate from '@/components/HolidayDate.vue'
const dateRange = ref<number>(28)
const activeTab = ref<string>('1')
let currentStockInfo: any = {}
let currentGnInfo: any = {}
const currentZhiShu = ref<{
	score: number
	profit: number
	loss: number
}>({
	score: 0,
	profit: 0,
	loss: 0,
})
const stockModel = ref<{
	title: string
	visible: boolean
}>({
	title: '',
	visible: false,
})
const gna = ref<{
	columns: SimpleTableColumn[]
	data: any[]
}>({
	columns: GNAColumns,
	data: [],
})
const gnToStock = ref<{
	columns: any[]
	data: any[]
}>({
	columns: TrendStockColumns,
	data: [],
})
const stockList = ref<{
	columns: any[]
	data: any[]
}>({
	columns: TrendStockListColumns,
	data: [],
})
const gnQS = ref<{
	title: string
	visible: boolean
}>({
	title: '',
	visible: false,
})
const gnsArray = ref<{
	columns: any[]
	data: any[]
}>({
	columns: TrendCycleGnColumns,
	data: [],
})
const charts = ref<{
	stock: {
		xAxis: {
			data: string[]
		}
		series: any[]
	}
	gn: {
		xAxis: {
			data: string[]
		}
		series: any[]
	}
}>({
	stock: {
		xAxis: {
			data: [],
		},
		series: [],
	},
	gn: {
		xAxis: {
			data: [],
		},
		series: [],
	},
})
let endDate: string = dayjs().format('YYYY-MM-DD')
let startDate: string = dayjs(endDate)
	.subtract(dateRange.value, 'd')
	.format('YYYY-MM-DD')
getTrendData({
	startDate,
	endDate,
})
const currentDate = ref<Dayjs>(dayjs())
function dateChange(date: string) {
	endDate = date
	currentDate.value = dayjs(date)
	startDate = dayjs(endDate).subtract(dateRange.value, 'd').format('YYYY-MM-DD')
	getTrendData({
		startDate,
		endDate,
	})
}
function onSearch() {
	startDate = dayjs(endDate).subtract(dateRange.value, 'd').format('YYYY-MM-DD')
	getTrendData({
		startDate,
		endDate,
	})
}
function getTrendData(param: {
	date?: string
	endDate: string
	startDate: string
}) {
	// console.log(param)
	currentStockInfo = {}
	currentGnInfo = {}
	charts.value.stock.xAxis.data = []
	charts.value.gn.xAxis.data = []
	charts.value.stock.series = []
	gnsArray.value.data = []
	Promise.all([
		UniCloudGet({
			_tableName: 'trend-stocks',
			...param,
		}),
		UniCloudGet({
			_tableName: 'trend-gns',
			...param,
		}),
	]).then((res) => {
		const stocks = res[0]
		const gns = res[1]
		const d = currentDate.value.format('YYYY-MM-DD')
		if (stocks && stocks.data.data) {
			currentStockInfo = stocks.data.data.find((s: any) => s.date === d)
			const stocksRes = resolutionTrendStocksCycle(stocks.data.data)
			charts.value.stock.xAxis.data = stocksRes.dates
			charts.value.gn.xAxis.data = stocksRes.dates
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
			charts.value.stock.series = [
				{
					name: '趋势指数',
					data: stocksRes.zhiShuScore,
					...commonOpts,
					...areaOpts,
				},
				{
					name: '赚钱效应',
					data: stocksRes.profitScore,
					...commonOpts,
				},
				{
					name: '亏钱效应',
					data: stocksRes.lossScore,
					...commonOpts,
				},
			]
			const len = stocksRes.zhiShuScore.length - 1
			currentZhiShu.value.score = stocksRes.zhiShuScore[len]
			currentZhiShu.value.profit = stocksRes.profitScore[len]
			currentZhiShu.value.loss = stocksRes.lossScore[len]
		}
		if (gns && gns.data.data) {
			currentGnInfo = gns.data.data.find((gn: any) => gn.date === d)
			const gnsRes = resolutionTrendGnsCycle(
				gns.data.data,
				currentDate.value.format('YYYY-MM-DD')
			)
			gnsArray.value.data = gnsRes
			if (currentStockInfo.stocks) {
				stockList.value.data = currentStockInfo.stocks
					.map((s: any) => {
						let score = 0
						let profit = 0
						let loss = 0
						s.gns.forEach((g: any) => {
							const row = gnsRes.find((gn) => gn.label === g.label)!
							if (row) {
								score += row.score
								profit += row.profit
								loss += row.loss
							}
						})
						return {
							...s,
							score,
							profit,
							loss,
						}
					})
					.sort((a: any, b: any) => {
						return b.score - a.score
					})
			}
		}
	})
}
const holiday = ref<string[]>([])
onMounted(() => {
	const cache = Cache.get('holiday')
	if (cache) {
		Object.keys(cache).forEach((key) => {
			holiday.value.push(...cache[key])
		})
	}
})
function seeCalendar() {}
function seeStocks(gn: any) {
	const label = gn.label
	stockModel.value.visible = true
	stockModel.value.title = label
	const row = gnsArray.value.data.find((g) => g.label === label)
	gnToStock.value.data = currentStockInfo.stocks.filter((s: any) => {
		return s.gns.find((gn: any) => gn.label === label)
	})
	const g = currentGnInfo.gnlists.find((g: any) => g.label === label)
	gna.value.data = [
		{
			...g.zhishu.profit,
			...g.zhishu.loss,
			score: row.score,
			profit: row.profit,
			loss: row.loss,
		},
	]
}
function seeGnQS(row: any, prop: string) {
	if (prop === 'label') {
		const label = row.label
		stockModel.value.visible = true
		stockModel.value.title = label
		gnToStock.value.data = currentStockInfo.stocks.filter((s: any) => {
			return s.gns.find((gn: any) => gn.label === label)
		})
		const g = currentGnInfo.gnlists.find((g: any) => g.label === label)
		gna.value.data = [
			{
				...g.zhishu.profit,
				...g.zhishu.loss,
				score: row.score,
				profit: row.profit,
				loss: row.loss,
			},
		]
	} else {
		gnQS.value.visible = true
		gnQS.value.title = row.label
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
		charts.value.gn.series = [
			{
				name: '趋势指数',
				data: row.zhiShuScore,
				...commonOpts,
				...areaOpts,
			},
			{
				name: '赚钱效应',
				data: row.profitScore,
				...commonOpts,
			},
			{
				name: '亏钱效应',
				data: row.lossScore,
				...commonOpts,
			},
		]
	}
}
</script>
<style lang="scss" scoped>
.ant-card {
	height: calc(100% - 32px);
	:deep(.ant-card-grid) {
		width: 20%;
		text-align: center;
	}
}
:deep(.ant-card-body) {
	height: calc(100% - 58px);
	overflow: auto;
}
.card-label {
	display: inline-block;
	max-width: 68%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	word-break: break-all;
	vertical-align: middle;
}
.ztyylb {
	font-size: 12px;
	color: #909399;
	text-overflow: ellipsis;
	white-space: nowrap;
	word-break: break-all;
	overflow: hidden;
}
.stock {
	font-size: 12px;
	text-align: center;
	.name {
		color: #15559a;
		flex-shrink: 0;
	}
	.lxztts {
		color: #f56c6c;
	}
}
</style>
