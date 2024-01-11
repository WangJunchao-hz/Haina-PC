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
</template>
<script setup lang="ts">
import { ref } from 'vue'
import HolidayDate from '@/components/HolidayDate.vue'
import { GetRobotData } from '@/common/api/ths-wen-cai-api'
import { replaceTpl, resolutionStock } from '@/common/utils'
import dayjs from 'dayjs'
const q = '今日涨停，最终涨停时间从早到晚排序，非st，非北交所'
const date = ref<string>(dayjs().format('YYYY-MM-DD'))
function dateChange() {}
function query() {
	GetRobotData({ question: replaceTpl(q, date.value) }).then((res) => {
		const xx = resolutionStock(res.data)
		console.log(xx)
	})
}
</script>
