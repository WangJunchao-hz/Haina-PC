<template>
	<a-card title="功能区" size="small">
		<a-space wrap>
			<a-input-search
				style="width: 188px"
				v-model:value="config.user.mobile"
				:disabled="isLogin"
				placeholder="手机号作为唯一标识，设置后不可修改"
				@search="login"
			>
				<template #enterButton>
					<a-button :disabled="isLogin">登录</a-button>
				</template>
			</a-input-search>
			<a-button type="primary" @click="cleanCache('loginOut')">注销</a-button>
			<a-switch
				v-model:checked="isCache"
				checked-children="开启缓存"
				un-checked-children="关闭缓存"
			/>
			<a-button type="primary" @click="cleanCache">清除缓存</a-button>
			<a-button type="primary" @click="save">保存</a-button>
			<a-button type="primary" @click="setModal.visible = true">
				设置
			</a-button>
			<a-cascader
				style="width: 188px"
				v-model:value="select.value"
				:options="select.options"
				:show-search="{ filter: select.filter }"
				placeholder="快速筛选"
				expandTrigger="hover"
				@change="selectChange"
			/>
			<a-upload
				accept=".ini"
				:showUploadList="false"
				:customRequest="fileChange"
			>
				<a-button>
					<upload-outlined></upload-outlined>
					生成配置
				</a-button>
			</a-upload>
			<a-button @click="hanHua">
				<FormOutlined></FormOutlined>
				生成喊话
			</a-button>
		</a-space>
	</a-card>
	<a-card title="类型筛选" size="small">
		<a-checkbox-group
			v-model:value="typeChecked"
			:options="goodsType"
			@change="typeFilter"
		/>
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
				:scroll="{ y: 'calc(100% - 54px)' }"
				:pagination="false"
			>
				<template #bodyCell="{ column, record, index }">
					<template v-if="column.dataIndex === 'operate'">
						<a-space>
							<a-popconfirm
								title="确认删除？"
								ok-text="是"
								cancel-text="否"
								@confirm="goodsTable.remove(index)"
							>
								<a-button
									type="primary"
									size="small"
									danger
									:icon="h(DeleteOutlined)"
								>
								</a-button>
							</a-popconfirm>
							<!-- <a-button
								type="primary"
								size="small"
								:icon="h(FormOutlined)"
								@click="goodsTable.remove(index)"
							>
							</a-button> -->
						</a-space>
					</template>
					<template v-else>
						<span
							style="color: #f56c6c; font-weight: bold"
							v-if="column.dataIndex === 'ygStallPrice'"
							>{{ record[column.dataIndex] }}</span
						>
						<span
							style="color: #67c23a; font-weight: bold"
							v-else-if="column.dataIndex === 'ygStockPrice'"
							>{{ record[column.dataIndex] }}</span
						>
						<a-input-number
							style="width: 100%"
							v-else-if="column.dataIndex === 'discount'"
							v-model:value="record[column.dataIndex]"
							:min="0"
							:max="1"
							:step="0.01"
							:placeholder="config.global.discount + ''"
							@change="singleJS(record)"
						>
						</a-input-number>
						<a-input-number
							style="width: 100%"
							v-else-if="column.dataIndex === 'qwProfit'"
							v-model:value="record[column.dataIndex]"
							:min="0"
							:max="1"
							:step="0.01"
							:placeholder="config.global.qwProfit + ''"
							@change="singleJS(record)"
						>
						</a-input-number>
						<a-input
							v-else-if="column.dataIndex === 'marketPrice'"
							style="width: 100%"
							@change="singleJS(record)"
							v-model:value="record[column.dataIndex]"
						/>
						<a-switch
							v-else-if="column.dataIndex === 'isSet'"
							v-model:checked="record[column.dataIndex]"
							checked-children="是"
							un-checked-children="否"
						/>
						<a-input
							v-else-if="
								column.dataIndex === 'collect' || column.dataIndex === 'sell'
							"
							style="width: 100%"
							placeholder=""
							v-model:value="record[column.dataIndex]"
						/>
						<span
							v-else-if="column.dataIndex === 'name'"
							style="color: #303133"
							>{{ record[column.dataIndex] }}</span
						>
						<span
							v-else-if="column.dataIndex === 'feature'"
							style="color: #409eff"
							>{{ record[column.dataIndex] }}</span
						>
						<span v-else style="color: #909399">{{
							record[column.dataIndex]
						}}</span>
					</template>
				</template>
			</a-table>
		</a-tab-pane>
	</a-tabs>
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
	</a-modal>
</template>
<script setup lang="ts">
import { ref, watch, h } from 'vue'
import {
	DeleteOutlined,
	UploadOutlined,
	FormOutlined,
} from '@ant-design/icons-vue'
import { v4 } from 'uuid'
import { UniCloudSet, UniCloudGet } from '@/common/api/uni-cloud-api'
import {
	Cache,
	parseINI,
	stringifyINI,
	generateINIFile,
	getInventoryData,
	updateINIFile,
} from '@/common/utils'
import { message } from 'ant-design-vue'
import 'ant-design-vue/es/message/style/css'
import type { CascaderProps } from 'ant-design-vue'
import type { ShowSearchType } from 'ant-design-vue/es/cascader'
import dayjs from 'dayjs'
const date = dayjs().format('YYYY-MM-DD')
const activeTab = ref<string>('待分配')
const isCache = ref<boolean>(true)
const isLogin = ref<boolean>(false)
const config = ref<{
	user: { mobile: string | number }
	global: { discount: number; qwProfit: number }
	id?: string
	districtModel: string
	districts: { label: string; value: string }[]
	defaultDistrict: string
	addDistrict: () => void
	deleteDistrict: (i: number) => void
}>({
	user: { mobile: '' },
	global: {
		discount: 0.01, // 默认让利1%
		qwProfit: 0.3, // 期望利润率20%
	},
	id: v4(),
	districtModel: '',
	defaultDistrict: '待分配',
	districts: [
		{
			label: '待分配',
			value: '待分配',
		},
	], // 所属区列表
	addDistrict: () => {
		if (config.value.districtModel) {
			config.value.districts.push({
				label: config.value.districtModel,
				value: config.value.districtModel,
			})
		}
	},
	deleteDistrict: (i: number) => {
		const dfp = goodsTable.value.rawData.map((item) => {
			return {
				...item,
				district: '待分配',
			}
		})
		let hasCache = Cache.get('StallGoodsInfo', config.value.user.mobile)
		if (hasCache) {
			const oldDfp = hasCache['待分配']
			if (oldDfp) {
				oldDfp.push(...dfp)
				hasCache['待分配'] = oldDfp
			} else {
				hasCache['待分配'] = dfp
			}
		} else {
			hasCache = {}
			hasCache['待分配'] = dfp
		}
		const del = config.value.districts.splice(i, 1)
		delete hasCache[del[0].value]
		Cache.set('StallGoodsInfo', config.value.user.mobile, hasCache)
		activeTab.value = '待分配'
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
const select = ref<{
	value: string[]
	options: CascaderProps['options']
	rawOptions: CascaderProps['options']
	filter: ShowSearchType['filter']
}>({
	value: [],
	options: [],
	rawOptions: [],
	filter: (inputValue, path) => {
		return path.some(
			(option) =>
				option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
		)
	},
})
const typeChecked = ref<any[]>([])
const goodsType = ref<any[]>([])
const goodsTable = ref<{
	columns: any[]
	data: any[]
	rawData: any[]
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
			sorter: (a: any, b: any) => b.ygStallPrice - a.ygStallPrice,
			width: 118,
			align: 'center',
		},
		{
			title: '期望利润 ',
			dataIndex: 'qwProfit',
			width: 88,
		},
		{
			title: '预估收货价',
			dataIndex: 'ygStockPrice',
			sorter: (a: any, b: any) => b.ygStockPrice - a.ygStockPrice,
			width: 118,
			align: 'center',
		},
		{
			title: '收统计',
			dataIndex: 'collect',
			sorter: (a: any, b: any) => b.collect - a.collect,
			width: 98,
		},
		{
			title: '卖统计',
			dataIndex: 'sell',
			sorter: (a: any, b: any) => b.sell - a.sell,
			width: 98,
		},
		{
			title: '配置',
			dataIndex: 'isSet',
			width: 68,
			align: 'center',
		},
		{
			title: '操作',
			dataIndex: 'operate',
			width: 68,
			align: 'center',
		},
	],
	data: [],
	rawData: [],
	remove: (i: number) => {
		goodsTable.value.data.splice(i, 1)
	},
})
watch(
	() => goodsTable.value.rawData,
	() => {
		if (isCache.value && config.value.user.mobile) {
			let hasExist = Cache.get('StallGoodsInfo', config.value.user.mobile)
			if (!hasExist) {
				hasExist = {}
			}
			hasExist[activeTab.value] = goodsTable.value.rawData
			Cache.set('StallGoodsInfo', config.value.user.mobile, hasExist)
			if (typeChecked.value.length) {
				select.value.options = select.value.rawOptions!.filter((so) =>
					typeChecked.value.includes(so.type)
				)
			}
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
	]).then((res) => {
		const configRes = res[0]
		if (configRes.data.data && configRes.data.data.length) {
			config.value = {
				...config.value,
				...configRes.data.data[0],
			}
			activeTab.value = config.value.defaultDistrict
		}
		const mapRes = res[1]
		if (mapRes.data.data && mapRes.data.data.length) {
			const goodsMap = mapRes.data.data[0].goodsMap
			getInventoryData(goodsMap, m, activeTab.value).then((result) => {
				goodsTable.value.data = result.data
				goodsTable.value.rawData = goodsTable.value.data
				goodsType.value = result.types
				select.value.options = result.goodsOptions
				select.value.rawOptions = select.value.options
			})
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
			user: config.value.user,
			mobile: config.value.user.mobile,
			whereKey: 'mobile',
			whereValue: config.value.user.mobile,
		}).then(() => {
			goodsTable.value.rawData.forEach((item) => {
				singleJS(item)
			})
			message.success('设置成功！')
		})
	} else {
		message.warning('登录后才能保存设置到服务器！')
	}
}
function singleJS(item: any) {
	const discount = item.discount ? item.discount : config.value.global.discount
	const qwProfit = item.qwProfit ? item.qwProfit : config.value.global.qwProfit
	item.ygStallPrice = Number((item.marketPrice * (1 - discount)).toFixed(0))
	if (item.ygStallPrice > 100000) {
		item.ygStallPrice = Math.floor(item.ygStallPrice / 10000) * 10000
	} else if (item.ygStallPrice > 10000) {
		item.ygStallPrice = Math.floor(item.ygStallPrice / 1000) * 1000
	}
	item.ygStockPrice = Number((item.ygStallPrice / (1 + qwProfit)).toFixed(0))
	if (item.ygStockPrice > 100000) {
		item.ygStockPrice = Math.floor(item.ygStockPrice / 10000) * 10000
	} else if (item.ygStockPrice > 10000) {
		item.ygStockPrice = Math.floor(item.ygStockPrice / 1000) * 1000
	}
}
function cleanCache(type?: string) {
	if (type === 'loginOut') {
		Cache.remove('Login')
	} else {
		Cache.remove('StallGoodsInfo', config.value.user.mobile, activeTab.value)
	}
}
function selectChange() {
	if (select.value.value) {
		const key = select.value.value.join('_')
		goodsTable.value.data = goodsTable.value.rawData.filter((item) => {
			const { name, feature } = item
			let _id = name
			if (feature) {
				_id += '_' + feature
			}
			return _id === key
		})
	} else {
		goodsTable.value.data = goodsTable.value.rawData
	}
}
function typeFilter(checked: any[]) {
	if (checked.length) {
		goodsTable.value.data = goodsTable.value.rawData.filter((item: any) =>
			checked.includes(item.type)
		)
		select.value.options = select.value.rawOptions!.filter((so) =>
			checked.includes(so.type)
		)
	} else {
		goodsTable.value.data = goodsTable.value.rawData
		select.value.options = select.value.rawOptions
	}
}
function save() {
	if (!config.value.user.mobile) {
		message.error('请先登录！')
		return false
	}
	if (goodsTable.value.rawData.length) {
		UniCloudSet({
			_tableName: 'stall-analysis',
			date,
			goods: goodsTable.value.rawData,
			mobile: config.value.user.mobile,
			district: activeTab.value,
			id: config.value.user.mobile + '_' + activeTab.value,
		}).then(() => {
			message.success('保存成功')
		})
	}
}
function fileChange(res: any) {
	const reader = new FileReader()
	reader.onload = function (event: any) {
		const fileContent = event.target.result
		const config = parseINI(fileContent)
		updateINIFile(config['qiyunlou'], goodsTable.value.rawData)
		const modifiedContent = stringifyINI(config)
		generateINIFile(modifiedContent, 'test.ini')
	}
	reader.onerror = function (event) {
		message.error('读取配置失败!')
		console.log(event)
	}
	// 读取文件内容
	reader.readAsText(res.file, 'GBK')
}
function hanHua() {
	generateINIFile('喊话喊话', '喊话test.txt')
}
</script>
<style scoped lang="scss">
.table {
	:deep(td) {
		padding: 8px;
	}
	:deep(
			.ant-table-tbody > tr.ant-table-row:hover > td,
			.ant-table-tbody > tr > td.ant-table-cell-row-hover
		) {
		background: #e4e7ed;
		cursor: pointer;
	}
}
.tab {
	height: calc(100% - 212px);
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
