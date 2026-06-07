<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <div>
    <p class="text-base-content/70 mb-3 text-sm font-semibold">
      {{ title }}
    </p>
    <slot />
  </div>
</template>
