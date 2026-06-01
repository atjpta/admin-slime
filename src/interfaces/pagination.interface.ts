export interface Pagination<T> {
  items: T
  pagination: { total: number; page: number; limit: number }
}

export interface PaginationFilter {
  page: number
  limit: number
  search?: string
}
