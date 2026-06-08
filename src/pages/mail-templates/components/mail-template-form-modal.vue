<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Languages } from '@lucide/vue'
import VButton from '@/components/ui/btn/v-button.vue'
import { mailTemplateService } from '@/services/api/mail-template.service'
import { parseApiError } from '@/utils/api-error'
import type { MailTemplate } from '@/interfaces/mail.interface'

type Lang = 'vi' | 'en'
const ALL_LANGS: Lang[] = ['vi', 'en']
const LANG_LABEL: Record<Lang, string> = { vi: 'common.langVi', en: 'common.langEn' }

interface Props {
  template: MailTemplate | null
  mode: 'create' | 'edit'
}

const { template, mode } = defineProps<Props>()
const emit = defineEmits<{ close: []; saved: [] }>()

const { t, locale } = useI18n()
const loading = ref(false)
const translatingLang = ref<Lang | null>(null)

const primaryLang = computed(() => locale.value as Lang)
const secondaryLangs = computed(() => ALL_LANGS.filter((l) => l !== primaryLang.value))

const form = ref({
  name: '',
  title: { vi: '', en: '' } as Record<Lang, string>,
  content: { vi: '', en: '' } as Record<Lang, string>,
  expirationDuration: 30,
})

watch(
  () => template,
  (tpl) => {
    if (tpl) {
      form.value = {
        name: tpl.name,
        title: { vi: tpl.title.vi, en: tpl.title.en },
        content: { vi: tpl.content.vi, en: tpl.content.en },
        expirationDuration: tpl.expirationDuration,
      }
    } else {
      form.value = {
        name: '',
        title: { vi: '', en: '' },
        content: { vi: '', en: '' },
        expirationDuration: 30,
      }
    }
  },
  { immediate: true }
)

async function callMyMemory(text: string, from: Lang, to: Lang): Promise<string> {
  if (!text.trim()) return ''
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
  const res = await fetch(url)
  const data = await res.json()
  return data.responseData?.translatedText ?? text
}

async function translateTo(targetLang: Lang) {
  const src = primaryLang.value
  translatingLang.value = targetLang
  try {
    const [translatedTitle, translatedContent] = await Promise.all([
      callMyMemory(form.value.title[src], src, targetLang),
      callMyMemory(form.value.content[src], src, targetLang),
    ])
    form.value.title[targetLang] = translatedTitle
    form.value.content[targetLang] = translatedContent
  } catch {
    toast.error(t('error.unknown'))
  } finally {
    translatingLang.value = null
  }
}

async function submit() {
  loading.value = true
  try {
    const dto = {
      name: form.value.name,
      title: { vi: form.value.title.vi, en: form.value.title.en },
      content: { vi: form.value.content.vi, en: form.value.content.en },
      expirationDuration: form.value.expirationDuration,
    }
    if (mode === 'edit' && template) {
      await mailTemplateService.update(template._id, dto)
      toast.success(t('mailTemplate.edit.success'))
    } else {
      await mailTemplateService.create(dto)
      toast.success(t('mailTemplate.create.success'))
    }
    emit('saved')
    emit('close')
  } catch (err) {
    toast.error(parseApiError(err))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': mode === 'create' || !!template }">
    <div class="modal-box max-w-3xl">
      <h3 class="mb-4 text-lg font-semibold">
        {{ mode === 'edit' ? t('mailTemplate.edit.title') : t('mailTemplate.create.title') }}
      </h3>

      <div class="flex flex-col gap-4">
        <!-- Name + expiration -->
        <div class="flex gap-3">
          <fieldset class="fieldset flex-1">
            <legend class="fieldset-legend">{{ t('mailTemplate.fields.name') }}</legend>
            <input v-model="form.name" type="text" class="input input-bordered w-full" />
          </fieldset>
          <fieldset class="fieldset w-36">
            <legend class="fieldset-legend">
              {{ t('mailTemplate.fields.expirationDuration') }}
            </legend>
            <input
              v-model.number="form.expirationDuration"
              type="number"
              min="1"
              class="input input-bordered w-full"
            />
          </fieldset>
        </div>

        <!-- Language columns: primary left, secondary right -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Primary language -->
          <div class="flex flex-col gap-3">
            <span class="badge badge-primary badge-sm self-start">
              {{ t(LANG_LABEL[primaryLang]) }}
            </span>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('mailTemplate.fields.title') }}</legend>
              <input
                v-model="form.title[primaryLang]"
                type="text"
                class="input input-bordered w-full"
              />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('mailTemplate.fields.content') }}</legend>
              <textarea
                v-model="form.content[primaryLang]"
                class="textarea textarea-bordered w-full"
                rows="5"
              />
            </fieldset>
          </div>

          <!-- Secondary language(s) -->
          <div v-for="lang in secondaryLangs" :key="lang" class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="badge badge-ghost badge-sm">{{ t(LANG_LABEL[lang]) }}</span>
              <VButton
                :icon="Languages"
                class="btn-ghost btn-xs text-primary"
                :loading="translatingLang === lang"
                @click="translateTo(lang)"
              >
                {{ t('common.translate', { lang: t(LANG_LABEL[primaryLang]) }) }}
              </VButton>
            </div>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('mailTemplate.fields.title') }}</legend>
              <input v-model="form.title[lang]" type="text" class="input input-bordered w-full" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('mailTemplate.fields.content') }}</legend>
              <textarea
                v-model="form.content[lang]"
                class="textarea textarea-bordered w-full"
                rows="5"
              />
            </fieldset>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <VButton class="btn-ghost" @click="emit('close')">{{ t('common.cancel') }}</VButton>
        <VButton class="btn-primary" :loading="loading" @click="submit">
          {{ t('common.save') }}
        </VButton>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @submit.prevent="emit('close')">
      <button>close</button>
    </form>
  </dialog>
</template>
