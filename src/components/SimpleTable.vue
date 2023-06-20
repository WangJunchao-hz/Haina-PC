<template>
	<div class="simple-table">
		<div class="columns">
			<div
				class="column"
				:style="{ width: width }"
				v-for="column in columns"
				:key="column.prop"
			>
				{{ column.label }}
			</div>
		</div>
		<div class="content">
			<div class="row" v-for="row in data">
				<div
					class="cell"
					:style="{ width: width }"
					v-for="column in columns"
					:key="column.prop"
				>
					{{ row[column.prop] }}
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const { columns, data } = defineProps<{
	columns: SimpleTableColumn[]
	data: any[]
}>()
const width = ref<string>((100 / columns.length).toFixed(2) + '%')
</script>
<style lang="scss" scoped>
.simple-table {
	.columns {
		display: flex;
		.column {
			text-align: center;
		}
	}
	.content {
		.row {
			display: flex;
			.cell {
				text-align: center;
			}
		}
	}
}
</style>
