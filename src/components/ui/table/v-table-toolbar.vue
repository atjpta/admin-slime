<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { Search } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

interface Props {
  placeholder?: string
  debounce?: number
}

const { placeholder, debounce = 400 } = defineProps<Props>()
const search = defineModel<string>({ default: '' })
const { t } = useI18n()

// Local value cho input — debounce trước khi sync ra ngoài
const localValue = ref(search.value)
let timer: ReturnType<typeof setTimeout> | undefined

watch(localValue, (val) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    search.value = val
  }, debounce)
})

// Sync ngược lại nếu bên ngoài reset search (vd: clear filter)
watch(search, (val) => {
  if (val !== localValue.value) localValue.value = val
})

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative">
        <Search
          class="text-base-content/40 absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2"
        />
        <input
          v-model="localValue"
          type="text"
          class="input input-bordered input-sm w-60 pl-9"
          :placeholder="placeholder ?? t('table.search')"
        />
      </div>
      <slot name="filters" />
    </div>

    <div class="flex items-center gap-2">
      <slot />
    </div>
  </div>
</template>
