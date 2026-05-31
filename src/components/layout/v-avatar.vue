<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UserIcon, LogOutIcon } from '@lucide/vue'
import { clearAuthToken } from '@/services/api/base-api.service'
import { RouteName } from '@/router'

const router = useRouter()
const { t } = useI18n()

function logout() {
  clearAuthToken()
  router.push({ name: RouteName.Login })
}
</script>

<template>
  <div class="dropdown dropdown-end">
    <button tabindex="0" class="btn btn-ghost btn-circle">
      <div class="bg-base-300 flex size-8 items-center justify-center rounded-full">
        <UserIcon class="text-base-content/60 size-4" />
      </div>
    </button>
    <ul
      tabindex="0"
      class="dropdown-content bg-base-100 border-base-300 z-50 mt-2 w-44 rounded-xl border p-1 shadow-lg"
    >
      <li>
        <button
          class="hover:bg-base-200 text-error flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors"
          @click="logout"
        >
          <LogOutIcon class="size-4" />
          {{ t('auth.logout') }}
        </button>
      </li>
    </ul>
  </div>
</template>
