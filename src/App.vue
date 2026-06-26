<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <RouterView />
  <div id="toast-portal" popover="manual" class="toast-portal">
    <Toaster rich-colors position="top-right" />
  </div>
</template>
