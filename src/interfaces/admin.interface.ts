import type { UserStatus } from '@/enums/user.enum'
import type { BaseResource } from '@/interfaces/base-resource.interface'
import type { PaginationFilter } from '@/interfaces/pagination.interface'

export interface Admin extends BaseResource {
  email: string
  status: UserStatus
}

export interface AdminFilter extends PaginationFilter {
  status?: UserStatus
}
