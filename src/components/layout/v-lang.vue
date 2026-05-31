<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LanguagesIcon } from '@lucide/vue'
import { localStorageService, LocalStorageKey } from '@/services/local-storage.service'

const LANGS = ['vi', 'en']

const { locale, t } = useI18n()

function setLocale(code: string) {
  locale.value = code
  localStorageService.set(LocalStorageKey.Locale, code)
}
</script>

<template>
  <div class="dropdown dropdown-end">
    <button tabindex="0" class="btn btn-ghost btn-sm gap-1.5">
      <LanguagesIcon class="size-4" />
      <span class="text-xs font-medium uppercase">{{ locale }}</span>
    </button>
    <ul
      tabindex="0"
      class="dropdown-content bg-base-100 border-base-300 z-50 mt-2 w-36 rounded-xl border p-1 shadow-lg"
    >
      <li v-for="code in LANGS" :key="code">
        <button
          class="hover:bg-base-200 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
          :class="{ 'bg-primary/10 text-primary font-medium': locale === code }"
          @click="setLocale(code)"
        >
          {{ t(`languages.${code}`) }}
        </button>
      </li>
    </ul>
  </div>
</template>
