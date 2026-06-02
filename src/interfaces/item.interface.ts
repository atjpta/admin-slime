import type { ItemType, ItemRarity, ItemStatus } from '@/enums/item.enum'
import type { BaseResource } from '@/interfaces/base-resource.interface'
import type { PaginationFilter } from '@/interfaces/pagination.interface'

export interface Item extends BaseResource {
  code: string
  type: ItemType
  rarity: ItemRarity
  status: ItemStatus
  stackable: boolean
  sellPrice: number
  metadata: Record<string, unknown>
}

export interface ItemFilter extends PaginationFilter {
  type?: ItemType
  rarity?: ItemRarity
  status?: ItemStatus
}
