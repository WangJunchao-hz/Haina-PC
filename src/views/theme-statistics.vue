<template>
	<div class="question">
		<holiday-date @change="dateChange"></holiday-date>
		<!-- <a-textarea v-model:value="question" placeholder="请输入问句" auto-size /> -->
		<a-button
			@click="record"
			size="small"
			type="primary"
			style="margin-left: 8px"
		>
			统计
		</a-button>
	</div>
	<a-tabs
		v-model:activeKey="activeTab"
		style="height: calc(100% - 48px); overflow: auto"
	>
		<a-tab-pane key="1" tab="开盘啦" style="height: 100%">
			<a-table
				:columns="hot.columns"
				:data-source="hot.data"
				:pagination="false"
				style="max-height: 100%; overflow: auto"
			></a-table>
		</a-tab-pane>
		<a-tab-pane key="2" tab="同花顺">
			<a-table
				:columns="ths.columns"
				:data-source="ths.data"
				:pagination="false"
				style="max-height: 100%; overflow: auto"
			></a-table>
		</a-tab-pane>
	</a-tabs>
	<!-- <a-card :title="showQ" size="small">
		<a-card-grid v-for="item in result" @click="cardClick(item)">
			<span class="card-label" :title="item.lb">{{ item.lb }}</span>
			({{ item.num }})
		</a-card-grid>
	</a-card>
	<a-modal
		v-model:visible="themeInfo.visible"
		:title="themeInfo.title"
		@ok="themeInfo.visible = false"
		:width="888"
	>
		<a-table
			:columns="themeInfo.columns"
			:data-source="themeInfo.data"
			:pagination="false"
		></a-table>
	</a-modal> -->
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { GetRobotData } from '@/common/api/ths-wen-cai-api'
import { GetKaiPanLaHotBanKuai } from '@/common/api/third-party-api'
import {
	SetThemeStatistics,
	GetThemeStatistics,
	UniCloudSet,
	UniCloudGet,
} from '@/common/api/uni-cloud-api'
import { replaceTpl, resolutionTHSBKData } from '@/common/utils'
import dayjs from 'dayjs'
import HolidayDate from '@/components/HolidayDate.vue'
// const question = ref<string>(
// 	'今日涨停，涨停原因，连续涨停天数，不包含st，不包含新股'
// )
// const showQ = ref<string>('')
const date = ref<string>(dayjs().format('YYYY-MM-DD'))
const activeTab = ref<string>('1')
// const result = ref<any[]>([])
const hot = ref<{
	columns: {
		title: string
		dataIndex: string
	}[]
	data: any[]
}>({
	columns: [
		{
			title: '板块',
			dataIndex: 'name',
		},
		{
			title: '强度',
			dataIndex: 'vol',
		},
	],
	data: [],
})
const ths = ref<{
	columns: {
		title: string
		dataIndex: string
	}[]
	data: any[]
}>({
	columns: [
		{
			title: '板块',
			dataIndex: 'name',
		},
		{
			title: '涨停家数',
			dataIndex: 'ztjs',
		},
	],
	data: [],
})
// const themeInfo = ref<{
// 	visible: boolean
// 	title: string
// 	columns: any[]
// 	data: any[]
// }>({
// 	visible: false,
// 	title: '',
// 	columns: [
// 		{
// 			title: '股票code',
// 			dataIndex: 'code',
// 		},
// 		{
// 			title: '股票名称',
// 			dataIndex: 'name',
// 		},
// 		{
// 			title: '连续涨停天数',
// 			dataIndex: 'lxzts',
// 			align: 'center',
// 		},
// 		{
// 			title: '几天几板',
// 			dataIndex: 'jtjb',
// 			align: 'center',
// 		},
// 		{
// 			title: '涨停原因类别',
// 			dataIndex: 'ztyylb',
// 		},
// 	],
// 	data: [],
// })
function dateChange(d: string) {
	// showQ.value = replaceTpl(question.value, d)
	date.value = d
	// result.value = []
	hot.value.data = []
	GetThemeStatistics({ date: d }).then((res) => {
		if (res.data && res.data.data.length) {
			hot.value.data = res.data.data[0].hot
		}
	})
	ths.value.data = []
	UniCloudGet({ _tableName: 'ths-bk-tj', date: d }).then((res) => {
		if (res.data && res.data.data.length) {
			ths.value.data = res.data.data[0].data
		}
	})
}
function record() {
	if (activeTab.value === '1') {
		GetKaiPanLaHotBanKuai(date.value).then((res) => {
			if (res.data.list) {
				const bankuai = res.data.list.map((item: any) => {
					return {
						name: item[1],
						vol: item[2],
					}
				})
				hot.value.data = bankuai
				SetThemeStatistics({ date: date.value, hot: bankuai })
				// console.log(bankuai)
			}
		})
	} else {
		const q = replaceTpl('概念指数，今日涨停家数从大到小排序', date.value)
		GetRobotData({ question: q, secondary_intent: 'zhishu' }).then((res) => {
			const resData = resolutionTHSBKData(res.data) as any
			ths.value.data = resData
			UniCloudSet({ date: date.value, data: resData, _tableName: 'ths-bk-tj' })
		})
	}
}

// function cardClick(item: any) {
// 	themeInfo.value.title = `${item.lb}(${item.num})`
// 	themeInfo.value.visible = true
// 	themeInfo.value.data = item.stocks
// }
</script>
<style lang="scss" scoped>
.question {
	display: flex;
}
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
:deep(.ant-tabs-content) {
	height: 100%;
}
.card-label {
	display: inline-block;
	max-width: 80%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	word-break: break-all;
	vertical-align: middle;
}
</style>
