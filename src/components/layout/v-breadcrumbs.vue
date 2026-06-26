<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const crumbs = computed(() =>
  (route.meta.breadcrumbs ?? []).map((item) => ({
    label: t(item.labelKey),
    routeName: item.routeName,
  }))
)
</script>

<template>
  <div class="breadcrumbs py-0 text-sm">
    <ul>
      <li v-for="(crumb, i) in crumbs" :key="crumb.label">
        <RouterLink
          v-if="crumb.routeName && i < crumbs.length - 1"
          :to="{ name: crumb.routeName }"
          class="text-base-content/50 hover:text-base-content"
        >
          {{ crumb.label }}
        </RouterLink>
        <span
          v-else
          :class="
            i === crumbs.length - 1 ? 'text-base-content font-medium' : 'text-base-content/50'
          "
        >
          {{ crumb.label }}
        </span>
      </li>
    </ul>
  </div>
</template>
