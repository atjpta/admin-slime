<script setup lang="ts">
import LoginCard from '@/pages/auth/login/components/login-card.vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authService } from '@/services/api/auth.service'
import { setAuthToken } from '@/services/api/base-api.service'
import { parseApiError } from '@/utils/api-error'
import { useRouter } from 'vue-router'
import { RouteName } from '@/router'
import { toast } from 'vue-sonner'

const { t } = useI18n({ useScope: 'global' })

const loading = ref(false)
const router = useRouter()

async function handleLogin(payload: { email: string; password: string }) {
  loading.value = true
  try {
    const { token } = await authService.login(payload)
    setAuthToken(token)
    router.push({ name: RouteName.Dashboard })
  } catch (err) {
    toast.error(parseApiError(err))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-3.5rem)] items-center justify-center pb-20">
    <div class="w-full max-w-sm">
      <!-- Logo / Brand -->
      <div class="mb-8 flex items-center justify-center gap-5">
        <img src="@/assets/logo.png" alt="logo" class="object-cover" />
        <div>
          <h1 class="text-base-content text-2xl font-semibold tracking-tight">
            {{ t('auth.login') }}
          </h1>
          <p class="text-base-content/50 mt-1 text-sm">{{ t('auth.welcomeBack') }}</p>
        </div>
      </div>

      <LoginCard :loading="loading" @submit="handleLogin" />

      <p class="text-base-content/40 mt-6 text-center text-xs">
        © {{ new Date().getFullYear() }} Admin Slime
      </p>
    </div>
  </div>
</template>
