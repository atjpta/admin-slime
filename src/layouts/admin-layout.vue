<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { MenuIcon } from '@lucide/vue'
import VSidebar from '@/components/layout/v-sidebar.vue'
import VBreadcrumbs from '@/components/layout/v-breadcrumbs.vue'
import VLang from '@/components/layout/v-lang.vue'
import VTheme from '@/components/layout/v-theme.vue'
import VAvatar from '@/components/layout/v-avatar.vue'

const route = useRoute()

watch(
  () => route.path,
  () => {
    const drawer = document.getElementById('sidebar-drawer') as HTMLInputElement | null
    if (drawer) drawer.checked = false
  }
)
</script>

<template>
  <div class="drawer lg:drawer-open">
    <input id="sidebar-drawer" type="checkbox" class="drawer-toggle" />

    <!-- Main content -->
    <div class="drawer-content bg-base-200/30 flex min-h-screen flex-col">
      <!-- Header -->
      <header class="bg-base-100 border-base-300 sticky top-0 z-30 border-b">
        <div class="flex h-14 items-center gap-2 px-4">
          <!-- Hamburger (mobile only) -->
          <label
            for="sidebar-drawer"
            class="btn btn-ghost btn-sm btn-square drawer-button lg:hidden"
          >
            <MenuIcon class="size-5" />
          </label>

          <!-- Breadcrumbs -->
          <div class="flex-1">
            <VBreadcrumbs />
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-1">
            <VLang />
            <VTheme />
            <VAvatar />
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-4 lg:p-6">
        <RouterView />
      </main>
    </div>

    <!-- Sidebar -->
    <div class="drawer-side z-40">
      <label for="sidebar-drawer" class="drawer-overlay"></label>
      <VSidebar />
    </div>
  </div>
</template>
