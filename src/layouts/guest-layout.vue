<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import VLang from '@/components/layout/v-lang.vue'
import VTheme from '@/components/layout/v-theme.vue'

const { t } = useI18n()
</script>

<template>
  <div class="bg-base-200 min-h-screen">
    <header class="border-base-300 border-b">
      <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <img src="@/assets/logo.png" alt="logo" class="size-8 rounded-lg object-cover" />
          <span class="text-base-content text-sm font-semibold">{{ t('appName') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <VLang />
          <VTheme />
        </div>
      </div>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
