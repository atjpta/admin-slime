<script setup lang="ts">
import { h, ref, computed, reactive, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from '@/utils/toast'
import type { ColumnDef } from '@tanstack/vue-table'
import { useDataTable } from '@/composables/useDataTable'
import VTable from '@/components/ui/table/v-table.vue'
import VTableToolbar from '@/components/ui/table/v-table-toolbar.vue'
import VPagination from '@/components/ui/pagination/v-pagination.vue'
import VButton from '@/components/ui/btn/v-button.vue'
import VBadge from '@/components/ui/badge/v-badge.vue'
import VConfirmModal from '@/components/ui/modal/v-confirm-modal.vue'
import { mailService } from '@/services/api/mail.service'
import { formatDate } from '@/utils/format'
import type { Mail } from '@/interfaces/mail.interface'
import { MailSource } from '@/enums/mail.enum'
import { SendIcon, Trash2Icon, EyeIcon, RotateCwIcon } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { RouteName } from '@/router'
import MailSendModal from './components/mail-send-modal.vue'

const { t } = useI18n()
const router = useRouter()

const mails = ref<Mail[]>([])
const total = ref(0)
const showSendModal = ref(false)
const deletingMail = ref<Mail | null>(null)
const deleteLoading = ref(false)
const resendingMail = ref<Mail | null>(null)
const resendLoading = ref(false)
const togglingIds = ref(new Set<string>())

const filter = reactive({ source: '' as MailSource | '' })

const columns = computed<ColumnDef<Mail>[]>(() => [
  {
    id: 'title',
    header: t('mail.columns.title'),
    cell: ({ row }) => row.original.title.vi || '-',
    meta: { minWidth: 'w-56' },
  },
  {
    accessorKey: 'source',
    header: t('mail.columns.source'),
    cell: ({ row }) => h(VBadge, { value: row.getValue<string>('source'), i18nKey: 'mail.source' }),
    meta: { align: 'center', minWidth: 'w-28' },
  },
  {
    id: 'receivers',
    header: t('mail.columns.receivers'),
    cell: ({ row }) => {
      const count = row.original.receivers.length
      return count > 0 ? t('mail.receiversCount', { n: count }) : '-'
    },
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'sendToNewPlayers',
    header: t('mail.columns.sendToNewPlayers'),
    cell: ({ row }) => {
      const mail = row.original
      if (mail.source !== MailSource.SYSTEM) return '-'
      const loading = togglingIds.value.has(mail._id)
      return h('label', { class: 'flex cursor-pointer justify-center' }, [
        loading
          ? h('span', { class: 'loading loading-spinner loading-xs' })
          : h('input', {
              type: 'checkbox',
              class: 'checkbox checkbox-primary checkbox-sm',
              checked: mail.sendToNewPlayers,
              onChange: () => toggleSendToNewPlayers(mail),
            }),
      ])
    },
    meta: { align: 'center', minWidth: 'w-32' },
  },
  {
    accessorKey: 'expiredAt',
    header: t('mail.columns.expiredAt'),
    cell: ({ row }) => formatDate(row.getValue('expiredAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    accessorKey: 'createdAt',
    header: t('mail.columns.createdAt'),
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
    meta: { align: 'center', minWidth: 'w-40' },
  },
  {
    id: 'actions',
    header: '',
    meta: { align: 'center', minWidth: 'w-32' },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-center gap-1' }, [
        h(VButton, {
          icon: EyeIcon,
          class: 'btn-ghost text-primary',
          onClick: () =>
            router.push({ name: RouteName.MailDetail, params: { id: row.original._id } }),
        }),
        h(VButton, {
          icon: RotateCwIcon,
          class: 'btn-ghost text-secondary',
          onClick: () => (resendingMail.value = row.original),
        }),
        h(VButton, {
          icon: Trash2Icon,
          class: 'btn-ghost text-error',
          onClick: () => (deletingMail.value = row.original),
        }),
      ]),
  },
])

async function fetchMails() {
  const res = await mailService.index({
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    source: filter.source || undefined,
  })
  mails.value = res.items
  total.value = res.pagination.total
}

const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: mails,
  total,
  filters: { source: toRef(filter, 'source') },
  onFetch: fetchMails,
})

async function toggleSendToNewPlayers(mail: Mail) {
  togglingIds.value.add(mail._id)
  await mailService.update(mail._id, { sendToNewPlayers: !mail.sendToNewPlayers })
  mail.sendToNewPlayers = !mail.sendToNewPlayers
  toast.success(t('mail.toggleSendToNewPlayers.success'))
  togglingIds.value.delete(mail._id)
}

async function confirmResend() {
  if (!resendingMail.value) return
  resendLoading.value = true
  const result = await mailService.resend(resendingMail.value._id)
  if (result.sent > 0) {
    toast.success(t('mail.detail.resend.success', { n: result.sent }))
  } else {
    toast.info(t('mail.detail.resend.noneNew'))
  }
  resendingMail.value = null
  resendLoading.value = false
}

async function confirmDelete() {
  if (!deletingMail.value) return
  deleteLoading.value = true
  await mailService.delete(deletingMail.value._id)
  toast.success(t('mail.delete.success'))
  deletingMail.value = null
  await fetchMails()
  deleteLoading.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('mail.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('mail.subtitle') }}</p>
      </div>
      <VButton :icon="SendIcon" class="btn-primary" @click="showSendModal = true">
        <span class="hidden sm:inline">{{ t('mail.send.title') }}</span>
      </VButton>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar v-model="search">
          <template #filters>
            <VSelectFilter
              v-model="filter.source"
              :label="t('mail.columns.source')"
              :enum-values="MailSource"
              i18n-key="mail.source"
            />
          </template>
        </VTableToolbar>
        <VTable :table="table" :loading="loading" />
        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>

  <MailSendModal :open="showSendModal" @close="showSendModal = false" @sent="fetchMails" />

  <VConfirmModal
    :open="!!resendingMail"
    :title="t('mail.detail.resend.btn')"
    :message="t('mail.detail.resend.confirm')"
    :loading="resendLoading"
    @confirm="confirmResend"
    @cancel="resendingMail = null"
    @close="resendingMail = null"
  />

  <VConfirmModal
    :open="!!deletingMail"
    :title="t('mail.delete.title')"
    :message="t('mail.delete.message')"
    :loading="deleteLoading"
    @confirm="confirmDelete"
    @cancel="deletingMail = null"
  />
</template>
