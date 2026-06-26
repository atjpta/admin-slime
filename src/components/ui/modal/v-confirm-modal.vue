<script setup lang="ts">
import { watch, useTemplateRef } from 'vue'
import VButton from '@/components/ui/btn/v-button.vue'
import { useI18n } from 'vue-i18n'

interface Props {
  open: boolean
  title?: string
  message?: string
  confirmClass?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmClass: 'btn-error',
  loading: false,
})

defineEmits<{ confirm: []; cancel: []; close: [] }>()
const { t } = useI18n()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')

watch(
  () => props.open,
  (v) => {
    if (v) dialogRef.value?.showModal()
    else dialogRef.value?.close()
  }
)
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-sm">
      <div class="absolute top-3 right-3">
        <VButton class="btn-ghost btn-circle" @click="$emit('close')"> ✕ </VButton>
      </div>
      <h3 v-if="title" class="mb-2 text-lg font-bold">{{ title }}</h3>
      <p v-if="message" class="text-base-content/70 text-sm">{{ message }}</p>
      <div class="modal-action">
        <VButton class="btn btn-ghost" @click="$emit('cancel')">{{ t('common.cancel') }}</VButton>
        <VButton :class="confirmClass" :loading="loading" @click="$emit('confirm')">
          {{ t('common.confirm') }}
        </VButton>
      </div>
    </div>
  </dialog>
</template>
