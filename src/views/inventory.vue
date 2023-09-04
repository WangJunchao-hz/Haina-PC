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
			<!-- <a-switch
				v-model:checked="isCache"
				checked-children="开启缓存"
				un-checked-children="关闭缓存"
			/>
			<a-button type="primary" @click="cleanCache">清除缓存</a-button> -->
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
				:customRequest="
					($event:any) => {
						fileChange($event, 'import')
					}
				"
			>
				<a-button>
					<upload-outlined></upload-outlined>
					导入配置
				</a-button>
			</a-upload>
			<a-upload
				accept=".ini"
				:showUploadList="false"
				:customRequest="
					($event:any) => {
						fileChange($event, 'export')
					}
				"
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
			<a-button @click="hhModal.visible = true"> 喊话记录 </a-button>
			<el-button @click="openGj">估价</el-button>
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
				<a-input-number
					v-model:value="config.global.mhbrate"
					:min="0"
					:max="1"
					:step="0.0001"
					size="small"
				>
					<template #addonBefore>梦幻币汇率</template>
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
		<a-card title="喊话模板" size="small">
			<a-space v-for="(tpl, i) in config.hanhuaTpl">
				<a-textarea
					style="width: 688px"
					v-model:value="tpl.value"
					placeholder="n=名称，f=特征，t=类型，range=价格范围，min=最小值，max=最大值；自由组合，如：$t_n_f{普通兽决_魔兽要诀_夜战}表示取夜战的收货价"
					:rows="4"
				/>
				<a-button type="primary" @click="config.addTpl">新增</a-button>
				<a-button type="primary" danger @click="config.deleteTpl(i)"
					>删除</a-button
				>
			</a-space>
		</a-card>
	</a-modal>
	<a-modal
		v-model:visible="hhModal.visible"
		title="喊话生成记录"
		:width="888"
		@ok="hhModal.visible = false"
	>
		<a-list
			class="list"
			size="small"
			bordered
			:data-source="hhModal.hhRecord"
			item-layout="horizontal"
		>
			<template #renderItem="{ item, index }">
				<a-list-item>
					<div @click="copyTxt(item)">（{{ index + 1 }}）{{ item }}</div>
					<template #actions>
						<a-button type="primary" size="small" @click="copyTxt(item)">
							复制
						</a-button>
						<a-button
							type="primary"
							size="small"
							danger
							@click="hhModal.remove(index)"
							>删除</a-button
						>
					</template>
				</a-list-item>
			</template>
		</a-list>
	</a-modal>
	<el-dialog
		class="dialog"
		v-model="gjModal.visible"
		title="估价计算器"
		:width="1188"
	>
		<el-table :data="gjModal.table.data" style="width: 100%" height="588">
			<el-table-column
				v-for="c in gjModal.table.columns"
				:prop="c.dataIndex"
				:label="c.title"
			>
				<template #default="{ column, row }">
					<el-input-number
						controls-position="right"
						style="width: 100%"
						v-if="column.property === 'level'"
						v-model="row[column.property]"
						:min="1"
						:max="18"
						:step="1"
						@change="handleGJ(row)"
					/>
					<el-input
						style="width: 100%"
						v-else-if="
							column.property === 'baseCost' ||
							column.property === 'ygStockPrice'
						"
						v-model="row[column.property]"
						placeholder="请输入"
						@change="handleGJ(row)"
					/>
					<el-input-number
						controls-position="right"
						style="width: 100%"
						v-else-if="column.property === 'qwProfit'"
						v-model="row[column.property]"
						:min="0"
						:max="1"
						:step="0.01"
						:placeholder="config.global.qwProfit + ''"
						@change="handleGJ(row)"
					/>
					<span v-else>{{ row[column.property] }}</span>
				</template>
			</el-table-column>
		</el-table>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="gjModal.visible = false">取消</el-button>
				<el-button type="primary" @click="gjModal.visible = false">
					确定
				</el-button>
			</span>
		</template>
	</el-dialog>
</template>
<script setup lang="ts">
import { ref, watch, h } from 'vue'
import { useClipboard } from '@vueuse/core'
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
	handleHanHuaTpl,
	coverArrayToObj,
	updateTableData,
	coverObjToArray,
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
	global: { discount: number; qwProfit: number; mhbrate: number }
	id?: string
	districtModel: string
	districts: { label: string; value: string; key: string }[]
	defaultDistrict: string
	addDistrict: () => void
	deleteDistrict: (i: number) => void
	hanhuaTpl: { value: string; key: string }[]
	addTpl: () => void
	deleteTpl: (i: number) => void
}>({
	user: { mobile: '' },
	global: {
		discount: 0.01, // 默认让利1%
		qwProfit: 0.3, // 期望利润率20%
		mhbrate: 0.0725,
	},
	id: v4(),
	hanhuaTpl: [
		{
			value:
				'#Y熊猫长安城天台' +
				'【杂货】强化$n{青龙石}树$n{摇钱树苗}符石$n_f{符石_1级}起C6$n{超级金柳露}c6$n{金柳露}如意丹$t_range{如意丹}' +
				'【宝石】黑$n_f{黑宝石_1级}星辉$n_f{星辉石_1级}舍$n_f{舍利子_1级}玛$n_f{红玛瑙_1级}太$n_f{太阳石_1级}月$n_f{月亮石_1级}光$n_f{光芒石_1级}' +
				'【珍珠】60珍$n_f{珍珠_60级}70珍$n_f{珍珠_70级}80珍$n_f{珍珠_80级}90珍$n_f{珍珠_90级}100珍$n_f{珍珠_100级}110珍$n_f{珍珠_110级}120珍$n_f{珍珠_120级}130珍$n_f{珍珠_130级}' +
				'【内丹】低丹$t_range{低内丹}高丹$t_range{高内丹}' +
				'【兽决】普兽$t_range{普通兽诀}高兽$t_range{高级兽诀}#46',
			key: v4(),
		},
	],
	districtModel: '',
	defaultDistrict: '待分配',
	districts: [
		{
			key: v4(),
			label: '待分配',
			value: '待分配',
		},
	], // 所属区列表
	addDistrict: () => {
		if (config.value.districtModel) {
			config.value.districts.push({
				key: v4(),
				label: config.value.districtModel,
				value: config.value.districtModel,
			})
		}
	},
	addTpl: () => {
		config.value.hanhuaTpl.push({
			key: v4(),
			value: '',
		})
	},
	deleteTpl: (i: number) => {
		if (config.value.hanhuaTpl.length === 1) {
			message.warn('至少保留一条！')
		} else {
			config.value.hanhuaTpl.splice(i, 1)
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
const gjModal = ref<{
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
				title: '类型',
				dataIndex: 'type',
			},
			{
				title: '名称',
				dataIndex: 'name',
			},
			{
				title: '等级',
				dataIndex: 'level',
			},
			{
				title: '收货价',
				dataIndex: 'ygStockPrice',
			},
			{
				title: '基础工费',
				dataIndex: 'baseCost',
			},
			{
				title: '总工费',
				dataIndex: 'totalCost',
			},
			{
				title: '总成本',
				dataIndex: 'totalCb',
			},
			{
				title: '期望利润',
				dataIndex: 'qwProfit',
			},
			{
				title: '应卖价-梦幻币',
				dataIndex: 'sell_mhb',
			},
			{
				title: '汇率',
				dataIndex: 'mhbrate',
			},
			{
				title: '应卖价-人民币',
				dataIndex: 'sell_rmb',
			},
		],
		data: [],
	},
})
const hhModal = ref<{
	visible: boolean
	hhRecord: string[]
	remove: (i: number) => void
}>({
	visible: false,
	hhRecord: [],
	remove: (i) => {
		hhModal.value.hhRecord.splice(i, 1)
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
		const del = goodsTable.value.data.splice(i, 1)
		const rawI = goodsTable.value.rawData.findIndex(
			(item) => item.key === del[0].key
		)
		if (rawI !== -1) {
			goodsTable.value.rawData.splice(rawI, 1)
		}
	},
})
watch(
	() => goodsTable.value.rawData,
	() => {
		// if (isCache.value && config.value.user.mobile) {
		// 	let hasExist = Cache.get('StallGoodsInfo', config.value.user.mobile)
		// 	if (!hasExist) {
		// 		hasExist = {}
		// 	}
		// 	hasExist[activeTab.value] = goodsTable.value.rawData
		// 	Cache.set('StallGoodsInfo', config.value.user.mobile, hasExist)
		// }
		if (typeChecked.value.length) {
			select.value.options = select.value.rawOptions!.filter((so) =>
				typeChecked.value.includes(so.type)
			)
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
	const req: any = [
		UniCloudGet({
			_tableName: 'stall-config',
			whereKey: 'mobile',
			whereValue: m,
		}),
	]
	const hasGoodsMap = Cache.get('Goods-Map', m)
	if (!hasGoodsMap) {
		req.push(
			UniCloudGet({
				_tableName: 'goods-map',
				whereKey: 'mobile',
				whereValue: m,
			})
		)
	}
	Promise.all(req).then((res) => {
		const configRes = res[0]
		if (configRes.data.data && configRes.data.data.length) {
			config.value = {
				...config.value,
				...configRes.data.data[0],
				hanhuaTpl: coverObjToArray(configRes.data.data[0].hanhuaTpl),
				districts: coverObjToArray(configRes.data.data[0].districts),
			}
			activeTab.value = config.value.defaultDistrict
		}
		let goodsMap = null
		const mapRes = res[1]
		if (mapRes && mapRes.data.data && mapRes.data.data.length) {
			goodsMap = mapRes.data.data[0].goodsMap
		} else if (hasGoodsMap) {
			goodsMap = hasGoodsMap
		}
		if (goodsMap) {
			getInventoryData(goodsMap, m, activeTab.value).then((result) => {
				goodsTable.value.data = result.data
				goodsTable.value.rawData = [...goodsTable.value.data]
				goodsType.value = result.types
				select.value.options = result.goodsOptions
				select.value.rawOptions = [...select.value.options!]
			})
		}
	})
	const hhR = Cache.get('HanHua-Record', m)
	if (hhR) {
		hhModal.value.hhRecord = hhR
	}
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
			districts: coverArrayToObj(config.value.districts, 'key'),
			global: config.value.global,
			user: config.value.user,
			mobile: config.value.user.mobile,
			hanhuaTpl: coverArrayToObj(config.value.hanhuaTpl, 'key'),
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
		goodsTable.value.data = [...goodsTable.value.rawData]
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
		goodsTable.value.data = [...goodsTable.value.rawData]
		select.value.options = [...select.value.rawOptions!]
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
			goods: coverArrayToObj(goodsTable.value.rawData, 'key'),
			mobile: config.value.user.mobile,
			district: activeTab.value,
			id: config.value.user.mobile + '_' + activeTab.value,
		}).then(() => {
			message.success('保存成功')
		})
	}
}
function fileChange(res: any, type: 'import' | 'export') {
	const reader = new FileReader()
	reader.onload = function (event: any) {
		const fileContent = event.target.result
		const iniConfig = parseINI(fileContent)
		if (type === 'export') {
			updateINIFile(iniConfig['qiyunlou'], goodsTable.value.rawData)
			const modifiedContent = stringifyINI(iniConfig)
			generateINIFile(modifiedContent, 'test.ini')
		}
		if (type === 'import') {
			updateTableData(
				iniConfig['qiyunlou'],
				goodsTable.value.rawData,
				config.value.global
			)
		}
	}
	reader.onerror = function (event) {
		message.error('读取配置失败!')
		console.log(event)
	}
	// 读取文件内容
	reader.readAsText(res.file, 'GBK')
}
function hanHua() {
	if (config.value.hanhuaTpl) {
		const text = handleHanHuaTpl(
			config.value.hanhuaTpl,
			goodsTable.value.rawData
		)
		const hhRecord = hhModal.value.hhRecord
		hhRecord.unshift(...text)
		Cache.set('HanHua-Record', config.value.user.mobile, hhRecord)
		hhModal.value.visible = true
	} else {
		message.error('请先设置喊话模板！')
	}
}
function copyTxt(txt: string) {
	const { copy } = useClipboard()
	copy(txt).then((res) => {
		message.success('复制成功！')
	})
}
function openGj() {
	gjModal.value.table.data = goodsTable.value.rawData
		.filter((item) => {
			return item.type === '宝石' || item.type === '灵石'
		})
		.map((item) => {
			const { type, name, feature, qwProfit, ygStockPrice } = item
			const newItem = {
				type,
				name: type === '宝石' ? name : feature,
				qwProfit: qwProfit ? qwProfit : config.value.global.qwProfit,
				ygStockPrice,
				upNum: name === '星辉石' ? 3 : 2,
				mhbrate: config.value.global.mhbrate,
				level: 1,
				baseCost: name === '星辉石' ? 4000 : type === '灵石' ? 4000 : 1000,
				totalCost: 0,
				totalCb: 0,
				sell_mhb: 0,
				sell_rmb: 0,
			}
			handleGJ(newItem)
			return newItem
		})
	gjModal.value.visible = true
	// console.log(gjModal.value.table.data)
}
function handleGJ(item: any) {
	const { level, mhbrate, baseCost, ygStockPrice, qwProfit, upNum } = item
	const num = upNum ** (level - 1)
	const totalStock = num * ygStockPrice
	item.totalCost = calculateTotalCost(level, baseCost)
	item.totalCb = totalStock + item.totalCost
	item.sell_mhb = Number((item.totalCb * (1 + qwProfit)).toFixed(0))
	item.sell_rmb = ((item.sell_mhb / 10000) * mhbrate).toFixed(2)
}
function calculateTotalCost(n: number, base: number): any {
	if (!n || n <= 1) {
		return 0
	} else if (n === 2) {
		return base * (1 + 0.01)
	} else if (n === 3) {
		return 2 * calculateTotalCost(2, base) + 2 * base * (1 + 0.01)
	} else if (n === 4) {
		return (
			2 * (2 * calculateTotalCost(2, base) + 2 * base * (1 + 0.01)) +
			3 * base * (1 + 0.01)
		)
	} else {
		return 2 * calculateTotalCost(n - 1, base) + (n - 1) * 1000 * (1 + 0.01)
	}
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
	height: calc(100% - 180px);
	:deep(.ant-tabs-content) {
		height: 100%;
	}
}
:deep(.ant-btn-icon-only.ant-btn-sm) {
	width: 18px;
	height: 18px;
	vertical-align: -2px;
}
.list {
	max-height: 550px;
	overflow: auto;
}
</style>
<style>
.el-dialog__body {
	padding: 0;
}
</style>
