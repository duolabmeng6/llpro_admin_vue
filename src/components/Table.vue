<script setup>
const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  striped: {
    type: Boolean,
    default: true
  },
  hover: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['row-click'])

const handleRowClick = (row, index) => {
  emit('row-click', { row, index })
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            :class="column.headerClass"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <template v-if="loading">
          <tr>
            <td :colspan="columns.length" class="px-6 py-4 text-center">
              <div class="flex justify-center">
                <i class="fas fa-spinner fa-spin h-5 w-5 text-primary-500"></i>
                <span class="ml-2">Loading...</span>
              </div>
            </td>
          </tr>
        </template>
        <template v-else-if="data.length === 0">
          <tr>
            <td :colspan="columns.length" class="px-6 py-4 text-center text-sm text-gray-500">
              No data available
            </td>
          </tr>
        </template>
        <template v-else>
          <tr
            v-for="(row, rowIndex) in data"
            :key="rowIndex"
            @click="handleRowClick(row, rowIndex)"
            :class="{
              'bg-gray-50': striped && rowIndex % 2 === 1,
              'hover:bg-gray-100 cursor-pointer': hover
            }"
          >
            <td
              v-for="column in columns"
              :key="`${rowIndex}-${column.key}`"
              class="px-6 py-4 whitespace-nowrap text-sm"
              :class="column.cellClass"
            >
              <slot :name="`cell(${column.key})`" :row="row" :value="row[column.key]">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template> 