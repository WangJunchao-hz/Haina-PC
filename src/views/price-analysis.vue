<template>
	<a-row>
		<a-col :span="12">
			<div style="display: flex">
				<a-textarea
					style="width: 88px"
					@change="clean"
					@focus="autoPaste"
					v-model:value="text"
					placeholder="快速识别区域"
					:rows="8"
				/>
				<a-textarea
					v-model:value="text1"
					placeholder="商品数据，可手动修正"
					:rows="8"
				/>
			</div>
		</a-col>
		<a-col :span="12">
			<div style="padding-left: 18px">
				<a-space direction="vertical">
					<a-button type="primary" @click="clean(2)">清洗</a-button>
					<a-button type="primary" @click="analysis">分析</a-button>
					<a-button type="primary" @click="save">保存</a-button>
					<a-switch
						v-model:checked="isCache"
						checked-children="开启缓存"
						un-checked-children="关闭缓存"
					/>
					<a-button type="primary" @click="cleanCache">清除缓存</a-button>
				</a-space>
				<a-space direction="vertical" style="padding-left: 18px">
					<a-input-search
						style="width: 288px"
						v-model:value="config.user.mobile"
						:disabled="isLogin"
						placeholder="手机号作为唯一标识，设置后不可修改"
					>
						<template #enterButton>
							<a-button @click="login" :disabled="isLogin">登录</a-button>
						</template>
					</a-input-search>
					<a-button type="primary" @click="setConfig">设置</a-button>
					<a-cascader
						style="width: 188px"
						v-model:value="select.value"
						:options="select.options"
						:show-search="{ filter: select.filter }"
						placeholder="快速筛选"
						expandTrigger="hover"
						@change="selectChange"
					/>
				</a-space>
			</div>
		</a-col>
	</a-row>
	<div style="height: calc(100% - 186px)">
		<a-tabs v-model:activeKey="activeTab" style="height: 100%">
			<a-tab-pane key="1" tab="统计" style="height: 100%">
				<a-table
					:columns="table.columns"
					:data-source="table.data"
					:pagination="false"
					:scroll="{ y: 'calc(100% - 55px)' }"
				>
					<template #bodyCell="{ column, record, index }">
						<template v-if="column.dataIndex === 'operate'">
							<a-space>
								<a-button
									type="primary"
									size="small"
									danger
									@click="remove(index)"
								>
									删除
								</a-button>
							</a-space>
						</template>
						<template v-else>
							<a-select
								style="width: 100%"
								placeholder="选择或输入特征"
								v-if="column.dataIndex === 'feature'"
								v-model:value="record.featureModel"
								mode="tags"
								:token-separators="[',']"
								:options="
									(goodsMap &&
										goodsMap[record.name] &&
										goodsMap[record.name].options) ||
									[]
								"
								:filter-option="(input: string, option: any) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}"
								show-search
							/>
							<span v-else-if="column.dataIndex === 'index'">{{
								record[column.dataIndex]
							}}</span>
							<a-input v-else v-model:value="record[column.dataIndex]" />
						</template>
					</template>
				</a-table>
			</a-tab-pane>
			<a-tab-pane key="2" tab="分析">
				<a-table
					:columns="fxTable.columns"
					:data-source="fxTable.data"
					:pagination="false"
					:scroll="{ y: 'calc(100% - 55px)' }"
				>
					<template #bodyCell="{ column, record, index }">
						<template v-if="column.dataIndex === 'operate'">
							<a-space>
								<a-button
									type="primary"
									size="small"
									@click="lookDetail(record)"
								>
									明细
								</a-button>
								<!-- <a-button type="primary" size="small" @click="remove(index)">
									趋势
								</a-button> -->
							</a-space>
						</template>
						<template v-else>
							<template
								v-if="
									column.dataIndex === 'zdf' ||
									column.dataIndex === 'discount' ||
									column.dataIndex === 'qwProfit'
								"
							>
								<template
									v-if="
										column.dataIndex === 'zdf' && record[column.dataIndex] !== 0
									"
								>
									<span
										:style="{
											color: record[column.dataIndex] > 0 ? 'red' : 'green',
										}"
									>
										{{ record[column.dataIndex] * 100 }}%
									</span>
								</template>
								<span v-else> {{ record[column.dataIndex] * 100 }}% </span>
							</template>
							<span
								v-else-if="
									column.dataIndex === 'ygStallPrice' ||
									column.dataIndex === 'ygStockPrice'
								"
								style="color: red"
								>{{ record[column.dataIndex] }}</span
							>
							<span v-else>{{ record[column.dataIndex] }}</span>
						</template>
					</template>
				</a-table>
			</a-tab-pane>
		</a-tabs>
		<a-modal
			v-model:visible="detailModal.visible"
			title="统计明细"
			@ok="detailModal.visible = false"
			:width="888"
		>
			<a-table
				size="small"
				:columns="detailModal.table.columns"
				:data-source="detailModal.table.data"
				:pagination="false"
				:scroll="{ y: 588 }"
			>
			</a-table>
		</a-modal>
		<a-modal
			v-model:visible="setModal.visible"
			title="分析参数设置"
			@ok="upSet"
			:width="888"
		>
			<a-card title="全局参数" size="small">
				<a-input-number
					v-model:value="config.global.discount"
					:min="0"
					:max="1"
					:step="0.01"
				>
					<template #addonBefore> 让利 </template>
				</a-input-number>
				<a-input-number
					v-model:value="config.global.qwProfit"
					:min="0"
					:max="1"
					:step="0.01"
				>
					<template #addonBefore> 期望收益 </template>
				</a-input-number>
			</a-card>
			<a-card title="详细参数" size="small">
				<a-table
					size="small"
					:columns="setModal.table.columns"
					:data-source="setModal.table.data"
					:pagination="false"
					:scroll="{ y: 388 }"
				>
					<template #bodyCell="{ column, record }">
						<template v-if="column.dataIndex === 'qwProfit'">
							<a-input-number
								v-model:value="record[column.dataIndex]"
								:min="0"
								:max="1"
								:step="0.01"
							>
							</a-input-number>
						</template>
						<span v-else>{{ record[column.dataIndex] }}</span>
					</template>
				</a-table>
			</a-card>
		</a-modal>
	</div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import { v4 } from 'uuid'
import { UniCloudSet, UniCloudGet } from '@/common/api/uni-cloud-api'
import { message } from 'ant-design-vue'
import type { CascaderProps } from 'ant-design-vue'
import type { ShowSearchType } from 'ant-design-vue/es/cascader'
import 'ant-design-vue/es/message/style/css'
import { isNumber, getStringAfter, insertNewline, Cache } from '@/common/utils'
const config = ref<{
	user: { mobile: string | number }
	global: { discount: number; qwProfit: number }
	detail: { [name: string]: any }
	id?: string
}>({
	user: { mobile: '' },
	global: {
		discount: 0.01, // 默认让利1%
		qwProfit: 0.3, // 期望利润率20%
	},
	detail: {}, // 单个商品详细配置
	id: v4(),
})
const goodsMap = ref<{
	[name: string]: {
		label: string
		value: number | string
		options: {
			label: string
			value: number | string
		}[]
	}
}>({})
const select = ref<{
	value: string[]
	options: CascaderProps['options']
	filter: ShowSearchType['filter']
}>({
	value: [],
	options: [],
	filter: (inputValue, path) => {
		return path.some(
			(option) =>
				option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
		)
	},
})
const tjColumns = [
	{
		title: '名称',
		dataIndex: 'name',
	},
	{
		title: '属/技/等',
		dataIndex: 'feature',
	},
	{
		title: '价格',
		dataIndex: 'price',
	},
]
const detailModal = ref<{
	visible: boolean
	table: {
		columns: any[]
		data: any[]
	}
}>({
	visible: false,
	table: {
		columns: tjColumns,
		data: [],
	},
})
const setModal = ref<{
	visible: boolean
	table: {
		columns: any[]
		data: any[]
	}
}>({
	visible: false,
	table: {
		columns: [
			{
				title: '名称',
				dataIndex: 'name',
			},
			{
				title: '属/技/等',
				dataIndex: 'feature',
			},
			{
				title: '期望利润率',
				dataIndex: 'qwProfit',
			},
		],
		data: [],
	},
})
const date = dayjs().format('YYYY-MM-DD')
const isCache = ref<boolean>(true)
const isLogin = ref<boolean>(false)
const text = ref<string>('')
const text1 = ref<string>('')
const activeTab = ref<string>('1')
const table = ref<{ columns: any[]; data: any[] }>({
	columns: [
		{
			title: '序号',
			dataIndex: 'index',
		},
		...tjColumns,
		{
			title: '操作',
			dataIndex: 'operate',
		},
	],
	data: [],
})
const fxTable = ref<{ columns: any[]; data: any[]; rawData: any[] }>({
	columns: [
		{
			title: '名称',
			dataIndex: 'name',
		},
		{
			title: '属/技/等',
			dataIndex: 'feature',
		},
		{
			title: '市场均价',
			dataIndex: 'avgPrice',
			sorter: (a: any, b: any) => b.avgPrice - a.avgPrice,
		},
		{
			title: '涨跌幅',
			dataIndex: 'zdf',
		},
		{
			title: '让利',
			dataIndex: 'discount',
		},
		{
			title: '预估摆摊价',
			dataIndex: 'ygStallPrice',
		},
		{
			title: '期望利润率',
			dataIndex: 'qwProfit',
		},
		{
			title: '预估收货价',
			dataIndex: 'ygStockPrice',
		},
		{
			title: '数量',
			dataIndex: 'num',
			sorter: (a: any, b: any) => b.num - a.num,
		},
		{
			title: '操作',
			dataIndex: 'operate',
		},
	],
	data: [],
	rawData: [],
})
init()
function init() {
	const mobile = Cache.get('Login', 'mobile')
	if (!mobile) {
		return false
	} else {
		config.value.user.mobile = mobile
		isLogin.value = true
	}
	Promise.all([
		UniCloudGet({
			_tableName: 'goods-map',
			whereKey: 'mobile',
			whereValue: mobile,
		}),
		UniCloudGet({
			_tableName: 'stall-config',
			whereKey: 'mobile',
			whereValue: mobile,
		}),
		UniCloudGet({
			_tableName: 'stall-analysis',
			whereKey: 'mobile',
			whereValue: mobile,
		}),
	])
		.then((res) => {
			const mapRes = res[0]
			if (mapRes.data.data && mapRes.data.data.length) {
				goodsMap.value = mapRes.data.data[0].goodsMap
			}
			const configRes = res[1]
			if (configRes.data.data && configRes.data.data.length) {
				const data = configRes.data.data[0]
				config.value.detail = data.detail
				config.value.global = data.global
				config.value.id = data.id
			}
			const fxRes = res[2]
			if (fxRes.data.data && fxRes.data.data.length) {
				fxTable.value.data = fxRes.data.data[0].goods
				fxTable.value.rawData = JSON.parse(JSON.stringify(fxTable.value.data))
				const optionsMap = new Map()
				fxTable.value.rawData.forEach((goods) => {
					const hasOption = optionsMap.get(goods.name)
					if (hasOption) {
						if (goods.feature) {
							hasOption.children.push({
								value: goods.feature,
								label: goods.feature,
							})
						}
					} else {
						optionsMap.set(goods.name, {
							value: goods.name,
							label: goods.name,
							children: goods.feature
								? [
										{
											value: goods.feature,
											label: goods.feature,
										},
								  ]
								: [],
						})
					}
				})
				select.value.options = Array.from(optionsMap).map((item) => {
					return item[1]
				})
			}
		})
		.finally(() => {
			if (activeTab.value === '1') {
				const hasCache = Cache.get('StallGoodsInfo', mobile)
				if (hasCache) {
					table.value.data = hasCache
				}
			}
		})
}
watch(
	table,
	() => {
		if (isCache.value && config.value.user.mobile) {
			Cache.set('StallGoodsInfo', config.value.user.mobile, table.value.data)
		}
	},
	{ deep: true }
)
function clean(type?: 1 | 2) {
	activeTab.value = '1'
	const t = type && type === 2 ? text1.value : text.value
	const fixText = insertNewline(t)
	const rowArray = fixText.split('\n')
	if (!rowArray.length) {
		return false
	}
	const prices: number[] = []
	rowArray.forEach((row) => {
		if (isNumber(row)) {
			prices.push(Number(row))
		}
	})
	if (prices.length === 1) {
		const item = {
			key: v4(),
			name: '',
			feature: '',
			featureModel: [],
			price: prices[0],
			index: 1,
		}
		rowArray.forEach((row, i) => {
			if (i === 0) {
				item.name = row
			}
			if (row.includes('：')) {
				item.feature = getStringAfter(row, /：/)
			}
		})
		table.value.data.push(item)
	} else if (prices.length > 1) {
		const names: string[] = []
		rowArray.forEach((row) => {
			if (row !== '单价' && !isNumber(row)) {
				names.push(row)
			}
		})
		if (names.length === prices.length) {
			names.forEach((name, i) => {
				const item = {
					key: v4(),
					name,
					price: prices[i],
					feature: '',
					featureModel: [],
					index: i + 1,
				}
				table.value.data.push(item)
			})
		}
	}
	if (type !== 2) {
		text1.value = text.value
		text.value = ''
	}
}
function remove(i: number) {
	table.value.data.splice(i, 1)
}
function login() {
	if (config.value.user.mobile) {
		Cache.set('Login', 'mobile', config.value.user.mobile)
		init()
		message.success('登录成功')
	} else {
		message.error('请输入手机号！')
	}
}
function save() {
	if (!config.value.user.mobile) {
		message.error('请先登录！')
		return false
	}
	if (fxTable.value.data.length) {
		UniCloudSet({
			_tableName: 'stall-analysis',
			date,
			goods: fxTable.value.data,
			mobile: config.value.user.mobile,
		}).then((res) => {
			console.log(res)
			message.success('保存成功')
		})
	} else {
		message.error('请先分析再保存!')
	}
}
function cleanCache() {
	Cache.remove('StallGoodsInfo')
	Cache.remove('Login')
}
function analysis() {
	activeTab.value = '2'
	if (table.value.data.length) {
		const goodsMap = new Map()
		table.value.data.forEach((item) => {
			item.feature = item.featureModel.join('_')
			// 商品名称+特征生成唯一id
			const key = item.feature ? `${item.name}_${item.feature}` : item.name
			item._id = key
			const has = goodsMap.get(key)
			if (has) {
				has.num += 1
				has.avgPrice = Number(((has.avgPrice + item.price) / 2).toFixed(0))
				has.detail.push(item)
			} else {
				goodsMap.set(key, {
					_id: key,
					key: v4(),
					name: item.name,
					feature: item.feature,
					avgPrice: item.price,
					num: 1,
					detail: [item],
				})
			}
		})
		const optionsMap = new Map()
		const singConfigData: any[] = []
		fxTable.value.data = Array.from(goodsMap)
			.map((item) => {
				const singConfig = config.value.detail[item[1]._id]
				const goods = {
					...item[1],
					discount: config.value.global.discount,
					qwProfit: singConfig
						? singConfig.qwProfit
						: config.value.global.qwProfit,
					zdf: 0,
				}
				const hasOption = optionsMap.get(goods.name)
				if (hasOption) {
					if (goods.feature) {
						hasOption.children.push({
							value: goods.feature,
							label: goods.feature,
						})
					}
				} else {
					optionsMap.set(goods.name, {
						value: goods.name,
						label: goods.name,
						children: goods.feature
							? [
									{
										value: goods.feature,
										label: goods.feature,
									},
							  ]
							: [],
					})
				}
				goods.ygStallPrice = Number(
					(goods.avgPrice * (1 - goods.discount)).toFixed(0)
				)
				if (goods.ygStallPrice > 100000) {
					goods.ygStallPrice = Math.round(goods.ygStallPrice / 10000) * 10000
				} else if (goods.ygStallPrice > 10000) {
					goods.ygStallPrice = Math.round(goods.ygStallPrice / 1000) * 1000
				}
				goods.ygStockPrice = Number(
					(goods.ygStallPrice / (1 + goods.qwProfit)).toFixed(0)
				)
				if (goods.ygStockPrice > 100000) {
					goods.ygStockPrice = Math.round(goods.ygStockPrice / 10000) * 10000
				} else if (goods.ygStockPrice > 10000) {
					goods.ygStockPrice = Math.round(goods.ygStockPrice / 1000) * 1000
				}
				const itemConfig = {
					_id: goods._id,
					name: goods.name,
					feature: goods.feature,
					qwProfit: goods.qwProfit,
				}
				singConfigData.push(itemConfig)
				config.value.detail[goods._id] = itemConfig
				return goods
			})
			.sort((a, b) => {
				return a._id.localeCompare(b._id, 'zh-Hans-CN', {
					sensitivity: 'accent',
				})
			})
		setModal.value.table.data = singConfigData.sort((a, b) => {
			return a._id.localeCompare(b._id, 'zh-Hans-CN', {
				sensitivity: 'accent',
			})
		})
		fxTable.value.rawData = JSON.parse(JSON.stringify(fxTable.value.data))
		select.value.options = Array.from(optionsMap).map((item) => {
			return item[1]
		})
	} else {
		message.error('请先录入统计数据后才能分析！')
	}
}
function lookDetail(row: any) {
	detailModal.value.visible = true
	detailModal.value.table.data = row.detail
}
function setConfig() {
	setModal.value.visible = true
}
function autoPaste() {
	navigator.clipboard
		.readText()
		.then((t) => {
			if (t) {
				text.value = t
				clean()
			}
		})
		.catch((error) => {
			console.error('无法粘贴文本：', error)
		})
}
function selectChange() {
	if (select.value.value) {
		const key = select.value.value.join('_')
		fxTable.value.data = fxTable.value.rawData.filter((item) => {
			return item._id === key
		})
	} else {
		fxTable.value.data = fxTable.value.rawData
	}
}
function upSet() {
	setModal.value.visible = false
	if (table.value.data.length) {
		analysis()
	}
	if (isLogin.value) {
		UniCloudSet({
			_tableName: 'stall-config',
			...config.value,
			mobile: config.value.user.mobile,
		}).then(() => {
			message.success('设置成功！')
		})
	} else {
		message.warning('登录后才能保存设置到服务器！')
	}
}
</script>
<style lang="scss" scoped>
:deep(.ant-tabs-content) {
	height: 100%;
}
</style>
