import type { BattleItemType, BattleItemStatus } from '@/enums/battle-item.enum'
import type { BaseResource } from '@/interfaces/base-resource.interface'
import type { PaginationFilter } from '@/interfaces/pagination.interface'

export interface BattleItem extends BaseResource {
  code: string
  type: BattleItemType
  status: BattleItemStatus
  rule: Record<string, unknown>
  weight: number
  note: string
}

export interface BattleItemFilter extends PaginationFilter {
  type?: BattleItemType
  status?: BattleItemStatus
}
