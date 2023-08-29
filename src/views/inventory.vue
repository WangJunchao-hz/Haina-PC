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
					:rows="6"
				/>
				<a-textarea
					v-model:value="text1"
					placeholder="商品数据，可手动修正"
					:rows="6"
				/>
			</div>
		</a-col>
		<a-col :span="12">
			<div style="display: flex; align-items: self-start; padding-left: 18px">
				<a-space direction="vertical">
					<a-button type="primary" @click="addGoodsModal.visible = true">
						新增
					</a-button>
					<a-button type="primary" @click="clean(2)">清洗</a-button>
					<a-button type="primary" @click="save">保存</a-button>
					<a-button type="primary" @click="setModal.visible = true">
						设置
					</a-button>
				</a-space>
				<a-space style="padding-left: 18px" wrap>
					<a-input-search
						style="width: 188px"
						v-model:value="config.user.mobile"
						:disabled="isLogin"
						placeholder="手机号作为唯一标识，设置后不可修改"
					>
						<template #enterButton>
							<a-button @click="login" :disabled="isLogin">登录</a-button>
						</template>
					</a-input-search>
					<a-switch
						v-model:checked="isCache"
						checked-children="开启缓存"
						un-checked-children="关闭缓存"
					/>
					<a-button type="primary" @click="cleanCache">清除缓存</a-button>
				</a-space>
			</div>
		</a-col>
	</a-row>
	<a-card title="快速筛选" size="small">
		<a-checkbox-group :options="config.goodsType" />
	</a-card>
	<a-tabs v-model:activeKey="activeTab" class="tab">
		<a-tab-pane
			v-for="d in config.districts"
			:key="d.value"
			:tab="d.label"
			style="height: 100%"
		>
			<a-table
				class="table"
				:columns="goodsTable.columns"
				:data-source="goodsTable.data"
				:scroll="{ y: 'calc(100% - 55px)' }"
				:pagination="false"
			>
				<template #bodyCell="{ column, record, index }">
					<template v-if="column.dataIndex === 'operate'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								danger
								@click="goodsTable.remove(index)"
							>
								删除
							</a-button>
						</a-space>
					</template>
					<template v-else>
						<a-select
							v-if="column.dataIndex === 'type'"
							style="width: 100%"
							v-model:value="record[column.dataIndex]"
							:options="config.goodsType"
							placeholder="请选择商品类型"
						></a-select>
						<a-select
							style="width: 100%"
							placeholder="选择或输入特征"
							v-else-if="column.dataIndex === 'feature'"
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
						<span
							style="color: red; font-weight: bold"
							v-else-if="
								column.dataIndex === 'ygStallPrice' ||
								column.dataIndex === 'ygStockPrice'
							"
							>{{ record[column.dataIndex] }}</span
						>
						<a-input-number
							style="width: 100%"
							v-else-if="
								column.dataIndex === 'discount' ||
								column.dataIndex === 'qwProfit'
							"
							v-model:value="record[column.dataIndex]"
							:min="0"
							:max="1"
							:step="0.01"
						>
						</a-input-number>
						<a-input
							v-else
							style="width: 100%"
							v-model:value="record[column.dataIndex]"
						/>
					</template>
				</template>
			</a-table>
		</a-tab-pane>
	</a-tabs>
	<a-modal
		v-model:visible="addGoodsModal.visible"
		title="新增商品"
		@ok="addGoodsModal.add"
		:width="388"
	>
		<a-form
			style="padding-top: 18px"
			:model="addForm"
			:label-col="{ style: { width: '98px' } }"
			:wrapper-col="{ span: 14 }"
		>
			<a-form-item label="名称">
				<a-input v-model:value="addForm.name" />
			</a-form-item>
			<a-form-item label="特征">
				<a-select
					style="width: 100%"
					placeholder="选择或输入特征"
					v-model:value="addForm.featureModel"
					mode="tags"
					:token-separators="[',']"
					:options="
						(goodsMap &&
							goodsMap[addForm.name] &&
							goodsMap[addForm.name].options) ||
						[]
					"
					:filter-option="(input: string, option: any) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}"
					show-search
				/>
			</a-form-item>
			<a-form-item label="类型">
				<a-select
					ref="select"
					v-model:value="addForm.type"
					:options="config.goodsType"
					placeholder="请选择商品类型"
				></a-select>
			</a-form-item>
			<a-form-item label="所在区">
				<a-select
					ref="select"
					v-model:value="addForm.district"
					:options="config.districts"
					placeholder="请选择所在区"
				></a-select>
			</a-form-item>
			<a-form-item label="市场价">
				<a-input v-model:value="addForm.marketPrice" />
			</a-form-item>
		</a-form>
	</a-modal>
	<a-modal
		v-model:visible="setModal.visible"
		title="参数设置"
		@ok="upSet"
		:width="888"
	>
		<a-card title="全局参数" size="small">
			<a-space>
				<a-input-number
					v-model:value="config.global.discount"
					:min="0"
					:max="1"
					:step="0.01"
					size="small"
				>
					<template #addonBefore> 让利 </template>
				</a-input-number>
				<a-input-number
					v-model:value="config.global.qwProfit"
					:min="0"
					:max="1"
					:step="0.01"
					size="small"
				>
					<template #addonBefore> 期望收益 </template>
				</a-input-number>
			</a-space>
		</a-card>
		<a-card title="所属区管理" size="small">
			<a-space wrap>
				<a-input-search
					v-model:value="config.districtModel"
					placeholder="请输入服务器名"
					size="small"
					allowClear
					@search="config.addDistrict"
				>
					<template #enterButton>
						<a-button type="primary">新增</a-button>
					</template>
				</a-input-search>
				<a-radio-group size="small" v-model:value="config.defaultDistrict">
					<a-radio-button v-for="(d, i) in config.districts" :value="d.value">
						{{ d.label }}
						<a-popconfirm
							title="所属区下的数据会被放到待分配区，请谨慎操作！是否确认删除？"
							ok-text="是"
							cancel-text="否"
							@confirm="config.deleteDistrict(i)"
							v-if="d.value !== '待分配'"
						>
							<a-button
								type="primary"
								size="small"
								danger
								:icon="h(DeleteOutlined)"
							/>
						</a-popconfirm>
					</a-radio-button>
				</a-radio-group>
			</a-space>
		</a-card>
		<a-card title="商品类型管理" size="small">
			<a-space wrap>
				<a-input-search
					v-model:value="config.goodsTypeModel"
					placeholder="请输入商品类型"
					size="small"
					allowClear
					@search="config.addGoodsType"
				>
					<template #enterButton>
						<a-button type="primary">新增</a-button>
					</template>
				</a-input-search>
				<div v-for="(t, i) in config.goodsType">
					{{ t.label }}
					<a-button
						type="primary"
						size="small"
						danger
						:icon="h(DeleteOutlined)"
						@click="config.deleteGoodsType(i)"
					/>
				</div>
			</a-space>
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
</template>
<script setup lang="ts">
import { ref, watch, h } from 'vue'
import { DeleteOutlined } from '@ant-design/icons-vue'
import { v4 } from 'uuid'
import { UniCloudSet, UniCloudGet } from '@/common/api/uni-cloud-api'
import { isNumber, getStringAfter, insertNewline, Cache } from '@/common/utils'
import { message } from 'ant-design-vue'
import 'ant-design-vue/es/message/style/css'
import dayjs from 'dayjs'
const date = dayjs().format('YYYY-MM-DD')
const text = ref<string>('')
const text1 = ref<string>('')
const activeTab = ref<string>('待分配')
const isCache = ref<boolean>(true)
const isLogin = ref<boolean>(false)
const config = ref<{
	user: { mobile: string | number }
	global: { discount: number; qwProfit: number }
	detail: { [name: string]: any }
	id?: string
	districtModel: string
	goodsTypeModel: string
	districts: { label: string; value: string }[]
	goodsType: { label: string; value: string }[]
	defaultDistrict: string
	addDistrict: () => void
	addGoodsType: () => void
	deleteDistrict: (i: number) => void
	deleteGoodsType: (i: number) => void
}>({
	user: { mobile: '' },
	global: {
		discount: 0.01, // 默认让利1%
		qwProfit: 0.3, // 期望利润率20%
	},
	detail: {}, // 单个商品详细配置
	id: v4(),
	districtModel: '',
	goodsTypeModel: '',
	defaultDistrict: '待分配',
	districts: [
		{
			label: '待分配',
			value: '待分配',
		},
	], // 所属区列表
	goodsType: [],
	addDistrict: () => {
		if (config.value.districtModel) {
			config.value.districts.push({
				label: config.value.districtModel,
				value: config.value.districtModel,
			})
		}
	},
	addGoodsType: () => {
		if (config.value.goodsTypeModel) {
			config.value.goodsType.push({
				label: config.value.goodsTypeModel,
				value: config.value.goodsTypeModel,
			})
		}
	},
	deleteDistrict: (i: number) => {
		config.value.districts.splice(i, 1)
	},
	deleteGoodsType: (i: number) => {
		config.value.goodsType.splice(i, 1)
	},
})
const goodsMap = ref<any>()
const addGoodsModal = ref<{
	visible: boolean
	add: () => void
}>({
	visible: false,
	add: () => {},
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
const goodsTable = ref<{
	columns: any[]
	data: any[]
	remove: (i: number) => void
}>({
	columns: [
		{
			title: '类型',
			dataIndex: 'type',
		},
		{
			title: '名称',
			dataIndex: 'name',
		},
		{
			title: '属/技/等',
			dataIndex: 'feature',
			width: 288,
		},
		{
			title: '市场价',
			dataIndex: 'marketPrice',
			sorter: (a: any, b: any) => b.marketPrice - a.marketPrice,
		},
		{
			title: '让利',
			dataIndex: 'discount',
			width: 88,
		},
		{
			title: '预估摆摊价',
			dataIndex: 'ygStallPrice',
		},
		{
			title: '期望利润 ',
			dataIndex: 'qwProfit',
			width: 88,
		},
		{
			title: '预估收货价',
			dataIndex: 'ygStockPrice',
		},
		{
			title: '操作',
			dataIndex: 'operate',
			width: 88,
		},
	],
	data: [],
	remove: (i: number) => {
		goodsTable.value.data.splice(i, 1)
	},
})
const addForm = ref<{
	name: string
	featureModel: string[]
	feature: string
	type: string
	district: string
	marketPrice: number | string
}>({
	name: '',
	feature: '',
	featureModel: [],
	type: '',
	district: activeTab.value,
	marketPrice: '',
})
watch(
	goodsTable,
	() => {
		if (isCache.value && config.value.user.mobile) {
			const obj: any = {}
			obj[activeTab.value] = goodsTable.value.data
			Cache.set('StallGoodsInfo', config.value.user.mobile, obj)
		}
	},
	{ deep: true }
)
init()
function init() {
	const m = Cache.get('Login', 'mobile')
	if (!m) {
		return false
	} else {
		config.value.user.mobile = m
		isLogin.value = true
	}
	Promise.all([
		UniCloudGet({
			_tableName: 'stall-config',
			whereKey: 'mobile',
			whereValue: m,
		}),
		UniCloudGet({
			_tableName: 'goods-map',
			whereKey: 'mobile',
			whereValue: m,
		}),
	])
		.then((res) => {
			const configRes = res[0]
			if (configRes.data.data && configRes.data.data.length) {
				config.value = {
					...config.value,
					...configRes.data.data[0],
				}
				activeTab.value = config.value.defaultDistrict
				addForm.value.district = activeTab.value
			}
			const mapRes = res[1]
			if (mapRes.data.data && mapRes.data.data.length) {
				goodsMap.value = mapRes.data.data[0].goodsMap
			}
		})
		.finally(() => {
			const hasCache = Cache.get('StallGoodsInfo', m)
			if (hasCache) {
				goodsTable.value.data = hasCache[activeTab.value]
			}
		})
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
function upSet() {
	setModal.value.visible = false
	if (isLogin.value) {
		UniCloudSet({
			_tableName: 'stall-config',
			defaultDistrict: config.value.defaultDistrict,
			districts: config.value.districts,
			global: config.value.global,
			goodsType: config.value.goodsType,
			user: config.value.user,
			detail: config.value.detail,
			mobile: config.value.user.mobile,
			whereKey: 'mobile',
			whereValue: config.value.user.mobile,
		}).then(() => {
			message.success('设置成功！')
		})
	} else {
		message.warning('登录后才能保存设置到服务器！')
	}
}
function clean(type?: 1 | 2) {
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
		const item: any = {
			key: v4(),
			name: '',
			feature: '',
			featureModel: [],
			type: '',
			districts: activeTab.value,
			marketPrice: prices[0],
			zdf: '',
			discount: config.value.global.discount,
			ygStallPrice: '',
			qwProfit: config.value.global.qwProfit,
			ygStockPrice: '',
		}
		item.ygStallPrice = Number(
			(item.marketPrice * (1 - item.discount)).toFixed(0)
		)
		if (item.ygStallPrice > 100000) {
			item.ygStallPrice = Math.floor(item.ygStallPrice / 10000) * 10000
		} else if (item.ygStallPrice > 10000) {
			item.ygStallPrice = Math.floor(item.ygStallPrice / 1000) * 1000
		}
		item.ygStockPrice = Number(
			(item.ygStallPrice / (1 + item.qwProfit)).toFixed(0)
		)
		if (item.ygStockPrice > 100000) {
			item.ygStockPrice = Math.floor(item.ygStockPrice / 10000) * 10000
		} else if (item.ygStockPrice > 10000) {
			item.ygStockPrice = Math.floor(item.ygStockPrice / 1000) * 1000
		}
		rowArray.forEach((row, i) => {
			if (i === 0) {
				item.name = row
			}
			if (row.includes('：')) {
				item.feature = getStringAfter(row, /：/)
				item.featureModel.push(item.feature)
			}
		})
		goodsTable.value.data.push(item)
	} else if (prices.length > 1) {
		const names: string[] = []
		rowArray.forEach((row) => {
			if (row !== '单价' && !isNumber(row)) {
				names.push(row)
			}
		})
		if (names.length === prices.length) {
			names.forEach((name, i) => {
				const item: any = {
					key: v4(),
					name,
					feature: '',
					featureModel: [],
					type: '',
					districts: activeTab.value,
					marketPrice: prices[i],
					zdf: '',
					discount: config.value.global.discount,
					ygStallPrice: '',
					qwProfit: config.value.global.qwProfit,
					ygStockPrice: '',
				}
				item.ygStallPrice = Number(
					(item.marketPrice * (1 - item.discount)).toFixed(0)
				)
				if (item.ygStallPrice > 100000) {
					item.ygStallPrice = Math.floor(item.ygStallPrice / 10000) * 10000
				} else if (item.ygStallPrice > 10000) {
					item.ygStallPrice = Math.floor(item.ygStallPrice / 1000) * 1000
				}
				item.ygStockPrice = Number(
					(item.ygStallPrice / (1 + item.qwProfit)).toFixed(0)
				)
				if (item.ygStockPrice > 100000) {
					item.ygStockPrice = Math.floor(item.ygStockPrice / 10000) * 10000
				} else if (item.ygStockPrice > 10000) {
					item.ygStockPrice = Math.floor(item.ygStockPrice / 1000) * 1000
				}
				goodsTable.value.data.push(item)
			})
		}
	}
	if (type !== 2) {
		text1.value = text.value
		text.value = ''
	}
}
function cleanCache() {
	Cache.remove('StallGoodsInfo')
	Cache.remove('Login')
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
function save() {
	if (!config.value.user.mobile) {
		message.error('请先登录！')
		return false
	}
	if (goodsTable.value.data.length) {
		UniCloudSet({
			_tableName: 'stall-analysis',
			date,
			goods: goodsTable.value.data,
			mobile: config.value.user.mobile,
		}).then((res) => {
			console.log(res)
			message.success('保存成功')
		})
	} else {
		message.error('请先分析再保存!')
	}
}
</script>
<style scoped lang="scss">
.table {
	:deep(td) {
		padding: 8px;
	}
}
.tab {
	height: calc(100% - 222px);
	:deep(.ant-tabs-content) {
		height: 100%;
	}
}
:deep(.ant-btn-icon-only.ant-btn-sm) {
	width: 18px;
	height: 18px;
	vertical-align: -2px;
}
</style>
