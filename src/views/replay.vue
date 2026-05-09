<template>
	<holiday-date @change="dateChange"></holiday-date>
	<el-button
		@click="query"
		size="small"
		type="primary"
		style="margin-left: 8px">
		查询
	</el-button>
	<el-button
		@click="query(1)"
		size="small"
		type="primary"
		style="margin-left: 8px">
		人气
	</el-button>
	<el-button
		@click="exportTable"
		size="small"
		type="primary"
		style="margin-left: 8px">
		导出表格
	</el-button>
	<el-button
		@click="backTest"
		size="small"
		type="primary"
		style="margin-left: 8px">
		回测
	</el-button>
	<el-button
		@click="switchModel"
		size="small"
		type="primary"
		style="margin-left: 8px">
		切换
	</el-button>
	<el-button
		@click="compare()"
		size="small"
		type="primary"
		style="margin-left: 8px">
		对比
	</el-button>
	<el-button
		@click="isSS = !isSS"
		size="small"
		type="primary"
		style="margin-left: 8px">
		当日({{ isSS ? '开' : '关' }})
	</el-button>
	<el-table
		v-if="currentShow === 0"
		:data="lists"
		style="width: 100%"
		size="small"
		border
		:span-method="spanMethod"
		:row-class-name="tableRowClassName">
		<el-table-column
			v-for="column in columns"
			:key="column.prop"
			:prop="column.prop"
			:label="column.label"
			:width="column.width">
			<template v-if="column.prop === 'jjzdf'" #default="{ row }">
				<span :class="row.jjzdf && row.jjzdf > 0 ? 'red' : 'green'">
					{{ row.jjzdf }}%
				</span>
			</template>
			<template v-if="column.prop === 'zdf'" #default="{ row }">
				<span :class="row.zdf && row.zdf > 0 ? 'red' : 'green'">
					{{ row.zdf }}%
				</span>
			</template>
			<template v-if="column.prop === 'showName'" #default="{ row }">
				<span>
					{{ row.name }}({{ row.jtjb }})
					<span :class="row.sc !== '' ? 'red' : ''">
						{{ row.sc }}
					</span>
				</span>
			</template>
			<template v-if="column.prop === 'jjje'" #default="{ row }">
				<span :class="row.jjje < 1 ? '' : 'red'">
					{{ row.jjje }}
				</span>
			</template>
			<template v-if="column.prop === 'ztfde'" #default="{ row }">
				<span :class="row.ztfde < 1 ? '' : 'red'">
					{{ row.ztfde }}
				</span>
			</template>
			<template v-if="column.prop === 'jjwppje'" #default="{ row }">
				<span :class="row.jjwppje < 1 ? '' : 'red'">
					{{ row.jjwppje }}
				</span>
			</template>
			<template v-if="column.prop === 'ztyylb'" #default="{ row }">
				<el-link
					style="font-size: 12px; margin-right: 8px"
					v-for="yy in row.ztyyArray"
					@click="getYYDetail(yy)">
					{{ yy.yy }}({{ yy.num }})
				</el-link>
			</template>
			<template v-if="column.prop === 'gl'" #default="{ row }">
				<el-link
					style="font-size: 12px; margin-right: 8px"
					v-for="g in row.gl"
					@click="getYYDetail(g)">
					{{ g.gn }}({{ g.num }})
				</el-link>
			</template>
		</el-table-column>
	</el-table>
	<el-table
		v-if="currentShow === 1"
		:data="lists2"
		style="width: 100%"
		size="small"
		border
		stripe>
		<el-table-column
			v-for="column in columns1"
			:key="column.prop"
			:prop="column.prop"
			:label="column.label"
			:width="column.width">
			<template v-if="column.prop === 'jjzdf'" #default="{ row }">
				<span :class="row.jjzdf && row.jjzdf > 0 ? 'red' : 'green'">
					{{ row.jjzdf }}%
				</span>
			</template>
			<template v-if="column.prop === 'zdf'" #default="{ row }">
				<span :class="row.zdf && row.zdf > 0 ? 'red' : 'green'">
					{{ row.zdf }}%
				</span>
			</template>
			<template v-if="column.prop === 'showName'" #default="{ row }">
				<span>
					{{ row.name }}({{ row.jtjb }})
					<span :class="row.sc !== '' ? 'red' : ''">
						{{ row.sc }}
					</span>
				</span>
			</template>
			<template v-if="column.prop === 'jjje'" #default="{ row }">
				<span :class="row.jjje < 1 ? '' : 'red'">
					{{ row.jjje }}
				</span>
			</template>
			<template v-if="column.prop === 'ztfde'" #default="{ row }">
				<span :class="row.ztfde < 1 ? '' : 'red'">
					{{ row.ztfde }}
				</span>
			</template>
			<template v-if="column.prop === 'jjwppje'" #default="{ row }">
				<span :class="row.jjwppje < 1 ? '' : 'red'">
					{{ row.jjwppje }}
				</span>
			</template>
			<template v-if="column.prop === 'ztyylb'" #default="{ row }">
				<el-link
					style="font-size: 12px; margin-right: 8px"
					v-for="yy in row.ztyyArray"
					@click="getYYDetail(yy)">
					{{ yy.yy }}({{ yy.num }})
				</el-link>
			</template>
			<template v-if="column.prop === 'gl'" #default="{ row }">
				<el-link
					style="font-size: 12px; margin-right: 8px"
					v-for="g in row.gns"
					:class="g.isRepeat ? 'red' : ''"
					@click="getYYDetail(g)">
					{{ g.gn }}({{ g.num }})
				</el-link>
			</template>
			<template v-if="column.prop === 'hy'" #default="{ row }">
				<el-link @click="getYYDetail(row.hytj)">
					{{ row.hytj.hy }}({{ row.hytj.num }})
				</el-link>
			</template>
		</el-table-column>
	</el-table>
	<el-dialog v-model="dialogVisible" title="梯队" width="80%">
		<template #header>
			<span>梯队</span>
			<el-button
				@click="compare('add')"
				size="small"
				type="primary"
				style="margin-left: 8px">
				添加对比
			</el-button>
		</template>
		<el-table :data="subLists" style="width: 100%" size="small" border>
			<el-table-column
				v-for="column in subColumns"
				:key="column.prop"
				:prop="column.prop"
				:label="column.label"
				:width="column.width">
				<template v-if="column.prop === 'jjzdf'" #default="{ row }">
					<span :class="row.jjzdf && row.jjzdf > 0 ? 'red' : 'green'">
						{{ row.jjzdf }}%
					</span>
				</template>
				<template v-if="column.prop === 'zdf'" #default="{ row }">
					<span :class="row.zdf && row.zdf > 0 ? 'red' : 'green'">
						{{ row.zdf }}%
					</span>
				</template>
				<template v-if="column.prop === 'showName'" #default="{ row }">
					<span>
						{{ row.name }}({{ row.jtjb }})
						<span :class="row.sc !== '' ? 'red' : ''">
							{{ row.sc }}
						</span>
					</span>
				</template>
				<template v-if="column.prop === 'jjje'" #default="{ row }">
					<span :class="row.jjje < 1 ? '' : 'red'">
						{{ row.jjje }}
					</span>
				</template>
				<template v-if="column.prop === 'ztfde'" #default="{ row }">
					<span :class="row.ztfde < 1 ? '' : 'red'">
						{{ row.ztfde }}
					</span>
				</template>
				<template v-if="column.prop === 'jjwppje'" #default="{ row }">
					<span :class="row.jjwppje < 1 ? '' : 'red'">
						{{ row.jjwppje }}
					</span>
				</template>
				<template v-if="column.prop === 'ztyylb'" #default="{ row }">
					<el-link
						style="font-size: 12px; margin-right: 8px"
						v-for="yy in row.ztyyArray"
						@click="getYYDetail(yy)">
						{{ yy.yy }}({{ yy.num }})
					</el-link>
				</template>
			</el-table-column>
		</el-table>
	</el-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import HolidayDate from '@/components/HolidayDate.vue'
import { GetRobotData } from '@/common/api/ths-wen-cai-api'
import { replaceTpl, resolutionReplayStock } from '@/common/utils'
import dayjs from 'dayjs'
import { utils, writeFile } from 'xlsx'
import { useRouter } from 'vue-router'
const router = useRouter()
const base = '非停牌，非ST，概念，市场，同花顺二级行业，'
const fixed =
	base + '今日竞价成交额，今日竞价未匹配金额，今日涨跌幅，今日竞价涨跌幅，'
const q =
	fixed +
	'昨日连续涨停天数从大到小排序，昨日涨停封单额，昨日最终涨停时间，昨日首次涨停时间，昨日几天几板，昨日涨停原因'
const rq =
	fixed +
	'今日竞价未匹配金额大于0.99亿，今日竞价未匹配金额从大到小排序，今日涨停原因'
const sq =
	fixed +
	'今日连续涨停天数从大到小排序，今日涨停封单额，今日最终涨停时间，今日首次涨停时间，今日几天几板，今日涨停原因'
const date = ref<string>(dayjs().format('YYYY-MM-DD'))
const currentShow = ref<number>(1)
const lists = ref<any[]>([])
const lists2 = ref<any[]>([])
const subLists = ref<any[]>([])
let sLists: {
	lists: any[]
	stocks: any[]
} = {
	lists: [],
	stocks: [],
}
const sortGZ = ref<string>('lb')
const gzTxt = ref<string>('连板')
const isSS = ref<boolean>(false)
const dialogVisible = ref<boolean>(false)
const columns = ref<any[]>([
	{
		prop: 'maxGn',
		label: '最强概念',
		width: 98,
	},
	// {
	// 	prop: 'jtjb',
	// 	label: '高度',
	// 	width: 88,
	// },
	{
		prop: 'showName',
		label: '股票',
		width: 118,
	},
	{
		prop: 'showTime',
		label: '最终涨停时间',
		width: 98,
	},
	{
		prop: 'fistTime',
		label: '首次涨停时间',
		width: 98,
	},
	{
		prop: 'ztfde',
		label: '封单额',
		width: 88,
	},
	{
		prop: 'jjzdf',
		label: '开盘',
		width: 88,
	},
	{
		prop: 'zdf',
		label: '最新',
		width: 88,
	},
	{
		prop: 'jjje',
		label: '竞价额',
		width: 88,
	},
	{
		prop: 'jjwppje',
		label: '竞价未',
		width: 88,
	},
	{
		prop: 'ztyylb',
		label: '涨停原因',
		width: 218,
	},
	{
		prop: 'gl',
		label: '重复主题',
		width: 188,
	},
	{
		prop: 'hy',
		label: '相关板块',
		width: 98,
	},
])
const columns1 = ref<any[]>([
	// {
	// 	prop: 'maxGn',
	// 	label: '最强概念',
	// 	width: 98,
	// },
	// {
	// 	prop: 'jtjb',
	// 	label: '高度',
	// 	width: 88,
	// },
	{
		prop: 'showName',
		label: '股票',
		width: 118,
	},
	{
		prop: 'showTime',
		label: '最终时间',
		width: 68,
	},
	{
		prop: 'fistTime',
		label: '首次时间',
		width: 68,
	},
	{
		prop: 'ztfde',
		label: '封单额',
		width: 68,
	},
	{
		prop: 'jjzdf',
		label: '开盘',
		width: 68,
	},
	{
		prop: 'zdf',
		label: '最新',
		width: 68,
	},
	{
		prop: 'jjje',
		label: '竞价额',
		width: 68,
	},
	{
		prop: 'jjwppje',
		label: '竞价未',
		width: 68,
	},
	{
		prop: 'ztyylb',
		label: '涨停原因',
		width: 218,
	},
	{
		prop: 'gl',
		label: '相关概念',
		width: 388,
	},
	{
		prop: 'hy',
		label: '相关板块',
		width: 98,
	},
])
const subColumns = ref<any[]>([
	{
		prop: 'showName',
		label: '股票',
		width: 118,
	},
	{
		prop: 'showTime',
		label: '最终时间',
		width: 68,
	},
	{
		prop: 'fistTime',
		label: '首次时间',
		width: 68,
	},
	{
		prop: 'ztfde',
		label: '封单额',
		width: 68,
	},
	{
		prop: 'jjzdf',
		label: '开盘',
		width: 68,
	},
	{
		prop: 'zdf',
		label: '最新',
		width: 68,
	},
	{
		prop: 'jjje',
		label: '竞价额',
		width: 68,
	},
	{
		prop: 'jjwppje',
		label: '竞价未',
		width: 68,
	},
	{
		prop: 'ztyylb',
		label: '涨停原因',
		width: 218,
	},
	{
		prop: 'maxGn',
		label: '最强概念',
		width: 98,
	},
	{
		prop: 'hy',
		label: '相关板块',
		width: 98,
	},
])
function dateChange(d: any) {
	date.value = d
}
function backTest() {
	router.push({
		name: 'stock',
	})
}
function query(type?: any) {
	const cq = type === 1 ? rq : q
	const question = replaceTpl(isSS.value ? sq : cq, date.value)
	GetRobotData({ question }).then((res) => {
		sLists = resolutionReplayStock(res.data)
		lists.value = sLists.lists
		sLists.stocks.sort((a, b) => {
			return b.jjwppje - a.jjwppje
		})
		lists2.value = sLists.stocks
		console.log('stocks', sLists)

		// sortLists()
	})
}

function switchModel() {
	currentShow.value = currentShow.value === 0 ? 1 : 0
}
const compareData = ref<any[]>([])
function compare(type?: string) {
	if (type === 'add') {
		compareData.value.push(currentSubGN.value)
	} else {
		const cStoksMap = new Map()
		compareData.value.forEach((g) => {
			const gn = g.gn
			g.stocks.forEach((s: any) => {
				const name = s.name
				if (cStoksMap.has(name)) {
					const has = cStoksMap.get(name)
					has.gns.push(gn)
					has.num++
				} else {
					cStoksMap.set(name, {
						gns: [gn],
						num: 1,
						name,
					})
				}
			})
		})
		const res = Array.from(cStoksMap.values()).sort((a, b) => {
			return b.num - a.num
		})
		compareData.value = []
		console.log(res)
	}
}
const currentSubGN = ref({})
function getYYDetail(row: any) {
	dialogVisible.value = true
	row.stocks.sort((a: any, b: any) => {
		return a.scztTime - b.scztTime
	})
	subLists.value = row.stocks
	currentSubGN.value = row
}
let sRowIndex = 0
let lastRowClass = ''
function tableRowClassName({ row, rowIndex }: any) {
	const regex = /\((\d+)\)/
	const match = row.maxGn.match(regex)
	if (match) {
		const num = Number(match[1])
		if (rowIndex === 0) {
			sRowIndex = 0
		}
		// console.log(rowIndex, sSpanIndex, num)
		if (rowIndex === sRowIndex) {
			if (lastRowClass === 'row-bg-1') {
				lastRowClass = 'row-bg-2'
			} else if (lastRowClass === 'row-bg-2') {
				lastRowClass = 'row-bg-1'
			} else {
				lastRowClass = 'row-bg-1'
			}
			sRowIndex += num
			return lastRowClass
		} else if (rowIndex < sRowIndex) {
			return lastRowClass
		}
	}
}
let sSpanIndex = 0
function spanMethod({ row, column, rowIndex, columnIndex }: any) {
	const regex = /\((\d+)\)/
	const match = row.maxGn.match(regex)
	if (match) {
		const num = Number(match[1])
		if (columnIndex === 0) {
			if (rowIndex === 0) {
				sSpanIndex = 0
			}
			// console.log(rowIndex, sSpanIndex, num)
			if (rowIndex === sSpanIndex) {
				sSpanIndex += num
				return {
					rowspan: num,
					colspan: 1,
				}
			} else if (rowIndex < sSpanIndex) {
				return {
					rowspan: 0,
					colspan: 0,
				}
			}
		}
	}
}
function exportTable() {
	const rows: any = []
	lists.value.forEach((item) => {
		const row: any = {}
		columns.value.forEach((column) => {
			row[column.label] = item[column.prop]
		})
		rows.push(row)
	})
	const worksheet = utils.json_to_sheet(rows)
	const workbook = utils.book_new()
	utils.book_append_sheet(workbook, worksheet, date.value)
	writeFile(workbook, date.value + '日涨停数据.xlsx', { compression: true })
}
</script>
<style scoped lang="scss">
.zynr {
	font-size: 14px;
	color: #303133;
}
.cynr {
	color: #909399;
}
.sc {
	position: absolute;
}
.table {
	border: 1px solid #cdd0d6;
	.row {
		display: flex;
		.cell {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0 8px;
			border-right: 1px solid #cdd0d6;
			border-bottom: 1px solid #cdd0d6;
		}
		.fz-cell {
			flex-wrap: wrap;
			padding: 0;
			align-items: unset;
			.stock-item {
				position: relative;
				display: flex;
				justify-content: space-between;
				width: 100%;
				border-bottom: 1px solid #cdd0d6;
			}
			.gn-item {
				display: flex;
				width: 100%;
				border-bottom: 1px solid #cdd0d6;
				align-items: center;
			}
			.sub-cell {
				display: flex;
				align-items: center;
				justify-content: center;
				flex-wrap: wrap;
				width: 100%;
				border-right: 1px solid #cdd0d6;
				div {
					width: 100%;
					text-align: center;
				}
			}
			.fz-sub-cell {
				flex-wrap: wrap;
				padding: 0;
				align-items: unset;
				.third-cell {
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 0 8px;
					width: 100%;
					border-right: 1px solid #cdd0d6;
				}
			}
		}
	}
}
.w-gn {
	width: 72px;
	flex-shrink: 0;
}
.red {
	color: red;
}
.green {
	color: green;
}
.dialog-stock {
	display: flex;
	border: 1px solid #cdd0d6;
	.sub-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		width: 100%;
		border-right: 1px solid #cdd0d6;
		div {
			width: 100%;
			text-align: center;
		}
	}
}
.link {
	cursor: pointer;
	color: #409eff;
}
.sb-table {
	.sb-gn-item {
		.title {
			padding: 8px 18px;
			border-bottom: 1px solid #cdd0d6;
		}
		.stock-item {
			position: relative;
			display: flex;
			justify-content: space-between;
			width: 100%;
			border-bottom: 1px solid #cdd0d6;
			.cell {
				padding: 0 8px;
				text-align: center;
				width: 100%;
			}
		}
	}
}
.zt-table {
	border-right: 1px solid #cdd0d6;
	border-left: 1px solid #cdd0d6;
	border-top: 1px solid #cdd0d6;
	.zt-item {
		display: flex;
		border-bottom: 1px solid #cdd0d6;
		span {
			padding: 0 8px;
			border-right: 1px solid #cdd0d6;
		}
	}
}
</style>
<style>
.row-bg-1 {
	background-color: #fbe5d6 !important;
}
.el-table__body td {
	border-color: black !important;
}
.row-bg-2 {
	background-color: #fff2cc !important;
}
</style>
