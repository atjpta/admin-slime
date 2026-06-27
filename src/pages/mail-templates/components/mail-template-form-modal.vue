<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { toast } from '@/utils/toast'
import { Languages } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import { mailTemplateService } from '@/services/api/mail-template.service'
import type { MailTemplate } from '@/interfaces/mail.interface'
import { useZodForm } from '@/composables/useZodForm'

type Lang = 'vi' | 'en'
const ALL_LANGS: Lang[] = ['vi', 'en']
const LANG_LABEL: Record<Lang, string> = { vi: 'common.langVi', en: 'common.langEn' }

const emit = defineEmits<{ close: []; saved: [] }>()

const { t, locale } = useI18n()
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const { fieldValidator } = useZodForm()
const currentTemplate = ref<MailTemplate | null>(null)
const isEdit = computed(() => !!currentTemplate.value)
const translatingLang = ref<Lang | null>(null)

const primaryLang = computed(() => locale.value as Lang)
const secondaryLangs = computed(() => ALL_LANGS.filter((l) => l !== primaryLang.value))

const form = useForm({
  defaultValues: {
    name: '',
    titleVi: '',
    titleEn: '',
    contentVi: '',
    contentEn: '',
    expirationDuration: 30,
  },
  onSubmit: async ({ value }) => {
    const dto = {
      name: value.name,
      title: { vi: value.titleVi, en: value.titleEn },
      content: { vi: value.contentVi, en: value.contentEn },
      expirationDuration: value.expirationDuration,
    }
    if (isEdit.value && currentTemplate.value) {
      await mailTemplateService.update(currentTemplate.value._id, dto)
      toast.success(t('mailTemplate.edit.success'))
    } else {
      await mailTemplateService.create(dto)
      toast.success(t('mailTemplate.create.success'))
    }
    emit('saved')
    close()
  },
})

defineExpose({ open })

function open(template?: MailTemplate) {
  currentTemplate.value = template ?? null
  form.reset({
    name: template?.name ?? '',
    titleVi: template?.title.vi ?? '',
    titleEn: template?.title.en ?? '',
    contentVi: template?.content.vi ?? '',
    contentEn: template?.content.en ?? '',
    expirationDuration: template?.expirationDuration ?? 30,
  })
  dialogRef.value?.showModal()
}

async function callMyMemory(text: string, from: Lang, to: Lang): Promise<string> {
  if (!text.trim()) return ''
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
  const res = await fetch(url)
  const data = await res.json()
  return data.responseData?.translatedText ?? text
}

async function translateTo(targetLang: Lang) {
  const src = primaryLang.value
  const srcTitle = src === 'vi' ? form.getFieldValue('titleVi') : form.getFieldValue('titleEn')
  const srcContent = src === 'vi' ? form.getFieldValue('contentVi') : form.getFieldValue('contentEn')
  translatingLang.value = targetLang
  try {
    const [translatedTitle, translatedContent] = await Promise.all([
      callMyMemory(srcTitle, src, targetLang),
      callMyMemory(srcContent, src, targetLang),
    ])
    if (targetLang === 'vi') {
      form.setFieldValue('titleVi', translatedTitle)
      form.setFieldValue('contentVi', translatedContent)
    } else {
      form.setFieldValue('titleEn', translatedTitle)
      form.setFieldValue('contentEn', translatedContent)
    }
  } catch {
    toast.error(t('error.unknown'))
  } finally {
    translatingLang.value = null
  }
}

function close() {
  emit('close')
  dialogRef.value?.close()
}
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box max-w-3xl">
      <div class="absolute top-3 right-3">
        <VButton type="button" class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
      </div>
      <h3 class="mb-4 text-lg font-semibold">
        {{ isEdit ? t('mailTemplate.edit.title') : t('mailTemplate.create.title') }}
      </h3>

      <form @submit.prevent="form.handleSubmit">
        <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
          <div class="flex flex-col gap-4">
            <div class="flex gap-3">
              <form.Field name="name" :validators="{ onChange: fieldValidator(z.string().min(1)) }">
                <template #default="{ field }">
                  <fieldset class="fieldset flex-1">
                    <legend class="fieldset-legend">{{ t('mailTemplate.fields.name') }}</legend>
                    <input
                      :value="field.state.value"
                      type="text"
                      class="input input-bordered w-full"
                      @input="field.handleChange(($event.target as HTMLInputElement).value)"
                      @blur="field.handleBlur()"
                    />
                    <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                      {{ field.state.meta.errors[0] }}
                    </p>
                  </fieldset>
                </template>
              </form.Field>

              <form.Field
                name="expirationDuration"
                :validators="{ onChange: fieldValidator(z.number().min(1)) }"
              >
                <template #default="{ field }">
                  <fieldset class="fieldset w-36">
                    <legend class="fieldset-legend">
                      {{ t('mailTemplate.fields.expirationDuration') }}
                    </legend>
                    <input
                      :value="field.state.value"
                      type="number"
                      min="1"
                      class="input input-bordered w-full"
                      @input="field.handleChange(+($event.target as HTMLInputElement).value)"
                      @blur="field.handleBlur()"
                    />
                    <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                      {{ field.state.meta.errors[0] }}
                    </p>
                  </fieldset>
                </template>
              </form.Field>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Primary language -->
              <div class="flex flex-col gap-3">
                <span class="badge badge-primary badge-sm self-start">
                  {{ t(LANG_LABEL[primaryLang]) }}
                </span>
                <form.Field
                  :name="primaryLang === 'vi' ? 'titleVi' : 'titleEn'"
                  :validators="{ onChange: fieldValidator(z.string().min(1)) }"
                >
                  <template #default="{ field }">
                    <fieldset class="fieldset">
                      <legend class="fieldset-legend">{{ t('mailTemplate.fields.title') }}</legend>
                      <input
                        :value="field.state.value"
                        type="text"
                        class="input input-bordered w-full"
                        @input="field.handleChange(($event.target as HTMLInputElement).value)"
                        @blur="field.handleBlur()"
                      />
                      <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                        {{ field.state.meta.errors[0] }}
                      </p>
                    </fieldset>
                  </template>
                </form.Field>
                <form.Field
                  :name="primaryLang === 'vi' ? 'contentVi' : 'contentEn'"
                  :validators="{ onChange: fieldValidator(z.string().min(1)) }"
                >
                  <template #default="{ field }">
                    <fieldset class="fieldset">
                      <legend class="fieldset-legend">{{ t('mailTemplate.fields.content') }}</legend>
                      <textarea
                        :value="field.state.value"
                        class="textarea textarea-bordered w-full"
                        rows="5"
                        @input="field.handleChange(($event.target as HTMLTextAreaElement).value)"
                        @blur="field.handleBlur()"
                      />
                      <p v-if="field.state.meta.errors[0]" class="text-error mt-1 text-xs">
                        {{ field.state.meta.errors[0] }}
                      </p>
                    </fieldset>
                  </template>
                </form.Field>
              </div>

              <!-- Secondary language(s) -->
              <div
                v-for="lang in secondaryLangs"
                :key="lang"
                class="flex flex-col gap-3"
              >
                <div class="flex items-center justify-between">
                  <span class="badge badge-ghost badge-sm">{{ t(LANG_LABEL[lang]) }}</span>
                  <VButton
                    type="button"
                    :icon="Languages"
                    class="btn-ghost btn-xs text-primary"
                    :loading="translatingLang === lang"
                    @click="translateTo(lang)"
                  >
                    {{ t('common.translate', { lang: t(LANG_LABEL[primaryLang]) }) }}
                  </VButton>
                </div>
                <form.Field :name="lang === 'vi' ? 'titleVi' : 'titleEn'">
                  <template #default="{ field }">
                    <fieldset class="fieldset">
                      <legend class="fieldset-legend">{{ t('mailTemplate.fields.title') }}</legend>
                      <input
                        :value="field.state.value"
                        type="text"
                        class="input input-bordered w-full"
                        @input="field.handleChange(($event.target as HTMLInputElement).value)"
                      />
                    </fieldset>
                  </template>
                </form.Field>
                <form.Field :name="lang === 'vi' ? 'contentVi' : 'contentEn'">
                  <template #default="{ field }">
                    <fieldset class="fieldset">
                      <legend class="fieldset-legend">{{ t('mailTemplate.fields.content') }}</legend>
                      <textarea
                        :value="field.state.value"
                        class="textarea textarea-bordered w-full"
                        rows="5"
                        @input="field.handleChange(($event.target as HTMLTextAreaElement).value)"
                      />
                    </fieldset>
                  </template>
                </form.Field>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <VButton type="button" class="btn-ghost" @click="close">{{ t('common.cancel') }}</VButton>
          <VButton type="submit" class="btn-primary" :loading="form.state.isSubmitting">
            {{ t('common.save') }}
          </VButton>
        </div>
      </form>
    </div>
  </dialog>
</template>
