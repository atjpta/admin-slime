import type { BaseResource } from '@/interfaces/base-resource.interface'
import type { PaginationFilter } from '@/interfaces/pagination.interface'
import type { PlayerRole, PlayerStatus } from '@/enums/player.enum'

export interface Player extends BaseResource {
  name: string
  role: PlayerRole
  status: PlayerStatus
  user: { _id: string; email: string }
}

export interface PlayerFilter extends PaginationFilter {
  status?: PlayerStatus
  role?: PlayerRole
}
