<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'
import { Search, X } from '@lucide/vue'
import { useI18n } from 'vue-i18n'

interface Props {
  placeholder?: string
  debounce?: number
  activeFilters?: boolean
}

const { placeholder, debounce = 400, activeFilters = false } = defineProps<Props>()
const search = defineModel<string>({ default: '' })
const emit = defineEmits<{ reset: [] }>()
const { t } = useI18n()

const localValue = ref(search.value)
let timer: ReturnType<typeof setTimeout> | undefined

watch(localValue, (val) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    search.value = val
  }, debounce)
})

watch(search, (val) => {
  if (val !== localValue.value) localValue.value = val
})

const hasActive = computed(() => !!localValue.value || activeFilters)

function clearSearch() {
  clearTimeout(timer)
  localValue.value = ''
  search.value = ''
}

function reset() {
  clearSearch()
  emit('reset')
}

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
          :class="localValue ? 'pr-8' : ''"
          :placeholder="placeholder ?? t('table.search')"
        />
        <button
          v-if="localValue"
          type="button"
          class="text-base-content/40 hover:text-base-content absolute top-1/2 right-2 -translate-y-1/2"
          @click="clearSearch"
        >
          <X class="size-3.5" />
        </button>
      </div>
      <slot name="filters" />
      <button
        v-if="hasActive"
        type="button"
        class="btn btn-ghost btn-sm text-base-content/50 hover:text-base-content gap-1"
        @click="reset"
      >
        <X class="size-3.5" />
        {{ t('table.resetFilters') }}
      </button>
    </div>

    <div class="flex items-center gap-2">
      <slot />
    </div>
  </div>
</template>
