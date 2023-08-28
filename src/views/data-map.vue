<template>
	<a-row>
		<a-col :span="12">
			<a-space>
				<a-button type="primary" @click="save()"> 保存 </a-button>
				<a-select
					placeholder="快速搜索"
					v-model:value="filter.value"
					show-search
					style="width: 288px"
					:options="filter.options"
					:filter-option="(input: string, option: any) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}"
					@change="doFilter"
				></a-select>
			</a-space>
		</a-col>
		<a-col :span="12"> </a-col>
	</a-row>
	<a-table
		class="table"
		:columns="table.columns"
		:data-source="table.data"
		:scroll="{ y: 'calc(100% - 55px)' }"
		:pagination="false"
		:expand-column-width="58"
		:expandedRowKeys="expandRowKeys"
		@expand="expand"
	>
		<template #bodyCell="{ column, record, index }">
			<template v-if="column.dataIndex === 'operate'">
				<a-space>
					<a-button type="primary" size="small" @click="add(index)">
						新增特征
					</a-button>
					<a-button type="primary" size="small" @click="add()">
						新增商品
					</a-button>
					<a-button type="primary" size="small" danger @click="remove(index)">
						删除
					</a-button>
				</a-space>
			</template>
			<template v-else>
				<a-input
					style="width: 288px"
					v-model:value="record[column.dataIndex]"
				/>
			</template>
		</template>
		<template #expandedRowRender="{ record, index }">
			<a-space style="margin-left: 58px" wrap>
				<a-space v-for="(opt, i) in record.options">
					<a-input style="width: 288px" v-model:value="opt.value" />
					<a-button
						type="primary"
						size="small"
						danger
						@click="remove(index, i)"
					>
						删除
					</a-button>
				</a-space>
			</a-space>
		</template>
	</a-table>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { v4 } from 'uuid'
import { message } from 'ant-design-vue'
import 'ant-design-vue/es/message/style/css'
import { UniCloudSet, UniCloudGet } from '@/common/api/uni-cloud-api'
import { Cache } from '@/common/utils'
const filter = ref<{
	value: string
	options: {
		label: string
		value: string
	}[]
}>({
	value: '',
	options: [],
})
const table = ref<{ columns: any[]; data: any[] }>({
	columns: [
		{
			title: '名称',
			dataIndex: 'value',
			sorter: (a: any, b: any) =>
				a.value.localeCompare(b.value, 'zh-Hans-CN', {
					sensitivity: 'accent',
				}),
		},
		{
			title: '操作',
			dataIndex: 'operate',
		},
	],
	data: [
		{
			key: v4(),
			label: '',
			value: '',
			options: [],
		},
	],
})
watch(
	table,
	() => {
		if (table.value.data.length !== filter.value.options.length) {
			filter.value.options = table.value.data
				.filter((item) => item.value)
				.map((item) => {
					return { label: item.value, value: item.value }
				})
		}
	},
	{ deep: true }
)
const expandRowKeys = ref<string[]>([])
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
			const goodsMap = res.data.data[0].goodsMap
			table.value.data = Object.keys(goodsMap).map((key) => goodsMap[key])
		}
	})
}
function doFilter() {
	if (filter.value.value) {
		const i = table.value.data.findIndex(
			(item) => item.value === filter.value.value
		)
		if (i !== -1) {
			const target = table.value.data.splice(i, 1)
			table.value.data.unshift(target[0])
		}
	}
}
function add(i?: number) {
	if (i !== undefined) {
		table.value.data[i].options.push({
			label: '',
			value: '',
		})
		expandRowKeys.value.push(table.value.data[i].key)
	} else {
		table.value.data.push({
			key: v4(),
			label: '',
			value: '',
			options: [],
		})
	}
}
function expand(expanded: any, record: any) {
	if (expanded) {
		expandRowKeys.value.push(record.key)
	} else {
		const i = expandRowKeys.value.findIndex((key) => key === record.key)
		if (i !== -1) {
			expandRowKeys.value.splice(i, 1)
		}
	}
}
function remove(i: number, subI?: number) {
	if (table.value.data.length <= 1 && subI === undefined) {
		message.error('至少保留一项数据！')
	} else if (subI !== undefined) {
		table.value.data[i].options.splice(subI, 1)
	} else if (i !== undefined) {
		table.value.data.splice(i, 1)
	}
}
function save() {
	const map: any = {}
	table.value.data.forEach((item) => {
		if (item.value) {
			item.label = item.value
			item.options = item.options
				.filter((opt: any) => opt.value)
				.map((opt: any) => {
					opt.label = opt.value
					return opt
				})
				.sort((a: any, b: any) => {
					return a.value.localeCompare(b.value, 'zh-Hans-CN', {
						sensitivity: 'accent',
					})
				})
			map[item.value] = item
		}
	})
	if (Object.keys(map).length) {
		UniCloudSet({
			_tableName: 'goods-map',
			goodsMap: map,
			mobile: mobile.value,
			whereKey: 'mobile',
			whereValue: mobile.value,
		}).then(() => {
			message.success('保存成功')
		})
	}
}
</script>
<style lang="scss" scoped>
.table {
	height: calc(100% - 32px);
}
</style>
