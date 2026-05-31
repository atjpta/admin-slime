<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { SwatchBookIcon } from '@lucide/vue'
import { localStorageService, LocalStorageKey } from '@/services/local-storage.service'

const THEMES = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
]

// theme-change dùng key LocalStorageKey.Theme trong localStorage và attr 'data-theme' trên <html>
const current = ref(localStorageService.get<string>(LocalStorageKey.Theme, 'light'))

function apply(theme: string) {
  current.value = theme
  localStorageService.set(LocalStorageKey.Theme, theme)
  document.documentElement.setAttribute('data-theme', theme)
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', current.value)
})
</script>

<template>
  <div class="dropdown dropdown-end">
    <button tabindex="0" class="btn btn-ghost btn-sm btn-square">
      <SwatchBookIcon class="size-4" />
    </button>
    <ul
      tabindex="0"
      class="dropdown-content bg-base-100 border-base-300 z-50 mt-2 max-h-80 w-40 overflow-y-auto rounded-xl border p-1 shadow-lg"
    >
      <li v-for="theme in THEMES" :key="theme">
        <button
          class="hover:bg-base-200 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm capitalize transition-colors"
          :class="{ 'bg-primary/10 text-primary font-medium': current === theme }"
          @click="apply(theme)"
        >
          <span :data-theme="theme" class="flex shrink-0 gap-0.5 overflow-hidden rounded">
            <span class="bg-primary block size-2" />
            <span class="bg-secondary block size-2" />
            <span class="bg-accent block size-2" />
          </span>
          {{ theme }}
        </button>
      </li>
    </ul>
  </div>
</template>
