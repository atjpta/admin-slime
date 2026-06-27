import { createRouter, createWebHistory } from 'vue-router'
import type { BreadcrumbItem } from '@/interfaces/breadcrumb-item.interface'

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumbs?: BreadcrumbItem[]
  }
}

export enum RouteName {
  Login = 'login',
  Dashboard = 'dashboard',
  Users = 'users',
  Admins = 'admins',
  Players = 'players',
  PlayerDetail = 'player-detail',
  Items = 'items',
  BattleItems = 'battle-items',
  Gachas = 'gachas',
  GachaDetail = 'gacha-detail',
  GachaHistories = 'gacha-histories',
  Mails = 'mails',
  MailDetail = 'mail-detail',
  MailTemplates = 'mail-templates',
  RankConfigs = 'rank-configs',
  RankConfigDetail = 'rank-config-detail',
  RankSessions = 'rank-sessions',
  RankSessionDetail = 'rank-session-detail',
  RankTierConfigs = 'rank-tier-configs',
  RankHallOfFames = 'rank-hall-of-fames',
  CronLogs = 'cron-logs',
  CronLogDetail = 'cron-log-detail',
}

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
          path: 'players/:id',
          name: RouteName.PlayerDetail,
          component: () => import('@/pages/players/detail/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.userManagement' },
              { labelKey: 'nav.players', routeName: RouteName.Players },
              { labelKey: 'player.detail.title' },
            ],
          },
        },
        {
          path: 'items',
          name: RouteName.Items,
          component: () => import('@/pages/items/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.itemManagement' },
              { labelKey: 'nav.items', routeName: RouteName.Items },
            ],
          },
        },
        {
          path: 'battle-items',
          name: RouteName.BattleItems,
          component: () => import('@/pages/battle-items/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.itemManagement' },
              { labelKey: 'nav.battleItems', routeName: RouteName.BattleItems },
            ],
          },
        },
        {
          path: 'gachas',
          name: RouteName.Gachas,
          component: () => import('@/pages/gachas/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.gachaManagement' },
              { labelKey: 'nav.gachas', routeName: RouteName.Gachas },
            ],
          },
        },
        {
          path: 'gachas/:id',
          name: RouteName.GachaDetail,
          component: () => import('@/pages/gachas/detail/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.gachaManagement' },
              { labelKey: 'nav.gachas', routeName: RouteName.Gachas },
              { labelKey: 'gacha.detail.title' },
            ],
          },
        },
        {
          path: 'gacha-histories',
          name: RouteName.GachaHistories,
          component: () => import('@/pages/gacha-histories/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.gachaManagement' },
              { labelKey: 'nav.gachaHistories', routeName: RouteName.GachaHistories },
            ],
          },
        },
        {
          path: 'mails',
          name: RouteName.Mails,
          component: () => import('@/pages/mails/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.mailManagement' },
              { labelKey: 'nav.mails', routeName: RouteName.Mails },
            ],
          },
        },
        {
          path: 'mails/:id',
          name: RouteName.MailDetail,
          component: () => import('@/pages/mails/detail/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.mailManagement' },
              { labelKey: 'nav.mails', routeName: RouteName.Mails },
              { labelKey: 'mail.detail.title' },
            ],
          },
        },
        {
          path: 'mail-templates',
          name: RouteName.MailTemplates,
          component: () => import('@/pages/mail-templates/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.mailManagement' },
              { labelKey: 'nav.mailTemplates', routeName: RouteName.MailTemplates },
            ],
          },
        },
        {
          path: 'rank-configs',
          name: RouteName.RankConfigs,
          component: () => import('@/pages/rank-configs/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.rankManagement' },
              { labelKey: 'nav.rankConfigs', routeName: RouteName.RankConfigs },
            ],
          },
        },
        {
          path: 'rank-configs/:id',
          name: RouteName.RankConfigDetail,
          component: () => import('@/pages/rank-configs/detail/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.rankManagement' },
              { labelKey: 'nav.rankConfigs', routeName: RouteName.RankConfigs },
              { labelKey: 'rankConfig.detail.title' },
            ],
          },
        },
        {
          path: 'rank-sessions',
          name: RouteName.RankSessions,
          component: () => import('@/pages/rank-sessions/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.rankManagement' },
              { labelKey: 'nav.rankSessions', routeName: RouteName.RankSessions },
            ],
          },
        },
        {
          path: 'rank-sessions/:id',
          name: RouteName.RankSessionDetail,
          component: () => import('@/pages/rank-sessions/detail/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.rankManagement' },
              { labelKey: 'nav.rankSessions', routeName: RouteName.RankSessions },
              { labelKey: 'rankSession.detail.title' },
            ],
          },
        },
        {
          path: 'rank-tier-configs',
          name: RouteName.RankTierConfigs,
          component: () => import('@/pages/rank-tier-configs/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.rankManagement' },
              { labelKey: 'nav.rankTierConfigs', routeName: RouteName.RankTierConfigs },
            ],
          },
        },
        {
          path: 'rank-hall-of-fames',
          name: RouteName.RankHallOfFames,
          component: () => import('@/pages/rank-hall-of-fames/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.rankManagement' },
              { labelKey: 'nav.rankHallOfFames', routeName: RouteName.RankHallOfFames },
            ],
          },
        },
        {
          path: 'cron-logs',
          name: RouteName.CronLogs,
          component: () => import('@/pages/cron-logs/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.system' },
              { labelKey: 'nav.cronLogs', routeName: RouteName.CronLogs },
            ],
          },
        },
        {
          path: 'cron-logs/:id',
          name: RouteName.CronLogDetail,
          component: () => import('@/pages/cron-logs/detail/index.vue'),
          meta: {
            breadcrumbs: [
              { labelKey: 'nav.system' },
              { labelKey: 'nav.cronLogs', routeName: RouteName.CronLogs },
              { labelKey: 'cronLog.detail.title' },
            ],
          },
        },
      ],
    },
  ],
})

export default router
