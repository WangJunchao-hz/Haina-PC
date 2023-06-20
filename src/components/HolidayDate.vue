<template>
	<a-date-picker
		v-model:value="date"
		format="YYYY-MM-DD"
		:disabled-date="disabledDate"
		@openChange="openChange"
		@change="dateChange"
	/>
</template>
<script setup lang="ts">
import { ref, nextTick } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { GetHoliday } from '@/common/api/third-party-api'
import { Cache } from '@/common/utils'
const emit = defineEmits<{ (e: 'change', date: string): void }>()
const date = ref<Dayjs>(dayjs())
const holiday = ref<string[]>([])
const disabledDate = (current: Dayjs) => {
	let res = false
	if (holiday.value.includes(current.format('YYYY-MM-DD'))) {
		res = true
	} else if (current > dayjs().endOf('day')) {
		res = true
	}
	return res
}
function dateChange(date: Dayjs) {
	emit('change', date.format('YYYY-MM-DD'))
}
let observer: any
let year: string
function openChange(status: boolean) {
	if (status) {
		nextTick(() => {
			if (!observer) {
				const targetDom = document.querySelector('.ant-picker-panel')!
				const yearDom = document.querySelector('.ant-picker-year-btn')
				if (yearDom) {
					year = yearDom.innerHTML
					getHoliday(year.replace('年', ''))
				}
				observer = new MutationObserver((mutationsList) => {
					const yearDom = document.querySelector('.ant-picker-year-btn')
					if (yearDom) {
						const newYear = yearDom.innerHTML
						if (year !== newYear) {
							year = newYear
							getHoliday(year.replace('年', ''))
						}
					}
				})
				observer.observe(targetDom, {
					characterData: true,
					childList: true,
					subtree: true,
				})
			}
		})
	}
}
function getHoliday(y: string) {
	const cache = Cache.get('holiday', y)
	if (!cache) {
		GetHoliday(y).then((res) => {
			if (res.data.code === 0) {
				const rawHoliday = res.data.holiday
				const hday: string[] = []
				Object.keys(rawHoliday).forEach((key) => {
					const d = rawHoliday[key]
					hday.push(d.date)
				})
				holiday.value = hday
				Cache.set('holiday', y, hday)
			}
		})
	} else {
		holiday.value = cache
	}
}
</script>
