<script setup lang="ts">
import { ref, computed } from 'vue'
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

    <dialog class="modal" :class="{ 'modal-open': open }">
      <div class="modal-box max-w-lg">
        <h3 class="mb-4 text-lg font-semibold">{{ title ?? t('common.detail') }}</h3>
        <div class="max-h-[60vh] overflow-auto rounded-lg">
          <JsonViewer :data="value as JsonValue" :dark-mode="isDark" :expanded="true" />
        </div>
        <div class="modal-action">
          <VButton class="btn-ghost" @click="open = false">{{ t('common.close') }}</VButton>
        </div>
      </div>
    </dialog>
  </template>
</template>
