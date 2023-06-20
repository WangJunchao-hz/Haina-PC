<template>
	<div class="question">
		<holiday-date @change="dateChange"></holiday-date>
		<a-button
			@click="analysis()"
			size="small"
			type="primary"
			:disabled="!(hasGetNum === btns.length * 2)"
			style="margin-left: 8px"
		>
			分析
		</a-button>
		<div style="margin-bottom: 8px">
			昨日：
			<a-button
				@click="btnClick('yesterday', item.value)"
				size="small"
				type="primary"
				style="margin-left: 8px"
				v-for="item in btns"
			>
				{{ item.label }}({{ item.hasClick.y ? 1 : 0 }})
			</a-button>
		</div>
		<div>
			今日：
			<a-button
				@click="btnClick('today', item.value)"
				size="small"
				type="primary"
				style="margin-left: 8px"
				v-for="item in btns"
			>
				{{ item.label }}({{ item.hasClick.t ? 1 : 0 }})
			</a-button>
		</div>
	</div>
	<a-card title="市场">
		<simple-table :columns="sc.columns" :data="sc.data"></simple-table>
	</a-card>
	<a-card title="首板">
		<simple-table
			:columns="firstZt.columns"
			:data="firstZt.data"
		></simple-table>
	</a-card>
	<a-card title="连板">
		<simple-table :columns="lbZt.columns" :data="lbZt.data"></simple-table>
	</a-card>
	<a-card title="反包">
		<simple-table :columns="fbZt.columns" :data="fbZt.data"></simple-table>
	</a-card>
	<a-card title="断板">
		<simple-table :columns="db.columns" :data="db.data"></simple-table>
	</a-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { GetRobotData } from '@/common/api/ths-wen-cai-api'
import {
	SetEmotionStatistics,
	GetEmotionStatistics,
} from '@/common/api/uni-cloud-api'
import {
	replaceTpl,
	resolutionEmotionZT,
	resolutionEmotionDT,
	resolutionEmotionDB,
	resolutionEmotionSC,
} from '@/common/utils'
import HolidayDate from '@/components/HolidayDate.vue'
import SimpleTable from '@/components/SimpleTable.vue'
import dayjs from 'dayjs'
import {
	FirstZtColumns,
	LbZtColumns,
	FbZtColumns,
	DbColumns,
	SCColumns,
} from '@/common/enum'
const fixed = '不包含st，不包含新股，不包含停牌'
const yesterday: any = {
	ztQ: '昨日涨停，今日涨跌幅，' + fixed,
	dtQ: '昨日跌停，' + fixed,
	dbQ: '前日涨停，昨日非涨停，今日涨跌幅，' + fixed,
	hpQ: '昨日涨跌幅大于0，' + fixed,
	lpQ: '昨日涨跌幅小于0，' + fixed,
	z5Q: '昨日涨跌幅大于等于5，' + fixed,
	d5Q: '昨日涨跌幅小于等于-5，' + fixed,
}
const today: any = {
	ztQ: '今日涨停，' + fixed,
	dtQ: '今日跌停，' + fixed,
	dbQ: '昨日涨停，今日非涨停，' + fixed,
	hpQ: '今日涨跌幅大于0，' + fixed,
	lpQ: '今日涨跌幅小于0，' + fixed,
	z5Q: '今日涨跌幅大于等于5，' + fixed,
	d5Q: '今日涨跌幅小于等于-5，' + fixed,
}
const btns = ref<
	{
		label: string
		value: string
		hasClick: {
			y: boolean
			t: boolean
		}
	}[]
>([
	{
		label: '涨停',
		value: 'ztQ',
		hasClick: {
			y: false,
			t: false,
		},
	},
	{
		label: '跌停',
		value: 'dtQ',
		hasClick: {
			y: false,
			t: false,
		},
	},
	{
		label: '断板',
		value: 'dbQ',
		hasClick: {
			y: false,
			t: false,
		},
	},
	{
		label: '红盘',
		value: 'hpQ',
		hasClick: {
			y: false,
			t: false,
		},
	},
	{
		label: '绿盘',
		value: 'lpQ',
		hasClick: {
			y: false,
			t: false,
		},
	},
	{
		label: '涨5',
		value: 'z5Q',
		hasClick: {
			y: false,
			t: false,
		},
	},
	{
		label: '跌5',
		value: 'd5Q',
		hasClick: {
			y: false,
			t: false,
		},
	},
])
const hasGetNum = ref<number>(0)
const zhishu = ref<SingleZhiShu>({})
const date = ref<string>(dayjs().format('YYYY-MM-DD'))
const firstZt = ref<{
	columns: SimpleTableColumn[]
	data: any[]
}>({
	columns: FirstZtColumns,
	data: [],
})
const lbZt = ref<{
	columns: SimpleTableColumn[]
	data: any[]
}>({
	columns: LbZtColumns,
	data: [],
})
const fbZt = ref<{
	columns: SimpleTableColumn[]
	data: any[]
}>({
	columns: FbZtColumns,
	data: [],
})
const db = ref<{
	columns: SimpleTableColumn[]
	data: any[]
}>({
	columns: DbColumns,
	data: [],
})
const sc = ref<{
	columns: SimpleTableColumn[]
	data: any[]
}>({
	columns: SCColumns,
	data: [],
})
function dateChange(d: string) {
	date.value = d
	zhishu.value = {}
	firstZt.value.data = []
	lbZt.value.data = []
	fbZt.value.data = []
	db.value.data = []
	sc.value.data = []
	hasGetNum.value = 0
	btns.value.forEach((btn) => {
		btn.hasClick.t = false
		btn.hasClick.y = false
	})
	GetEmotionStatistics({ date: d }).then((res) => {
		if (res.data.data.length) {
			zhishu.value = res.data.data[0]
			if ((zhishu.value as any)._id) {
				delete (zhishu.value as any)._id
			}
			firstZt.value.data = [
				{
					...zhishu.value.profit?.first,
					...zhishu.value.loss?.first,
				},
			]
			lbZt.value.data = [
				{
					...zhishu.value.profit?.lb,
					...zhishu.value.loss?.lb,
				},
			]
			fbZt.value.data = [
				{
					...zhishu.value.profit?.fb,
					...zhishu.value.loss?.fb,
				},
			]
			db.value.data = [
				{
					...zhishu.value.profit?.db,
					...zhishu.value.loss?.db,
				},
			]
			sc.value.data = [
				{
					...zhishu.value.profit?.sc,
					...zhishu.value.loss?.sc,
				},
			]
		}
	})
}
function getWenCaiData(q: string, type: string, prop: string) {
	GetRobotData({ question: replaceTpl(q, date.value) }).then((res) => {
		let isSuccess = true
		switch (prop) {
			case 'ztQ':
				{
					const resData = resolutionEmotionZT(res.data)
					isSuccess = resData
					if (!isSuccess) {
						return false
					}
					const classify: SingleZhiShu['yesterday'] | SingleZhiShu['today'] =
						{} as any
					classify!.ztNum = resData!.ztNum
					classify!.firstNum = resData!.firstNum
					classify!.lbNum = resData!.lbNum
					classify!.fbbNum = resData!.fbNum
					if (type === 'today') {
						zhishu.value.today = {
							...(zhishu.value.today || {}),
							...classify,
						} as any
					} else {
						zhishu.value.yesterday = {
							...(zhishu.value.yesterday || {}),
							...classify,
						} as any
						const profitEffect: SingleZhiShu['profitEffect'] = {
							first: {},
							lb: {},
							fb: {},
							sc: {},
						} as any
						profitEffect!.first!.zrhpb = resData!.first.zrhpb
						profitEffect!.first!.zrz5b = resData!.first.zrz5b
						profitEffect!.first!.zrjjl = resData!.first.zrjjl
						profitEffect!.lb!.zrhpb = resData!.lb.zrhpb
						profitEffect!.lb!.zrz5b = resData!.lb.zrz5b
						profitEffect!.lb!.zrjjl = resData!.lb.zrjjl
						profitEffect!.fb!.zrhpb = resData!.fb.zrhpb
						profitEffect!.fb!.zrz5b = resData!.fb.zrz5b
						profitEffect!.fb!.zrjjl = resData!.fb.zrjjl
						zhishu.value.profitEffect = {
							...(zhishu.value.profitEffect || {}),
							...profitEffect,
						}
						zhishu.value.profit = {
							...(zhishu.value.profit || {}),
							...({
								first: {
									zrhp: resData.first.hpNum,
									zrjj: resData.first.jjNum,
									zrz5: resData.first.z5Num,
								},
								lb: {
									zrhp: resData.lb.hpNum,
									zrjj: resData.lb.jjNum,
									zrz5: resData.lb.z5Num,
								},
								fb: {
									zrhp: resData.fb.hpNum,
									zrjj: resData.fb.jjNum,
									zrz5: resData.fb.z5Num,
								},
							} as any),
						}
						const lossEffect: SingleZhiShu['lossEffect'] = {
							first: {},
							lb: {},
							fb: {},
							sc: {},
						} as any
						lossEffect!.first!.zrd5b = resData!.first.zrd5b
						lossEffect!.first!.zrlpb = resData!.first.zrlpb
						lossEffect!.lb!.zrd5b = resData!.lb.zrd5b
						lossEffect!.lb!.zrlpb = resData!.lb.zrlpb
						lossEffect!.fb!.zrlpb = resData!.fb.zrlpb
						lossEffect!.fb!.zrd5b = resData!.fb.zrd5b
						zhishu.value.lossEffect = {
							...(zhishu.value.lossEffect || {}),
							...lossEffect,
						}
						zhishu.value.loss = {
							...(zhishu.value.loss || {}),
							...({
								first: {
									zrd5: resData.first.d5Num,
									zrlp: resData.first.lpNum,
									diffRate: 2,
								},
								lb: {
									zrd5: resData.lb.d5Num,
									zrlp: resData.lb.lpNum,
									diffRate: 2,
								},
								fb: {
									zrd5: resData.fb.d5Num,
									zrlp: resData.fb.lpNum,
									diffRate: 2,
								},
							} as any),
						}
					}
					if (type === 'today') {
						if (!zhishu.value.profitEffect) {
							zhishu.value.profitEffect = {
								sc: {
									lbHeight: resData!.lb.height,
								} as any,
							}
						} else {
							zhishu.value.profitEffect!.sc!.lbHeight = resData!.lb.height
						}
						zhishu.value.profit = {
							...(zhishu.value.profit || {}),
							lb: {
								...(zhishu.value.profit?.lb || {}),
								num: resData.lbNum,
								diffRate: 1,
							} as any,
							first: {
								...(zhishu.value.profit?.first || {}),
								num: resData.firstNum,
								diffRate: 1,
							} as any,
							fb: {
								...(zhishu.value.profit?.fb || {}),
								num: resData.fbNum,
								diffRate: 1,
							} as any,
							sc: {
								...(zhishu.value.profit?.sc || {}),
								lbHeight: resData!.lb.height,
								zt: resData.ztNum,
								lb: resData.lbNum,
								diffRate: 1,
							} as any,
						}
					}
				}
				break
			case 'dtQ':
				{
					const resData = resolutionEmotionDT(res.data)
					isSuccess = resData
					if (!isSuccess) {
						return false
					}
					const classify: SingleZhiShu['yesterday'] | SingleZhiShu['today'] =
						{} as any
					classify!.dtNum = resData!.dtNum
					classify!.ltNum = resData!.ltNum
					if (type === 'today') {
						zhishu.value.today = {
							...(zhishu.value.today || {}),
							...classify,
						} as any
					} else {
						zhishu.value.yesterday = {
							...(zhishu.value.yesterday || {}),
							...classify,
						} as any
					}
					zhishu.value.lossEffect = {
						...(zhishu.value.lossEffect || {}),
						sc: {
							...(zhishu.value.lossEffect?.sc || {}),
						} as any,
					}
					zhishu.value.loss = {
						...(zhishu.value.loss || {}),
						sc: {
							...(zhishu.value.loss?.sc || {}),
							diffRate: 1,
						} as any,
					}
					if (type === 'today') {
						zhishu.value.loss.sc!.dt = resData.dtNum
						zhishu.value.loss.sc!.lt = resData.ltNum
						zhishu.value.loss.sc!.ltHeight = resData!.height
						zhishu.value.lossEffect.sc!.ltHeight = resData!.height
					}
				}
				break
			case 'dbQ':
				{
					const resData = resolutionEmotionDB(res.data)
					isSuccess = resData
					if (!isSuccess) {
						return false
					}
					if (type === 'today') {
						zhishu.value.today = {
							...(zhishu.value.today || {}),
							dbNum: resData!.dbNum,
						} as any
					} else {
						zhishu.value.yesterday = {
							...(zhishu.value.yesterday || {}),
							dbNum: resData!.dbNum,
						} as any
						const profitEffect: SingleZhiShu['profitEffect'] = {
							db: {},
						} as any
						profitEffect!.db!.fbl = resData!.fbl
						profitEffect!.db!.hpb = resData!.hpb
						profitEffect!.db!.z5b = resData!.z5b
						zhishu.value.profitEffect = {
							...(zhishu.value.profitEffect || {}),
							...profitEffect,
						}
						zhishu.value.profit = {
							...(zhishu.value.profit || {}),
							...{
								db: {
									fb: resData.fbNum,
									hp: resData.hpNum,
									z5: resData.z5Num,
									diffRate: 1.33,
								},
							},
						}
						const lossEffect: SingleZhiShu['lossEffect'] = {
							db: {},
						} as any
						lossEffect!.db!.d5b = resData!.d5b
						lossEffect!.db!.lpb = resData!.lpb
						zhishu.value.lossEffect = {
							...(zhishu.value.lossEffect || {}),
							...lossEffect,
						}
						zhishu.value.loss = {
							...(zhishu.value.loss || {}),
							...{
								db: {
									num: resData.dbNum,
									lp: resData.lpNum,
									d5: resData.d5Num,
								} as any,
							},
						}
					}
					if (type === 'today') {
						zhishu.value.loss = {
							...(zhishu.value.loss || {}),
							db: {
								...(zhishu.value.loss?.db || {}),
								num: resData.dbNum,
								diffRate: 1.33,
							} as any,
						}
					}
				}
				break
			case 'hpQ':
				{
					const resData = resolutionEmotionSC(res.data)
					isSuccess = resData
					if (!isSuccess) {
						return false
					}
					if (type === 'today') {
						zhishu.value.today = {
							...(zhishu.value.today || {}),
							hpNum: resData,
						} as any
						zhishu.value.profit = {
							...(zhishu.value.profit || {}),
							sc: {
								...(zhishu.value.profit?.sc || {}),
								hp: resData,
							} as any,
						}
					} else {
						zhishu.value.yesterday = {
							...(zhishu.value.yesterday || {}),
							hpNum: resData,
						} as any
					}
				}
				break
			case 'lpQ':
				{
					const resData = resolutionEmotionSC(res.data)
					isSuccess = resData
					if (!isSuccess) {
						return false
					}
					if (type === 'today') {
						zhishu.value.today = {
							...(zhishu.value.today || {}),
							lpNum: resData,
						} as any
						zhishu.value.loss = {
							...(zhishu.value.loss || {}),
							sc: {
								...(zhishu.value.loss?.sc || {}),
								lp: resData,
							} as any,
						}
					} else {
						zhishu.value.yesterday = {
							...(zhishu.value.yesterday || {}),
							lpNum: resData,
						} as any
					}
				}
				break
			case 'z5Q':
				{
					const resData = resolutionEmotionSC(res.data)
					isSuccess = resData
					if (!isSuccess) {
						return false
					}
					if (type === 'today') {
						zhishu.value.today = {
							...(zhishu.value.today || {}),
							z5Num: resData,
						} as any
						zhishu.value.profit = {
							...(zhishu.value.profit || {}),
							sc: {
								...(zhishu.value.profit?.sc || {}),
								z5: resData,
							} as any,
						}
					} else {
						zhishu.value.yesterday = {
							...(zhishu.value.yesterday || {}),
							z5Num: resData,
						} as any
					}
				}
				break
			case 'd5Q':
				{
					const resData = resolutionEmotionSC(res.data)
					isSuccess = resData
					if (!isSuccess) {
						return false
					}
					if (type === 'today') {
						zhishu.value.today = {
							...(zhishu.value.today || {}),
							d5Num: resData,
						} as any
						zhishu.value.loss = {
							...(zhishu.value.loss || {}),
							sc: {
								...(zhishu.value.loss?.sc || {}),
								d5: resData,
							} as any,
						}
					} else {
						zhishu.value.yesterday = {
							...(zhishu.value.yesterday || {}),
							d5Num: resData,
						} as any
					}
				}
				break
		}
		if (isSuccess) {
			hasGetNum.value += 1
			const btn = btns.value.find((btn) => {
				if (btn.value === prop) {
					return true
				} else {
					return false
				}
			})
			if (type === 'today') {
				btn!.hasClick.t = true
			} else {
				btn!.hasClick.y = true
			}
		}
	})
}
function btnClick(type: string, prop: string) {
	let q = ''
	switch (type) {
		case 'yesterday':
			q = yesterday[prop]
			break
		case 'today':
			q = today[prop]
			break
	}
	getWenCaiData(q, type, prop)
}
function analysis() {
	const today = zhishu.value.today!
	const yesterday = zhishu.value.yesterday!
	zhishu.value.profitEffect!.first!.jzb = Number(
		(today.firstNum / yesterday.firstNum).toFixed(2)
	)
	zhishu.value.profitEffect!.lb!.jzb = Number(
		(today.lbNum / yesterday.lbNum).toFixed(2)
	)
	zhishu.value.profitEffect!.fb!.jzb = Number(
		(today.fbbNum / yesterday.fbbNum).toFixed(2)
	)
	zhishu.value.profitEffect!.sc!.jzztb = Number(
		(today.ztNum / yesterday.ztNum).toFixed(2)
	)
	zhishu.value.profitEffect!.sc!.jzhpb = Number(
		(today.hpNum / yesterday.hpNum).toFixed(2)
	)
	zhishu.value.profitEffect!.sc!.jzz5b = Number(
		(today.z5Num / yesterday.z5Num).toFixed(2)
	)
	zhishu.value.lossEffect!.sc!.jzdtb = Number(
		(today.dtNum / yesterday.dtNum).toFixed(2)
	)
	zhishu.value.lossEffect!.sc!.jzlpb = Number(
		(today.lpNum / yesterday.lpNum).toFixed(2)
	)
	zhishu.value.lossEffect!.sc!.jzd5b = Number(
		(today.d5Num / yesterday.d5Num).toFixed(2)
	)
	zhishu.value.lossEffect!.db!.jzb = Number(
		(today.dbNum / yesterday.dbNum).toFixed(2)
	)
	firstZt.value.data = [
		{
			...zhishu.value.profit?.first,
			...zhishu.value.loss?.first,
		},
	]
	lbZt.value.data = [
		{
			...zhishu.value.profit?.lb,
			...zhishu.value.loss?.lb,
		},
	]
	fbZt.value.data = [
		{
			...zhishu.value.profit?.fb,
			...zhishu.value.loss?.fb,
		},
	]
	db.value.data = [
		{
			...zhishu.value.profit?.db,
			...zhishu.value.loss?.db,
		},
	]
	sc.value.data = [
		{
			...zhishu.value.profit?.sc,
			...zhishu.value.loss?.sc,
		},
	]
	SetEmotionStatistics({
		date: date.value,
		...zhishu.value,
	})
	console.log(zhishu.value)
}
</script>
