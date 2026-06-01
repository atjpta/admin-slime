import type { UserStatus } from '@/enums/user.enum'
import type { BaseResource } from '@/interfaces/base-resource.interface'
import type { PaginationFilter } from '@/interfaces/pagination.interface'

export interface User extends BaseResource {
  email: string
  status: UserStatus
}

export interface UserFilter extends PaginationFilter {
  status?: UserStatus
}

export interface UpdateUserBody {
  status?: UserStatus
}
