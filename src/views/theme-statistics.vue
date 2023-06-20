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
	<a-table
		:columns="hot.columns"
		:data-source="hot.data"
		:pagination="false"
		style="max-height: calc(100% - 32px); overflow: auto"
	></a-table>
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
// import { GetRobotData } from '@/common/api/ths-wen-cai-api'
import { GetKaiPanLaHotBanKuai } from '@/common/api/third-party-api'
import {
	SetThemeStatistics,
	GetThemeStatistics,
} from '@/common/api/uni-cloud-api'
// import { replaceTpl, resolutionWenCaiData } from '@/common/utils'
import dayjs from 'dayjs'
import HolidayDate from '@/components/HolidayDate.vue'
// const question = ref<string>(
// 	'今日涨停，涨停原因，连续涨停天数，不包含st，不包含新股'
// )
// const showQ = ref<string>('')
const date = ref<string>(dayjs().format('YYYY-MM-DD'))
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
	GetThemeStatistics({ date: d }).then((res) => {
		if (res.data && res.data.data.length) {
			hot.value.data = res.data.data[0].hot
		}
	})
}
function record() {
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
	// GetRobotData({ question: showQ.value }).then((res) => {
	// 	const resData = resolutionWenCaiData(res.data) as any
	// 	result.value = resData.data
	// 	SetThemeStatistics({ date: date.value, ...resData })
	// })
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
