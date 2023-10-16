<template>
	<a-row ref="Box1">
		<a-col :span="12">
			<a-space>
				<a-button type="primary" @click="add()"> 新增商品 </a-button>
				<a-button type="primary" @click="save()"> 保存 </a-button>
				<!-- <a-cascader
					style="width: 188px"
					v-model:value="select.value"
					:options="select.options"
					:show-search="{ filter: select.filter }"
					placeholder="快速筛选"
					expandTrigger="hover"
					@change="selectChange"
				/> -->
			</a-space>
		</a-col>
		<a-col :span="12"> </a-col>
	</a-row>
	<a-card ref="Box2" title="类型筛选" size="small">
		<a-checkbox-group
			v-model:value="typeChecked"
			:options="goodsType"
			@change="typeFilter"
		>
		</a-checkbox-group>
	</a-card>
	<a-table
		:style="{ height: ths }"
		class="table"
		:columns="table.columns"
		:data-source="table.data"
		:scroll="{ y: 'calc(100% - 55px)' }"
		:pagination="false"
	>
		<template #bodyCell="{ column, record, index }">
			<template v-if="column.dataIndex === 'operate'">
				<a-space>
					<a-button type="primary" size="small" danger @click="remove(index)">
						删除
					</a-button>
				</a-space>
			</template>
			<template v-else>
				<a-input style="width: 100%" v-model:value="record[column.dataIndex]" />
			</template>
		</template>
	</a-table>
</template>
<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { v4 } from 'uuid'
import { message } from 'ant-design-vue'
import 'ant-design-vue/es/message/style/css'
import { UniCloudSet, UniCloudGet } from '@/common/api/uni-cloud-api'
import { Cache, coverArrayToObj, coverObjToArray } from '@/common/utils'
// import type { CascaderProps } from 'ant-design-vue'
// import type { ShowSearchType } from 'ant-design-vue/es/cascader'
const goodsType = ref<any[]>([])
const typeChecked = ref<any[]>([])
const Box1 = ref()
const Box2 = ref()
const ths = ref<string>('300px')
const tpl = {
	key: v4(),
	type: '',
	name: '',
	quality: '',
	config: '',
}
// const select = ref<{
// 	value: string[]
// 	options: CascaderProps['options']
// 	rawOptions: CascaderProps['options']
// 	filter: ShowSearchType['filter']
// }>({
// 	value: [],
// 	options: [],
// 	rawOptions: [],
// 	filter: (inputValue, path) => {
// 		return path.some(
// 			(option) =>
// 				option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
// 		)
// 	},
// })
const table = ref<{ columns: any[]; data: any[]; rawData: any[] }>({
	columns: [
		{
			title: '类型',
			dataIndex: 'type',
			sorter: (a: any, b: any) =>
				a.type.localeCompare(b.type, 'zh-Hans-CN', {
					sensitivity: 'accent',
				}),
		},
		{
			title: '名称/特征',
			dataIndex: 'name',
		},
		{
			title: '质量',
			dataIndex: 'quality',
			sorter: (a: any, b: any) =>
				(a.quality || '').localeCompare(b.quality || '', 'zh-Hans-CN', {
					sensitivity: 'accent',
				}),
		},
		{
			title: '配置字段',
			dataIndex: 'config',
		},
		{
			title: '操作',
			dataIndex: 'operate',
		},
	],
	data: [],
	rawData: [],
})
watch(
	() => table.value.rawData,
	() => {
		if (table.value.rawData.length) {
			const typeMap: any = {}
			const map: any = {}
			goodsType.value = []
			table.value.rawData.forEach((item) => {
				const { type, name } = item
				if (type) {
					const hasType = typeMap[type]
					if (hasType) {
						hasType.num += 1
						hasType.label = hasType.value + `(${hasType.num})`
					} else {
						typeMap[type] = {
							label: type + '(1)',
							value: type,
							num: 1,
						}
					}
				}
				if (name) {
					const has = map[name]
					if (has) {
						// if (feature) {
						// 	has.children.push({
						// 		label: feature,
						// 		value: feature,
						// 	})
						// }
					} else {
						const single: any = {
							label: name,
							value: name,
							type,
							children: [],
						}
						// if (feature) {
						// 	single.children.push({
						// 		label: feature,
						// 		value: feature,
						// 	})
						// }
						map[name] = single
					}
				}
			})
			goodsType.value = Object.keys(typeMap).map((key) => typeMap[key])
			// select.value.options = Object.keys(map).map((key) => map[key])
			// select.value.rawOptions = [...select.value.options]
			// if (typeChecked.value.length) {
			// 	select.value.options = select.value.rawOptions.filter((so) =>
			// 		typeChecked.value.includes(so.type)
			// 	)
			// }
		}
	},
	{ deep: true }
)
const mobile = ref<string | number>('')
init()
function init() {
	const m = Cache.get('Login', 'mobile')
	if (!m) {
		message.error('请先登录！')
		return false
	} else {
		mobile.value = m
	}
	UniCloudGet({
		_tableName: 'goods-map',
		whereKey: 'mobile',
		whereValue: m,
	}).then((res) => {
		if (res.data && res.data.data.length) {
			const goodsMap = coverObjToArray(res.data.data[0].goodsMap)
			table.value.data = goodsMap.sort((a: any, b: any) =>
				a.type.localeCompare(b.type, 'zh-Hans-CN', {
					sensitivity: 'accent',
				})
			)
			table.value.rawData = [...table.value.data]
			nextTick(() => {
				const h1 = Box1.value.$el.offsetHeight
				const h2 = Box2.value.$el.offsetHeight
				ths.value = `calc(100% - ${h1 + h2}px)`
			})
		}
	})
}
// function selectChange() {
// 	if (select.value.value) {
// 		const key = select.value.value.join('_')
// 		table.value.data = table.value.rawData.filter((item) => {
// 			const { name, feature } = item
// 			let _id = name
// 			if (feature) {
// 				_id += '_' + feature
// 			}
// 			return _id === key
// 		})
// 	} else {
// 		table.value.data = [...table.value.rawData]
// 	}
// }
function typeFilter(checked: any[]) {
	if (checked.length) {
		table.value.data = table.value.rawData.filter((item: any) =>
			checked.includes(item.type)
		)
		// select.value.options = select.value.rawOptions!.filter((so) =>
		// 	checked.includes(so.type)
		// )
	} else {
		table.value.data = [...table.value.rawData]
		// select.value.options = [...select.value.rawOptions!]
	}
}
function add() {
	const item = {
		...tpl,
		key: v4(),
	}
	table.value.data.unshift(item)
	table.value.rawData.unshift(item)
}
function remove(i: number) {
	const del: any = table.value.data.splice(i, 1)
	const rawI = table.value.rawData.findIndex((item) => item.key === del[0].key)
	if (rawI !== -1) {
		table.value.rawData.splice(rawI, 1)
	}
}
function save() {
	UniCloudSet({
		_tableName: 'goods-map',
		goodsMap: coverArrayToObj(table.value.rawData, 'key'),
		mobile: mobile.value,
		whereKey: 'mobile',
		whereValue: mobile.value,
	}).then(() => {
		Cache.set('Goods-Map', mobile.value, table.value.rawData)
		message.success('保存成功')
	})
}
</script>
<style scoped lang="scss">
.table {
	:deep(.ant-table) {
		height: 100% !important;
	}
}
</style>
