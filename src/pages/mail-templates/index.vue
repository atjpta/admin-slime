<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from '@/utils/toast'
import type { ColumnDef } from '@tanstack/vue-table'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VConfirmModal from '@/components/ui/modal/v-confirm-modal.vue'
import { mailTemplateService } from '@/services/api/mail-template.service'
import { formatDate } from '@/utils/format'
import type { MailTemplate } from '@/interfaces/mail.interface'
import { PlusIcon, SquarePenIcon, Trash2Icon } from '@lucide/vue'
import MailTemplateFormModal from './components/mail-template-form-modal.vue'

const { t } = useI18n()

const templates = ref<MailTemplate[]>([])
const total = ref(0)
const editingTemplate = ref<MailTemplate | null>(null)
const showCreateModal = ref(false)
const deletingTemplate = ref<MailTemplate | null>(null)
const deleteLoading = ref(false)

const columns = computed<ColumnDef<MailTemplate>[]>(() => [
  {
    accessorKey: 'name',
    header: t('mailTemplate.columns.name'),
    meta: { minWidth: 'w-48' },
  },
  {
    id: 'title',
    header: t('mailTemplate.columns.title'),
    cell: ({ row }) => row.original.title.vi || '-',
    meta: { minWidth: 'w-56' },
  },
  {
    accessorKey: 'expirationDuration',
    header: t('mailTemplate.columns.expirationDuration'),
    cell: ({ row }) => `${row.getValue('expirationDuration')} ngày`,
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'createdAt',
    header: t('mailTemplate.columns.createdAt'),
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
          onClick: () => (editingTemplate.value = row.original),
        }),
        h(VButton, {
          icon: Trash2Icon,
          class: 'btn-ghost text-error',
          onClick: () => (deletingTemplate.value = row.original),
        }),
      ]),
  },
])

async function fetchTemplates() {
  const res = await mailTemplateService.index({
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
  })
  templates.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: templates,
  total,
  onFetch: fetchTemplates,
})

async function confirmDelete() {
  if (!deletingTemplate.value) return
  deleteLoading.value = true
  await mailTemplateService.delete(deletingTemplate.value._id)
  toast.success(t('mailTemplate.delete.success'))
  deletingTemplate.value = null
  await fetchTemplates()
  deleteLoading.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('mailTemplate.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('mailTemplate.subtitle') }}</p>
      </div>
      <VButton :icon="PlusIcon" class="btn-primary" @click="showCreateModal = true">
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

  <MailTemplateFormModal
    v-if="showCreateModal"
    mode="create"
    :template="null"
    @close="showCreateModal = false"
    @saved="fetchTemplates"
  />

  <MailTemplateFormModal
    mode="edit"
    :template="editingTemplate"
    @close="editingTemplate = null"
    @saved="fetchTemplates"
  />

  <VConfirmModal
    :open="!!deletingTemplate"
    :title="t('mailTemplate.delete.title')"
    :message="t('mailTemplate.delete.message', { name: deletingTemplate?.name ?? '' })"
    :loading="deleteLoading"
    @confirm="confirmDelete"
    @cancel="deletingTemplate = null"
  />
</template>
