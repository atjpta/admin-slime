<script setup lang="ts">
import { h, ref, computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ColumnDef } from '@tanstack/vue-table'
import { SquarePenIcon, PlusIcon, Trash2Icon } from '@lucide/vue'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VConfirmModal from '@/components/ui/modal/v-confirm-modal.vue'
import RankTierConfigFormModal from './components/rank-tier-config-form-modal.vue'
import { rankTierConfigService } from '@/services/api/rank-tier-config.service'
import type { RankTierConfig } from '@/interfaces/rank.interface'
import { formatDate } from '@/utils/format'
import { toast } from '@/utils/toast'

const { t } = useI18n()

const items = ref<RankTierConfig[]>([])
const total = ref(0)
const formModal = useTemplateRef<{ open: (item?: RankTierConfig) => void }>('formModal')
const deletingItem = ref<RankTierConfig | null>(null)
const deleteLoading = ref(false)

const columns = computed<ColumnDef<RankTierConfig>[]>(() => [
  {
    accessorKey: 'code',
    header: t('rankTierConfig.columns.code'),
    cell: ({ row }) => h('span', { class: 'font-mono text-sm font-medium' }, row.getValue('code')),
    meta: { minWidth: 'w-36' },
  },
  {
    accessorKey: 'minPoint',
    header: t('rankTierConfig.columns.minPoint'),
    cell: ({ row }) => row.getValue<number>('minPoint').toLocaleString(),
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'createdAt',
    header: t('rankTierConfig.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    id: 'actions',
    header: '',
    meta: { align: 'center', minWidth: 'w-20' },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-center gap-1' }, [
        h(VButton, {
          icon: SquarePenIcon,
          class: 'btn-ghost text-primary',
          onClick: () => formModal.value?.open(row.original),
        }),
        h(VButton, {
          icon: Trash2Icon,
          class: 'btn-ghost text-error',
          onClick: () => (deletingItem.value = row.original),
        }),
      ]),
  },
])

async function fetchItems() {
  const res = await rankTierConfigService.index({
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
  })
  items.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: items,
  total,
  onFetch: fetchItems,
})

async function handleDelete() {
  if (!deletingItem.value) return
  deleteLoading.value = true
  await rankTierConfigService.remove(deletingItem.value._id)
  toast.success(t('rankTierConfig.delete.success'))
  deletingItem.value = null
  deleteLoading.value = false
  await fetchItems()
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('rankTierConfig.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('rankTierConfig.subtitle') }}</p>
      </div>
      <VButton :icon="PlusIcon" class="btn-primary" @click="formModal?.open()">
        <span class="hidden sm:inline">{{ t('common.create') }}</span>
      </VButton>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar v-model="search" />
        <VTable :table="table" :loading="loading" />
        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>

  <RankTierConfigFormModal ref="formModal" @saved="fetchItems" />

  <VConfirmModal
    :open="!!deletingItem"
    :title="t('rankTierConfig.delete.title')"
    :message="t('rankTierConfig.delete.message', { code: deletingItem?.code ?? '' })"
    :loading="deleteLoading"
    @confirm="handleDelete"
    @cancel="deletingItem = null"
    @close="deletingItem = null"
  />
</template>
