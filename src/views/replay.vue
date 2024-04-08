<template>
	<holiday-date @change="dateChange"></holiday-date>
	<el-button
		@click="query"
		size="small"
		type="primary"
		style="margin-left: 8px"
	>
		复盘
	</el-button>
	<el-button
		@click="exportTable"
		size="small"
		type="primary"
		style="margin-left: 8px"
	>
		导出表格
	</el-button>
	<el-button
		@click="sortLists"
		size="small"
		type="primary"
		style="margin-left: 8px"
	>
		排序({{ gzTxt }})
	</el-button>
	<el-table
		:data="lists"
		style="width: 100%"
		size="small"
		border
		:span-method="spanMethod"
	>
		<el-table-column
			v-for="column in columns"
			:key="column.prop"
			:prop="column.prop"
			:label="column.label"
			:width="column.width"
		>
			<template v-if="column.prop === 'sourceSName'" #default="{ row }">
				<div class="zynr">
					{{ row.sourceSName }}
					<span :class="row.sourceS.jjzdf < 0 ? 'green' : 'red'">
						{{ row.sourceS.jjzdf }}%
					</span>
				</div>
				<div class="cynr">{{ row.sourceS.ztyylb }}</div>
				<div>
					关联 <span class="red">{{ row.sourceS.gnTd.length }}</span> 个概念
				</div>
				<div>
					竞价强度
					<span :class="row.sourceS.qd < 0 ? 'green' : 'red'">
						{{ row.sourceS.qd }}%
					</span>
				</div>
			</template>
			<template v-if="column.prop === 'sourceSGn'" #default="{ row }">
				<div>{{ row.sourceSGn }} ({{ row.sourceG.stocks.length }})</div>
				<span :class="row.sourceG.qd < 0 ? 'green' : 'red'">
					{{ row.sourceG.qd }}%
				</span>
			</template>
			<template v-if="column.prop === 'sName'" #default="{ row }">
				<div
					:class="{
						zynr: row.lxztts > 1,
						red: row.isdd,
					}"
				>
					{{ row.sName }}
					<span :class="row.jjzdf < 0 ? 'green' : 'red'">
						{{ row.jjzdf }}%
					</span>
				</div>
				<div class="cynr">{{ row.ztyylb }}</div>
				竞价强度
				<span :class="row.qd < 0 ? 'green' : 'red'"> {{ row.qd }}% </span>
			</template>
		</el-table-column>
	</el-table>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import HolidayDate from '@/components/HolidayDate.vue'
import { GetRobotData } from '@/common/api/ths-wen-cai-api'
import { replaceTpl, resolutionReplayStock } from '@/common/utils'
import dayjs from 'dayjs'
import { utils, writeFile } from 'xlsx'
const fixed = '，非停牌，非ST'
const q = '昨日涨停，昨日涨停原因，概念，今日竞价涨跌幅' + fixed
const date = ref<string>(dayjs().format('YYYY-MM-DD'))
const lists = ref<any[]>([])
let sLists: any[] = []
const sortGZ = ref<string>('lb')
const gzTxt = ref<string>('连板')

const columns = ref<any[]>([
	{
		prop: 'sourceSName',
		label: '梯队',
		width: 108,
	},
	{
		prop: 'sourceSGn',
		label: '概念',
		width: 98,
	},
	{
		prop: 'sName',
		label: '股票',
	},
])
function dateChange(d: any) {
	date.value = d
}
function query() {
	const question = replaceTpl(q, date.value)
	GetRobotData({ question }).then((res) => {
		sLists = resolutionReplayStock(res.data)
		sortLists()
	})
}
function sortLists() {
	if (sortGZ.value === 'lb') {
		sLists.sort((a: any, b: any) => {
			return b.lxztts - a.lxztts
		})
		sortGZ.value = 'td'
		gzTxt.value = '连板'
	} else if (sortGZ.value === 'td') {
		sLists.sort((a: any, b: any) => {
			return b.gnTd.length - a.gnTd.length
		})
		sortGZ.value = 'qd'
		gzTxt.value = '关联概念数'
	} else if (sortGZ.value === 'qd') {
		sLists.sort((a: any, b: any) => {
			return b.qd - a.qd
		})
		sortGZ.value = 'zdf'
		gzTxt.value = '竞价强度'
	} else {
		sLists.sort((a: any, b: any) => {
			return b.jjzdf - a.jjzdf
		})
		sortGZ.value = 'lb'
		gzTxt.value = '竞价涨跌幅'
	}
	const list: any[] = []
	sLists.forEach((s: any) => {
		s.gnTd.forEach((g: any) => {
			g.stocks.forEach((st: any) => {
				list.push({
					...st,
					sName: `${st.name}(${st.jtjb})`,
					sourceSName: `${s.name}(${s.jtjb})`,
					sourceS: s,
					sourceSGfNum: s.gfNum,
					sourceSGn: `${g.gn}`,
					sourceSGnSNum: g.stocks.length,
					sourceG: g,
					isdd: st.lxztts >= s.lxztts,
				})
			})
		})
	})
	lists.value = list
	// console.log(lists.value)
}
let sSpanIndex = 0
let gSpanIndex = 0
function spanMethod({ row, column, rowIndex, columnIndex }: any) {
	if (columnIndex === 0) {
		const rs = row.sourceSGfNum
		if (rowIndex === 0) {
			sSpanIndex = 0
		}
		if (rowIndex === sSpanIndex) {
			sSpanIndex = sSpanIndex + rs
			return {
				rowspan: rs,
				colspan: 1,
			}
		} else if (rowIndex < sSpanIndex) {
			return {
				rowspan: 0,
				colspan: 0,
			}
		}
	} else if (columnIndex === 1) {
		const rs = row.sourceSGnSNum
		if (rowIndex === 0) {
			gSpanIndex = 0
		}
		if (rowIndex === gSpanIndex) {
			gSpanIndex = gSpanIndex + rs
			return {
				rowspan: rs,
				colspan: 1,
			}
		} else if (rowIndex < gSpanIndex) {
			return {
				rowspan: 0,
				colspan: 0,
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
