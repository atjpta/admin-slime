<script setup lang="ts">
import VButton from '@/components/ui/btn/v-button.vue'
import { useI18n } from 'vue-i18n'

interface Props {
  open: boolean
  title?: string
  message?: string
  confirmClass?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  confirmClass: 'btn-error',
  loading: false,
})

defineEmits<{ confirm: []; cancel: [] }>()
const { t } = useI18n()
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box max-w-sm">
      <h3 v-if="title" class="mb-2 text-lg font-bold">{{ title }}</h3>
      <p v-if="message" class="text-base-content/70 text-sm">{{ message }}</p>
      <div class="modal-action">
        <VButton class="btn btn-ghost" @click="$emit('cancel')">{{ t('common.cancel') }}</VButton>
        <VButton :class="confirmClass" :loading="loading" @click="$emit('confirm')">
          {{ t('common.confirm') }}
        </VButton>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @submit.prevent="$emit('cancel')">
      <button>close</button>
    </form>
  </dialog>
</template>
