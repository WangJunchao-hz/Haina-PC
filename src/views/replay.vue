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
	<el-table :data="lists" style="width: 100%">
		<el-table-column
			v-for="column in columns"
			:key="column.prop"
			:prop="column.prop"
			:label="column.label"
		/>
	</el-table>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import HolidayDate from '@/components/HolidayDate.vue'
import { GetRobotData } from '@/common/api/ths-wen-cai-api'
import { replaceTpl, resolutionReplayStock } from '@/common/utils'
import dayjs from 'dayjs'
import { utils, writeFile } from 'xlsx'
const fixed = '，非st，非北交所，非停牌'
const q =
	'今日涨停，今日涨停最终涨停时间从早到晚排序，今日涨停最大封单量，今日涨停原因，今日几天几板，今日涨停成交额，今日竞价涨跌幅，今日涨跌幅' +
	fixed
const date = ref<string>(dayjs().format('YYYY-MM-DD'))
const lists = ref<any[]>([])
const columns = ref<any[]>([
	{
		prop: 'name',
		label: '股票',
	},
	{
		prop: 'jtjb',
		label: '高度',
	},
	{
		prop: 'jjlx',
		label: '竞价涨幅',
	},
	{
		prop: 'scztsj',
		label: '首次涨停',
	},
	{
		prop: 'zzztsj',
		label: '最终涨停',
	},
	{
		prop: 'kbcs',
		label: '开板次数',
	},
	{
		prop: 'maxMoney',
		label: '最大封单额',
	},
	{
		prop: 'fde',
		label: '封单额',
	},
	{
		prop: 'fdb',
		label: '封单比',
	},
	{
		prop: 'cje',
		label: '成交额',
	},
	{
		prop: 'ztyylb',
		label: '涨停原因',
	},
])
function dateChange(d: any) {
	date.value = d
}
function query() {
	const question = replaceTpl(q, date.value)
	GetRobotData({ question }).then((res) => {
		lists.value = resolutionReplayStock(res.data)
		console.log(lists.value)
	})
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
