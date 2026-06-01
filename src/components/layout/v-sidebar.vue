<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LayoutDashboardIcon, UsersIcon, PackageIcon, ShieldIcon, SwordIcon } from '@lucide/vue'
import type { NavItem } from '@/interfaces/nav-item.interface.ts'
import VNavItem from './v-nav-item.vue'
import { RouteName } from '@/router'

const { t } = useI18n()

const NAV: NavItem[] = [
  {
    labelKey: 'nav.dashboard',
    icon: LayoutDashboardIcon,
    routeName: RouteName.Dashboard,
  },
  {
    labelKey: 'nav.userManagement',
    icon: UsersIcon,
    children: [
      {
        labelKey: 'nav.users',
        icon: UsersIcon,
        routeName: RouteName.Users,
      },
      {
        labelKey: 'nav.admins',
        icon: ShieldIcon,
        routeName: RouteName.Admins,
      },
      {
        labelKey: 'nav.players',
        icon: SwordIcon,
        routeName: RouteName.Players,
      },
    ],
  },
  {
    labelKey: 'nav.items',
    icon: PackageIcon,
    routeName: RouteName.Items,
  },
]
</script>

<template>
  <aside class="bg-base-100 border-base-300 flex min-h-full w-72 flex-col border-r">
    <!-- Logo -->
    <div
      class="border-base-300 flex h-14 shrink-0 items-center justify-center gap-2.5 border-b px-4"
    >
      <img src="@/assets/logo.png" alt="logo" class="size-7 rounded-lg object-cover" />
      <span class="text-base-content text-sm font-semibold">{{ t('appName') }}</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto p-2">
      <ul class="menu menu-sm lg:menu-md w-full">
        <VNavItem v-for="item in NAV" :key="item.labelKey" :item="item" />
      </ul>
    </nav>
  </aside>
</template>
