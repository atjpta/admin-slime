<script setup lang="ts">
import type { ButtonHTMLAttributes, Component } from 'vue'
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {
  loading?: boolean
  icon?: Component | string
}

const { loading, icon } = defineProps<Props>()
const attrs = useAttrs()
</script>

<template>
  <button
    v-bind="attrs"
    :disabled="(attrs.disabled as boolean) || loading"
    class="btn btn-sm relative"
  >
    <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <span class="loading loading-spinner" />
    </span>

    <span class="flex items-center gap-2" :class="{ invisible: loading }">
      <img v-if="typeof icon === 'string'" :src="icon" class="size-4 shrink-0" alt="" />
      <component :is="icon" v-else-if="icon" class="size-4 shrink-0" />
      <span v-if="$slots.default" class="hidden sm:inline"><slot /></span>
    </span>
  </button>
</template>
