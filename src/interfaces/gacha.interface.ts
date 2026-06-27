import type { BaseResource } from '@/interfaces/base-resource.interface'
import type { PaginationFilter } from '@/interfaces/pagination.interface'
import type { GachaStatus, DrawType, GachaRewardType, CurrencyCode } from '@/enums/gacha.enum'
import type { ItemRarity, ItemType } from '@/enums/item.enum'
import type { Item } from '@/interfaces/item.interface'

export interface UpdateGachaRewardsDto {
  itemCodes?: string[]
  types?: ItemType[]
  rarities?: ItemRarity[]
}

export interface GachaCost {
  currencyCode: CurrencyCode
  amount: number
  drawType: DrawType
}

export interface GachaRarity {
  rarity: ItemRarity
  rate: number
}

export type GachaRewardItem = Item

export interface Gacha extends BaseResource {
  code: string
  type: GachaRewardType
  status: GachaStatus
  startDate?: string
  endDate?: string
  sortOrder: number
  costs: GachaCost[]
  rarities: GachaRarity[]
  listReward: GachaRewardItem[]
}

export interface GachaFilter extends PaginationFilter {
  status?: GachaStatus
  type?: GachaRewardType
}

export interface GachaRewardLog {
  itemId: string
  code: string
  type: ItemType
  rarity: ItemRarity
  metadata: Record<string, unknown>
}

export interface GachaHistoryPlayer {
  _id: string
  name: string
}

export interface GachaHistoryGacha {
  _id: string
  code: string
  type: GachaRewardType
}

export interface GachaHistory {
  _id: string
  player: GachaHistoryPlayer
  gacha: GachaHistoryGacha
  drawType: DrawType
  currencyCode: CurrencyCode
  costAmount: number
  rewards: GachaRewardLog[]
  createdAt: string
}

export interface GachaHistoryFilter extends PaginationFilter {
  drawType?: DrawType
}

export interface UpdateGachaDto {
  status?: GachaStatus
  startDate?: string
  endDate?: string
  sortOrder?: number
}

export interface CreateGachaDto {
  code: string
  type: GachaRewardType
  startDate?: string
  endDate?: string
  sortOrder?: number
}
