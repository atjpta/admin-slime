import type { Component } from 'vue'

export interface NavItem {
  labelKey: string
  icon: Component
  iconClass?: string
  routeName?: string
  activeFor?: string[]
  children?: NavItem[]
}
