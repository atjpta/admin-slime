import { createRouter, createWebHistory } from 'vue-router'
import type { BreadcrumbItem } from '@/interfaces/breadcrumb-item.interface'

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumbs?: BreadcrumbItem[]
  }
}

export const RouteName = {
  Login: 'login',
  Dashboard: 'dashboard',
  Users: 'users',
  Admins: 'admins',
  Players: 'players',
  Items: 'items',
} as const

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/',
      component: () => import('@/layouts/guest-layout.vue'),
      children: [
        {
          path: 'login',
          name: RouteName.Login,
          component: () => import('@/pages/auth/login/index.vue'),
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/admin-layout.vue'),
      children: [
        {
          path: 'dashboard',
          name: RouteName.Dashboard,
          component: () => import('@/pages/dashboard/index.vue'),
          meta: { breadcrumbs: [{ labelKey: 'nav.dashboard', routeName: RouteName.Dashboard }] },
        },
        {
          path: 'users',
          name: RouteName.Users,
          component: () => import('@/pages/users/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.userManagement' },
              { labelKey: 'nav.users', routeName: RouteName.Users },
            ],
          },
        },
        {
          path: 'admins',
          name: RouteName.Admins,
          component: () => import('@/pages/admins/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.userManagement' },
              { labelKey: 'nav.admins', routeName: RouteName.Admins },
            ],
          },
        },
        {
          path: 'players',
          name: RouteName.Players,
          component: () => import('@/pages/players/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.userManagement' },
              { labelKey: 'nav.players', routeName: RouteName.Players },
            ],
          },
        },
        {
          path: 'items',
          name: RouteName.Items,
          component: () => import('@/pages/items/index.vue'),
          meta: { breadcrumbs: [{ labelKey: 'nav.items', routeName: RouteName.Items }] },
        },
      ],
    },
  ],
})

export default router
