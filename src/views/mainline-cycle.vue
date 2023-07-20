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
	<!-- <a-card title="主线轮动" size="small">
		<a-card-grid v-for="item in themes" @click="cardClick(item)">
			<span class="card-label" :title="item.lb">{{ item.lb }}</span>
			({{ item.num }})
			<span style="color: red">({{ item.sortField }})</span>
		</a-card-grid>
	</a-card> -->
	<a-table
		:columns="hot.columns"
		:data-source="hot.data"
		:pagination="false"
		style="max-height: calc(100% - 32px); overflow: auto"
	></a-table>
	<a-modal
		v-model:visible="themeInfo.visible"
		:title="themeInfo.title"
		@ok="themeInfo.visible = false"
		:width="'100%'"
		style="top: 18px"
	>
		<a-calendar :disabledDate="disabledDate" :value="currentDate">
			<template #dateCellRender="{ current }">
				<div class="stock" v-for="hot in getHotInfo(current)">
					<div class="name">
						{{ hot.name }}
						<span class="lxztts">({{ hot.vol }})</span>
					</div>
					<!-- <span class="ztyylb">{{ stock.ztyylb }}</span> -->
				</div>
			</template>
		</a-calendar>
	</a-modal>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { GetThemeStatistics } from '@/common/api/uni-cloud-api'
import { resolutionThemes, Cache, getStartDate } from '@/common/utils'
import dayjs, { Dayjs } from 'dayjs'
import HolidayDate from '@/components/HolidayDate.vue'
const hots = ref<any[]>([])
const dateRange = ref<number>(20)
let endDate: string = dayjs().format('YYYY-MM-DD')
let startDate: string = getStartDate(endDate, dateRange.value)
getThemeData({
	startDate,
	endDate,
})
const hot = ref<{
	columns: {
		title: string
		dataIndex: string
		[name: string]: any
	}[]
	data: any[]
}>({
	columns: [
		{
			title: '板块',
			dataIndex: 'name',
		},
		{
			title: '当日强度',
			dataIndex: 'vol',
			sorter: (a: any, b: any) => b.vol - a.vol,
		},
		{
			title: '平均强度',
			dataIndex: 'average',
			sorter: (a: any, b: any) => b.average - a.average,
		},
		{
			title: '天数',
			dataIndex: 'num',
			sorter: (a: any, b: any) => b.num - a.num,
		},
		{
			title: '总强度',
			dataIndex: 'totalVol',
			sorter: (a: any, b: any) => b.totalVol - a.totalVol,
		},
	],
	data: [],
})
const currentDate = ref<Dayjs>(dayjs())
const themeInfo = ref<{
	visible: boolean
	title: string
	columns: any[]
	data: any[]
}>({
	visible: false,
	title: '',
	columns: [
		{
			title: '日期',
			dataIndex: 'date',
			align: 'center',
			width: 120,
			customCell: (_: any) => {
				return { rowSpan: _.num }
			},
		},
		{
			title: '股票code',
			dataIndex: 'code',
			width: 120,
		},
		{
			title: '股票名称',
			dataIndex: 'name',
			width: 120,
		},
		{
			title: '连续涨停天数',
			dataIndex: 'lxzts',
			align: 'center',
			width: 120,
		},
		{
			title: '涨停原因类别',
			dataIndex: 'ztyylb',
		},
	],
	data: [],
})
function cardClick(item: any) {
	themeInfo.value.title = `${item.lb}(${item.num})`
	themeInfo.value.visible = true
	themeInfo.value.data = item.info
}
function getStockInfo(date: Dayjs) {
	const d = date.format('YYYY-MM-DD')
	const info = themeInfo.value.data.find((t) => t.date === d)
	return info ? info.stocks : []
}
function getHotInfo(date: Dayjs) {
	const d = date.format('YYYY-MM-DD')
	const hot = hots.value.find((h) => h.date === d)
	return hot ? hot.hot : []
}
function dateChange(date: string) {
	endDate = date
	currentDate.value = dayjs(date)
	startDate = getStartDate(endDate, dateRange.value)
	getThemeData({
		startDate,
		endDate,
	})
}
function onSearch() {
	startDate = getStartDate(endDate, dateRange.value)
	getThemeData({
		startDate,
		endDate,
	})
}
function getThemeData(param: {
	date?: string
	endDate: string
	startDate: string
}) {
	// console.log(param)
	GetThemeStatistics(param).then((res) => {
		if (res.data) {
			hots.value = res.data.data
			hot.value.data = resolutionThemes(res.data.data, currentDate.value)
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
function disabledDate(currentDate: Dayjs) {
	const d = currentDate.format('YYYY-MM-DD')
	return holiday.value.includes(d)
}
function seeCalendar() {
	themeInfo.value.title = '主线轮动'
	themeInfo.value.visible = true
	// themeInfo.value.data = item.info
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
