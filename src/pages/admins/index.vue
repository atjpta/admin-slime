<script setup lang="ts">
import { h, ref, reactive, toRef, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ColumnDef } from '@tanstack/vue-table'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VSelectFilter from '@/components/ui/select/v-select-filter.vue'
import VStatusBadge from '@/components/ui/badge/v-status-badge.vue'
import { adminService } from '@/services/api/admin.service'
import { formatDate } from '@/utils/format'
import { UserStatus } from '@/enums/user.enum'
import type { Admin, AdminFilter } from '@/interfaces/admin.interface'

const { t } = useI18n()

const admins = ref<Admin[]>([])
const total = ref(0)
const filter = reactive({ status: '' as UserStatus | '' })

const columns = computed<ColumnDef<Admin>[]>(() => [
  {
    accessorKey: 'email',
    header: t('admin.columns.email'),
  },
  {
    accessorKey: 'status',
    header: t('admin.columns.status'),
    cell: ({ row }) =>
      h(VStatusBadge, {
        value: row.getValue<string>('status'),
        i18nKey: 'admin.status',
        colors: { [UserStatus.ACTIVE]: 'success', [UserStatus.INACTIVE]: 'error' },
      }),
    meta: { align: 'center' },
  },
  {
    accessorKey: 'createdAt',
    header: t('admin.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center' },
  },
  {
    accessorKey: 'updatedAt',
    header: t('admin.columns.updatedAt'),
    cell: ({ row }) => new Date(row.getValue<string>('updatedAt')).toLocaleString(),
    meta: { align: 'center' },
  },
])

async function fetchAdmins() {
  const params: AdminFilter = {
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    status: filter.status || undefined,
  }
  const res = await adminService.index(params)
  admins.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: admins,
  total,
  filters: { status: toRef(filter, 'status') },
  onFetch: fetchAdmins,
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('admin.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('admin.subtitle') }}</p>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar
          v-model="search"
          :active-filters="!!filter.status"
          @reset="filter.status = ''"
        >
          <template #filters>
            <VSelectFilter
              v-model="filter.status"
              :label="t('admin.columns.status')"
              :enum-values="UserStatus"
              i18n-key="admin.status"
            />
          </template>
        </VTableToolbar>

        <VTable :table="table" :loading="loading" />

        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>
</template>
