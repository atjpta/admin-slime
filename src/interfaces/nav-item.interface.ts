import type { Component } from 'vue'

export interface NavItem {
  labelKey: string
  icon: Component
  routeName?: string
  children?: NavItem[]
}
