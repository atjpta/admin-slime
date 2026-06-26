<script setup lang="ts">
import { ref, computed, watch, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { EyeIcon } from '@lucide/vue'
import { JsonViewer, type JsonValue } from '@anilkumarthakur/vue3-json-viewer'
import '@anilkumarthakur/vue3-json-viewer/styles.css'
import VButton from '@/components/ui/btn/v-button.vue'
import { useDarkMode } from '@/composables/useDarkMode'

interface Props {
  value: unknown
  title?: string
}

const { value, title } = defineProps<Props>()
const { t } = useI18n()
const isDark = useDarkMode()

const open = ref(false)
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')

watch(open, (v) => {
  if (v) dialogRef.value?.showModal()
  else dialogRef.value?.close()
})

const isEmpty = computed(() => {
  if (value == null) return true
  if (typeof value === 'object') return Object.keys(value as object).length === 0
  return false
})
</script>

<template>
  <span v-if="isEmpty" class="text-base-content/40">—</span>

  <template v-else>
    <VButton :icon="EyeIcon" class="btn-ghost btn-xs text-primary" @click="open = true">
      {{ t('common.view') }}
    </VButton>

    <dialog ref="dialog" class="modal">
      <div class="modal-box max-w-lg">
        <div class="absolute top-3 right-3">
          <VButton class="btn-ghost btn-circle" @click="open = false"> ✕ </VButton>
        </div>
        <h3 class="mb-4 text-lg font-semibold">{{ title ?? t('common.detail') }}</h3>
        <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
          <JsonViewer :data="value as JsonValue" :dark-mode="isDark" :expanded="true" />
        </div>
        <div class="modal-action">
          <VButton class="btn-ghost" @click="open = false">{{ t('common.close') }}</VButton>
        </div>
      </div>
    </dialog>
  </template>
</template>
