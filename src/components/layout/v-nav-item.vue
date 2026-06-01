<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { NavItem } from '@/interfaces/nav-item.interface'

defineOptions({ name: 'VNavItem' })

const { item } = defineProps<{ item: NavItem }>()

const route = useRoute()
const { t } = useI18n()

const matchedNames = computed(() => new Set(route.matched.map((r) => r.name)))

function isActive(node: NavItem): boolean {
  if (node.routeName) return matchedNames.value.has(node.routeName)
  return node.children?.some((c) => isActive(c)) ?? false
}
</script>

<template>
  <li>
    <details v-if="item.children?.length" open>
      <summary class="rounded-none" :class="{ 'text-primary font-semibold': isActive(item) }">
        <component :is="item.icon" class="size-4 shrink-0" />
        {{ t(item.labelKey) }}
      </summary>
      <ul>
        <VNavItem v-for="child in item.children" :key="child.labelKey" :item="child" />
      </ul>
    </details>
    <RouterLink
      v-else
      :to="{ name: item.routeName }"
      class="rounded-none border-l-2"
      :class="
        isActive(item)
          ? 'border-primary bg-primary/10 text-primary hover:bg-primary/10 focus:bg-primary/10 font-medium'
          : 'border-transparent'
      "
    >
      <component :is="item.icon" class="size-4 shrink-0" />
      {{ t(item.labelKey) }}
    </RouterLink>
  </li>
</template>
