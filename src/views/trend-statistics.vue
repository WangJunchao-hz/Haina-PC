<template>
	<div class="question">
		<holiday-date @change="dateChange"></holiday-date>
		<a-button
			@click="analysis()"
			size="small"
			type="primary"
			:disabled="!(hasGetNum >= btns.length * 2)"
			style="margin-left: 8px"
		>
			分析
		</a-button>
		<div style="margin-bottom: 8px">
			昨日：
			<a-button
				@click="btnClick('yesterday', item.value)"
				size="small"
				type="primary"
				style="margin-left: 8px"
				v-for="item in btns"
			>
				{{ item.label }}({{ item.hasClick.y ? 1 : 0 }})
			</a-button>
			今日：
			<a-button
				@click="btnClick('today', item.value)"
				size="small"
				type="primary"
				style="margin-left: 8px"
				v-for="item in btns"
			>
				{{ item.label }}({{ item.hasClick.t ? 1 : 0 }})
			</a-button>
		</div>
	</div>
	<a-tabs
		v-model:activeKey="activeTab"
		style="height: calc(100% - 72px); overflow: auto"
	>
		<a-tab-pane key="1" tab="个股" style="height: 100%">
			<a-table
				:columns="stocks.columns"
				:data-source="stocks.data"
				:pagination="false"
				style="height: 100%"
				:scroll="{ y: 'calc(100% - 55px)' }"
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
		</a-tab-pane>
		<a-tab-pane key="2" tab="板块">
			<a-table
				:columns="gns.columns"
				:data-source="gns.data"
				:pagination="false"
				style="height: 100%"
				:scroll="{ y: 'calc(100% - 55px)' }"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.dataIndex === 'num'">
						<a-button type="link" @click="seeStocks(record)">
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
		v-model:visible="stockModel.visible"
		:title="stockModel.title"
		@ok="stockModel.visible = false"
		:width="1288"
	>
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
import { ref } from 'vue'
import { GetRobotData } from '@/common/api/ths-wen-cai-api'
import { UniCloudSet, UniCloudGet } from '@/common/api/uni-cloud-api'
import {
	replaceTpl,
	resolutionTrend,
	resolutionTrendData,
} from '@/common/utils'
import HolidayDate from '@/components/HolidayDate.vue'
import dayjs from 'dayjs'
import { TrendStockColumns, TrendGnColumns } from '@/common/enum'
const fixed = '非st，非新股，非停牌，非退市，概念，市场类型'
const yesterday: any = {
	q100Q: '今日涨跌幅，10日区间涨跌幅前100，昨日 ' + fixed,
}
const today: any = {
	q100Q: '今日涨跌幅，10日区间涨跌幅前100，今日 ' + fixed,
}
const activeTab = ref<string>('1')
const stockModel = ref<{
	title: string
	visible: boolean
}>({
	title: '',
	visible: false,
})
const btns = ref<
	{
		label: string
		value: string
		hasClick: {
			y: boolean
			t: boolean
		}
	}[]
>([
	{
		label: '区间涨幅前100',
		value: 'q100Q',
		hasClick: {
			y: false,
			t: false,
		},
	},
])
const hasGetNum = ref<number>(0)
const trendData = ref<any>({
	yesterday: {},
	today: {},
})
const date = ref<string>(dayjs().format('YYYY-MM-DD'))
const stocks = ref<{
	columns: any[]
	data: any[]
}>({
	columns: TrendStockColumns,
	data: [],
})
const gns = ref<{
	columns: any[]
	data: any[]
}>({
	columns: TrendGnColumns,
	data: [],
})
const gnToStock = ref<{
	columns: any[]
	data: any[]
}>({
	columns: TrendStockColumns,
	data: [],
})
function dateChange(d: string) {
	date.value = d
	stocks.value.data = []
	hasGetNum.value = 0
	btns.value.forEach((btn) => {
		btn.hasClick.t = false
		btn.hasClick.y = false
	})
	trendData.value.today = {}
	trendData.value.yesterday = {}
	stocks.value.data = []
	gns.value.data = []
	UniCloudGet({ date: d, _tableName: 'trend-stocks' }).then((res) => {
		if (res.data.data.length) {
			const data = res.data.data[0]
			trendData.value.today = {
				stocks: data.stocks,
				zhishu: data.zhishu,
			}
			stocks.value.data = data.stocks
		}
	})
	UniCloudGet({ date: d, _tableName: 'trend-gns' }).then((res) => {
		if (res.data.data.length) {
			const data = res.data.data[0]
			trendData.value.today = {
				gnlists: data.gnlists,
			}
			gns.value.data = data.gnlists
		}
	})
}
function getWenCaiData(q: string, type: string, prop: string) {
	GetRobotData({ question: replaceTpl(q, date.value) }).then((res) => {
		let isSuccess = true
		const info = resolutionTrend(res.data)
		if (info) {
			if (type === 'today') {
				stocks.value.data = info.stocks
				gns.value.data = info.gnlists
				trendData.value.today = info
			} else {
				trendData.value.yesterday = info
			}
		}
		isSuccess = info
		if (isSuccess) {
			hasGetNum.value += 1
			const btn = btns.value.find((btn) => {
				if (btn.value === prop) {
					return true
				} else {
					return false
				}
			})
			if (type === 'today') {
				btn!.hasClick.t = true
			} else {
				btn!.hasClick.y = true
			}
		}
	})
}
function btnClick(type: string, prop: string) {
	let q = ''
	switch (type) {
		case 'yesterday':
			q = yesterday[prop]
			break
		case 'today':
			q = today[prop]
			break
	}
	getWenCaiData(q, type, prop)
}
function analysis() {
	resolutionTrendData(trendData.value)
	UniCloudSet({
		_tableName: 'trend-stocks',
		date: date.value,
		stocks: trendData.value.today.stocks,
		zhishu: trendData.value.today.zhishu,
	})
	UniCloudSet({
		date: date.value,
		_tableName: 'trend-gns',
		gnlists: trendData.value.today.gnlists,
	})
}
function seeStocks(item: any) {
	const label = item.label
	stockModel.value.title = label
	gnToStock.value.data = stocks.value.data.filter((stock) => {
		return stock.gns.find((gn: any) => gn.label === label)
	})
	stockModel.value.visible = true
}
</script>
<style lang="scss" scoped>
:deep(.ant-tabs-content) {
	height: 100%;
}
:deep(.ant-spin-nested-loading) {
	height: 100%;
	.ant-spin-container,
	.ant-table-container {
		height: 100%;
	}
}
</style>
