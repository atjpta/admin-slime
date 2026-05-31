import { createRouter, createWebHistory } from 'vue-router'

export const RouteName = {
  Login: 'login',
  Dashboard: 'dashboard',
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
      path: '/dashboard',
      name: RouteName.Dashboard,
      component: () => import('@/pages/dashboard/index.vue'),
    },
  ],
})

export default router
