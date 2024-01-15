<template>
	<holiday-date @change="dateChange"></holiday-date>
	<el-button
		@click="query(88)"
		size="small"
		type="primary"
		style="margin-left: 8px"
	>
		接力
	</el-button>
	<el-button
		@click="query(8)"
		size="small"
		type="primary"
		style="margin-left: 8px"
	>
		首板
	</el-button>
	<div v-if="showType === 88" class="table">
		<div class="row" v-for="item in lists.lbs">
			<div class="cell" style="width: 25px; flex-shrink: 0">{{ item.lb }}</div>
			<div class="cell fz-cell" style="width: 290px; flex-shrink: 0">
				<div
					class="stock-item"
					v-for="s in item.stocks"
					:class="s.zf > 0 ? 'red' : ''"
				>
					<el-popover placement="top-start" :width="288" trigger="click">
						<template #reference>
							<div class="sub-cell" style="width: 68px; flex-shrink: 0">
								<div>{{ s.name }}</div>
								<div>{{ s.jb }}板</div>
							</div>
						</template>
						<div>
							<span
								class="link"
								v-for="gn in s.gns"
								style="padding-right: 6px"
								@click="lookGnStock(gn)"
								>{{ gn }}</span
							>
						</div>
					</el-popover>
					<div class="sub-cell" style="width: 68px; flex-shrink: 0">
						<div>{{ s.zzztsj }}</div>
						<div>{{ s.maxMoney }}亿</div>
					</div>
					<div class="sub-cell" style="width: 22px; flex-shrink: 0">
						{{ s.zrSort }}
					</div>
					<div class="sub-cell" style="width: 22px; flex-shrink: 0">
						{{ s.jrSort }}
					</div>
					<div class="sub-cell" style="width: 22px; flex-shrink: 0">
						{{ s.zf }}
					</div>
					<div
						class="sub-cell"
						:class="s.jjzf > 0 ? 'red' : s.jjzf < 0 ? 'green' : ''"
						style="width: 58px; flex-shrink: 0"
					>
						{{ s.jjzf }}%
					</div>
				</div>
			</div>
			<div class="cell fz-cell" style="flex-grow: 1">
				<div
					class="gn-item link"
					v-for="g in item.ztGns"
					@click="lookGnStock(g)"
				>
					<template v-if="g.stocks.length > 1">
						{{ g.gn }}({{ g.stocks.length }}){{ g.hpl }}%
					</template>
					<template v-else> {{ g.gn }}({{ g.stocks.length }}) </template>
				</div>
			</div>
		</div>
	</div>
	<div v-if="showType === 8" class="sb-table">
		<div class="sb-gn-item" v-for="g in lists.gns">
			<div class="title" @click="getQ(g.gn)">
				{{ g.gn }}({{ g.stocks.length }})
			</div>
			<div class="stock-item" v-for="s in g.stocks">
				<div class="cell">
					{{ s.name }}
				</div>
				<div class="cell">{{ s.jb }}板</div>
				<div class="cell">
					{{ s.zzztsj }}
				</div>
				<div class="cell">{{ s.maxMoney }}亿</div>
			</div>
		</div>
	</div>
	<el-dialog
		:fullscreen="true"
		class="dialog"
		v-model="gnStocks.visible"
		:title="gnStocks.title"
	>
		<div
			class="dialog-stock"
			v-for="s in gnStocks.data"
			:class="s.zf > 0 ? 'red' : ''"
		>
			<el-popover placement="top-start" :width="288" trigger="click">
				<template #reference>
					<div class="sub-cell" style="width: 68px; flex-shrink: 0">
						<div>{{ s.name }}</div>
						<div>{{ s.jb }}板</div>
					</div>
				</template>
				<div>
					<span
						class="link"
						v-for="gn in s.gns"
						style="padding-right: 6px"
						@click="lookGnStock(gn)"
						>{{ gn }}</span
					>
				</div>
			</el-popover>
			<div class="sub-cell" style="width: 68px; flex-shrink: 0">
				<div>{{ s.zzztsj }}</div>
				<div>{{ s.maxMoney }}亿</div>
			</div>
			<div class="sub-cell" style="width: 22px; flex-shrink: 0">
				{{ s.zrSort }}
			</div>
			<div class="sub-cell" style="width: 22px; flex-shrink: 0">
				{{ s.jrSort }}
			</div>
			<div class="sub-cell" style="width: 22px; flex-shrink: 0">
				{{ s.zf }}
			</div>
			<div
				class="sub-cell"
				:class="s.jjzf > 0 ? 'red' : s.jjzf < 0 ? 'green' : ''"
				style="width: 58px; flex-shrink: 0"
			>
				{{ s.jjzf }}%
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
import { message } from 'ant-design-vue'
import 'ant-design-vue/es/message/style/css'
import useClipboard from 'vue-clipboard3'
const { toClipboard } = useClipboard()
const fixed = '，非st，非北交所，非停牌'
const q =
	'昨日涨停最终涨停时间从早到晚排序，昨日涨停最大封单量，概念，昨日几天几板，昨日连续涨停天数，今日竞价涨跌幅' +
	fixed
const sq =
	'今日涨停最终涨停时间从早到晚排序，今日涨停最大封单量，概念，今日几天几板，今日连续涨停天数' +
	fixed
const date = ref<string>(dayjs().format('YYYY-MM-DD'))
const showType = ref<number>(88)
const lists = ref<{
	lbs: any[]
	gns: any[]
}>({
	lbs: [],
	gns: [],
})
const gnStocks = ref<{
	visible: boolean
	data: any[]
	title: string
}>({
	visible: false,
	data: [],
	title: '',
})

function dateChange(d: any) {
	date.value = d
}
function query(type: 8 | 88) {
	showType.value = type
	const question = replaceTpl(type === 8 ? sq : q, date.value)
	GetRobotData({ question }).then((res) => {
		lists.value = resolutionStock(res.data)
		console.log(lists.value)
	})
}
function lookGnStock(ztGn: any) {
	gnStocks.value.visible = true
	if (typeof ztGn === 'string') {
		gnStocks.value.title = ztGn
		const gn = ztGn.split('(')[0]
		const gnInfo = lists.value.gns.find((item) => item.gn === gn)
		if (gnInfo) {
			gnStocks.value.data = gnInfo.stocks
		}
	} else {
		gnStocks.value.title = `${ztGn.gn}(${ztGn.stocks.length})${ztGn.hpl}%`
		gnStocks.value.data = ztGn.stocks
	}
}
function getQ(gn: string) {
	toClipboard(`${gn}概念，流通市值不超过300亿，涨跌幅从大到小排序${fixed}`)
		.then(() => {
			message.success('复制成功')
		})
		.catch(() => {
			message.success('复制失败')
		})
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
</style>
