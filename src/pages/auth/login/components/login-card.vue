<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { EyeIcon, EyeOffIcon, LogInIcon } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import { useZodForm } from '@/composables/useZodForm'

const { t } = useI18n()
const { fieldValidator } = useZodForm()

const props = defineProps<{ loading?: boolean }>()
const emit = defineEmits<{
  submit: [{ email: string; password: string }]
}>()

const showPassword = ref(false)

const form = useForm({
  defaultValues: { email: '', password: '' },
  onSubmit: ({ value }) => emit('submit', value),
})
</script>

<template>
  <div class="bg-base-100 rounded-2xl p-6 shadow-sm">
    <form class="space-y-4" @submit.prevent="form.handleSubmit">
      <form.Field
        name="email"
        :validators="{ onChange: fieldValidator(z.string().min(1).email()) }"
      >
        <template #default="{ field }">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('auth.email') }}</legend>
            <input
              :name="field.name"
              :value="field.state.value"
              :id="field.name"
              type="email"
              class="input w-full"
              :class="{ 'input-error': field.state.meta.errors.length }"
              placeholder="you@example.com"
              autocomplete="email"
              @blur="field.handleBlur"
              @input="field.handleChange(($event.target as HTMLInputElement).value)"
            />
            <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
              {{ field.state.meta.errors[0] }}
            </p>
          </fieldset>
        </template>
      </form.Field>

      <form.Field name="password" :validators="{ onChange: fieldValidator(z.string().min(6)) }">
        <template #default="{ field }">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('auth.password') }}</legend>
            <div class="relative">
              <input
                :id="field.name"
                :name="field.name"
                :value="field.state.value"
                :type="showPassword ? 'text' : 'password'"
                class="input w-full pr-10"
                :class="{ 'input-error': field.state.meta.errors.length }"
                placeholder="••••••••"
                autocomplete="current-password"
                @blur="field.handleBlur"
                @input="field.handleChange(($event.target as HTMLInputElement).value)"
              />
              <button
                type="button"
                class="text-base-content/40 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? EyeOffIcon : EyeIcon" class="size-4" />
              </button>
            </div>
            <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
              {{ field.state.meta.errors[0] }}
            </p>
          </fieldset>
        </template>
      </form.Field>

      <VButton
        type="submit"
        class="btn-primary btn-sm w-full"
        :icon="LogInIcon"
        :loading="props.loading"
      >
        {{ t('auth.login') }}
      </VButton>
    </form>
  </div>
</template>
