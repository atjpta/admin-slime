<script setup lang="ts">
import { useId } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import 'cally'
import { formatOnlyDate } from '@/utils/format'
import VButton from '@/components/ui/btn/v-button.vue'

defineOptions({ inheritAttrs: false })

defineProps<{ modelValue: string; placeholder?: string; disabled?: boolean }>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const id = useId()
const pickerId = `dp-${id}`
const anchorName = `--dp-${id}`

function handleChange(e: Event) {
  const value = (e.target as HTMLInputElement).value
  if (!value) return
  emit('update:modelValue', value)
  document.getElementById(pickerId)?.hidePopover()
}
</script>

<template>
  <VButton
    type="button"
    v-bind="$attrs"
    :popovertarget="pickerId"
    :style="`anchor-name: ${anchorName}`"
    class="input input-bordered w-full cursor-pointer text-left"
    :class="{ 'text-base-content/40': !modelValue }"
    :disabled="disabled"
  >
    {{ formatOnlyDate(modelValue) || placeholder }}
  </VButton>
  <div
    :id="pickerId"
    popover
    :style="`margin:0;position:fixed;inset:unset;position-anchor:${anchorName};top:anchor(bottom);left:anchor(left);margin-top:4px`"
    class="bg-base-100 border-base-300 rounded-box border p-3 shadow-xl"
  >
    <calendar-date class="cally" :value="modelValue" @change="handleChange">
      <VButton
        type="button"
        aria-label="Previous"
        slot="previous"
        class="btn btn-sm btn-circle btn-ghost"
      >
        <ChevronLeftIcon class="size-4" />
      </VButton>
      <VButton type="button" aria-label="Next" slot="next" class="btn btn-sm btn-circle btn-ghost">
        <ChevronRightIcon class="size-4" />
      </VButton>
      <calendar-month></calendar-month>
    </calendar-date>
  </div>
</template>
