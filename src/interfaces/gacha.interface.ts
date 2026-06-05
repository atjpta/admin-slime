import type { BaseResource } from '@/interfaces/base-resource.interface'
import type { PaginationFilter } from '@/interfaces/pagination.interface'
import type { GachaStatus, DrawType, GachaRewardType, CurrencyCode } from '@/enums/gacha.enum'
import type { ItemRarity, ItemStatus, ItemType } from '@/enums/item.enum'

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

export interface GachaRewardItem {
  _id: string
  code: string
  type: ItemType
  rarity: ItemRarity
  status: ItemStatus
  sellPrice: number
  stackable: boolean
  metadata: Record<string, unknown>
}

export interface Gacha extends BaseResource {
  code: string
  type: GachaRewardType
  status: GachaStatus
  startAt?: string
  endAt?: string
  sortOrder: number
  costs: GachaCost[]
  rarities: GachaRarity[]
  listReward: GachaRewardItem[]
}

export interface GachaFilter extends PaginationFilter {
  status?: GachaStatus
  type?: GachaRewardType
}

export interface UpdateGachaDto {
  status?: GachaStatus
  startAt?: string
  endAt?: string
  sortOrder?: number
}

export interface CreateGachaDto {
  code: string
  type: GachaRewardType
  startAt?: string
  endAt?: string
  sortOrder?: number
}
