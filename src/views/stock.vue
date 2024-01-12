<template>
	<holiday-date @change="dateChange"></holiday-date>
	<el-button
		@click="query()"
		size="small"
		type="primary"
		style="margin-left: 8px"
	>
		查询
	</el-button>
	<div class="table">
		<div class="header">
			<div class="column item-lb">高度</div>
			<div class="column fz-column">
				<div class="sub-column">昨日强度</div>
				<div class="sub-column">今日强度</div>
				<div class="sub-column">强弱变化</div>
				<div class="sub-column w-name">个股</div>
				<div class="sub-column w-jb">几天几板</div>
				<div class="sub-column w-time">最终涨停时间</div>
				<div class="sub-column w-je">最大封单金额</div>
				<div class="sub-column">今日竞价涨幅</div>
				<!-- <div class="sub-column w-gn">最强涨停概念</div> -->
			</div>
			<div class="column w-gn">
				涨停概念
				<!-- <div class="sub-column item-gn w-gn">涨停概念</div> -->
				<!-- <div class="sub-column fz-sub-column">
					<div class="third-column">昨日强度</div>
					<div class="third-column">今日强度</div>
					<div class="third-column">强弱变化</div>
					<div class="third-column">个股</div>
					<div class="third-column">几天几板</div>
					<div class="third-column">最终涨停时间</div>
					<div class="third-column">最大封单金额</div>
				</div> -->
			</div>
		</div>
		<div class="body">
			<div class="row" v-for="item in lists">
				<div class="cell item-lb">{{ item.lb }}</div>
				<div class="cell fz-cell">
					<div
						class="stock-item"
						v-for="s in item.stocks"
						:class="s.zf > 0 ? 'red' : ''"
					>
						<div class="sub-cell">{{ s.zrSort }}</div>
						<div class="sub-cell">{{ s.jrSort }}</div>
						<div class="sub-cell">{{ s.zf }}</div>
						<div class="sub-cell w-name">{{ s.name }}</div>
						<div class="sub-cell w-jb">{{ s.jb }}板</div>
						<div class="sub-cell w-time">{{ s.zzztsj }}</div>
						<div class="sub-cell w-je">{{ s.maxMoney }}</div>
						<div
							class="sub-cell"
							:class="s.jjzf > 0 ? 'red' : s.jjzf < 0 ? 'green' : ''"
						>
							{{ s.jjzf }}
						</div>
					</div>
				</div>
				<div class="cell fz-cell w-gn">
					<el-button
						class="w-gn"
						type="text"
						v-for="g in item.ztGns"
						@click="lookGnStock(g.stocks)"
					>
						{{ g.ztGn }}
						<!-- <div class="sub-cell item-gn w-gn">{{ g.ztGn }}</div> -->
						<!-- <div class="sub-cell fz-sub-cell">
							<div class="gn-item" v-for="gs in g.stocks">
								<div class="third-cell">{{ gs.zrSort }}</div>
								<div class="third-cell">{{ gs.jrSort }}</div>
								<div class="third-cell">{{ gs.zf }}</div>
								<div class="third-cell">{{ gs.name }}</div>
								<div class="third-cell">{{ gs.jb }}板</div>
								<div class="third-cell">{{ gs.zzztsj }}</div>
								<div class="third-cell">{{ gs.maxMoney }}</div>
							</div>
						</div> -->
					</el-button>
				</div>
			</div>
		</div>
	</div>
	<el-dialog
		:fullscreen="true"
		class="dialog"
		v-model="gnStocks.visible"
		title="强度排序"
	>
		<div class="table">
			<div class="header">
				<div class="column">昨日强度</div>
				<div class="column">今日强度</div>
				<div class="column">强弱变化</div>
				<div class="column w-name">个股</div>
				<div class="column w-jb">几天几板</div>
				<div class="column w-time">最终涨停时间</div>
				<div class="column w-je">最大封单金额</div>
				<div class="column">今日竞价涨幅</div>
			</div>
			<div class="body">
				<div
					class="row"
					v-for="gs in gnStocks.data"
					:class="gs.zf > 0 ? 'red' : ''"
				>
					<div class="cell">{{ gs.zrSort }}</div>
					<div class="cell">{{ gs.jrSort }}</div>
					<div class="cell">{{ gs.zf }}</div>
					<div class="cell">{{ gs.name }}</div>
					<div class="cell">{{ gs.jb }}板</div>
					<div class="cell">{{ gs.zzztsj }}</div>
					<div class="cell">{{ gs.maxMoney }}</div>
					<div
						class="cell"
						:class="gs.jjzf > 0 ? 'red' : gs.jjzf < 0 ? 'green' : ''"
					>
						{{ gs.jjzf }}
					</div>
				</div>
			</div>
		</div>
	</el-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import HolidayDate from '@/components/HolidayDate.vue'
import { GetRobotData } from '@/common/api/ths-wen-cai-api'
import { replaceTpl, resolutionStock } from '@/common/utils'
import dayjs from 'dayjs'
const q =
	'昨日涨停最终涨停时间从早到晚排序，非st，非北交所，昨日涨停最大封单量，概念，昨日几天几板，昨日连续涨停天数，今日竞价涨跌幅'
const date = ref<string>(dayjs().format('YYYY-MM-DD'))
const lists = ref<any[]>([])
const gnStocks = ref<{
	visible: boolean
	data: any[]
}>({
	visible: false,
	data: [],
})
function dateChange(d: any) {
	date.value = d
}
function query() {
	GetRobotData({ question: replaceTpl(q, date.value) }).then((res) => {
		lists.value = resolutionStock(res.data)
		console.log(lists.value)
	})
}
function lookGnStock(stocks: any[]) {
	gnStocks.value.visible = true
	gnStocks.value.data = stocks
}
</script>
<style scoped lang="scss">
.table {
	// height: calc(100% - 32px);
	.header {
		display: flex;
		justify-content: space-between;
		padding-right: 6px;
		border-top: 1px solid #cdd0d6;
		border-left: 1px solid #cdd0d6;
		.column {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0 8px;
			width: 100%;
			border-right: 1px solid #cdd0d6;
			border-bottom: 1px solid #cdd0d6;
		}
		.fz-column {
			justify-content: space-between;
			padding: 0;
			border-right: unset;
			.sub-column {
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0 8px;
				width: 100%;
				height: 100%;
				border-right: 1px solid #cdd0d6;
			}
			.fz-sub-column {
				justify-content: space-between;
				padding: 0;
				border-right: unset;
				.third-column {
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 0 8px;
					width: 100%;
					height: 100%;
					border-right: 1px solid #cdd0d6;
				}
			}
		}
	}
	.body {
		// height: calc(100% - 22px);
		// overflow: auto;
		border-bottom: 1px solid #cdd0d6;
		border-left: 1px solid #cdd0d6;
		.row {
			display: flex;
			justify-content: space-between;
			.cell {
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0 8px;
				width: 100%;
				border-right: 1px solid #cdd0d6;
				border-bottom: 1px solid #cdd0d6;
			}
			.fz-cell {
				flex-wrap: wrap;
				padding: 0;
				align-items: unset;
				justify-content: space-between;
				flex-shrink: 1;
				.stock-item {
					display: flex;
					justify-content: space-between;
					width: 100%;
					border-bottom: 1px solid #cdd0d6;
				}
				.gn-item {
					display: flex;
					width: 100%;
					border-bottom: 1px solid #cdd0d6;
				}
				.sub-cell {
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 0 8px;
					width: 100%;
					border-right: 1px solid #cdd0d6;
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
}
.item-lb {
	width: 28px !important;
	flex-shrink: 0;
}
.item-gn {
	width: 188px !important;
	border-bottom: 1px solid #cdd0d6;
}
.w-38 {
	width: 38px !important;
	flex-shrink: 0;
}
.w-name {
	width: 78px !important;
	flex-shrink: 0;
}
.w-time {
	width: 58px !important;
	flex-shrink: 0;
}
.w-gn {
	width: 78px !important;
	flex-shrink: 0;
}
.w-jb {
	width: 58px !important;
	flex-shrink: 0;
}
.w-je {
	width: 58px !important;
	flex-shrink: 0;
}
.red {
	color: red;
}
.green {
	color: green;
}
</style>
