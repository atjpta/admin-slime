import { ref, computed, watch, toValue, nextTick } from 'vue'
import type { MaybeRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVueTable, getCoreRowModel } from '@tanstack/vue-table'
import type { ColumnDef, Table } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { paginationDefault } from '@/constants/pagination.constants'

interface UseDataTableOptions<TData> {
  columns: MaybeRef<ColumnDef<TData, any>[]>
  data: Ref<TData[]>
  /** Tổng số bản ghi từ server (server-side pagination). Nếu không truyền thì không dùng manualPagination. */
  total?: Ref<number>
  initialPageSize?: number
  /** Named filter refs — key = tên URL param, value = ref. Khi thay đổi sẽ tự reset page về 1 và sync URL. */
  filters?: Record<string, Ref<string>>
  /** Callback fetch lại data — gọi khi page/pageSize/search/filters thay đổi */
  onFetch?: () => Promise<void> | void
  /** Thời gian tối thiểu hiện loading (ms), mặc định 500 */
  loadingDelay?: number
}

export function useDataTable<TData>(options: UseDataTableOptions<TData>) {
  const route = useRoute()
  const router = useRouter()

  const filterEntries = Object.entries(options.filters ?? {})
  const filterRefs = filterEntries.map(([, ref]) => ref)

  // Khởi tạo từ URL query
  const page = ref(Number(route.query.page) || paginationDefault.page)
  const pageSize = ref(
    Number(route.query.limit) || (options.initialPageSize ?? paginationDefault.limit)
  )
  const search = ref(String(route.query.search || ''))

  for (const [key, filterRef] of filterEntries) {
    if (route.query[key]) filterRef.value = String(route.query[key])
  }

  // Reset page đồng bộ khi search/filter thay đổi (trước khi fetch watcher chạy)
  watch(
    [search, ...filterRefs],
    () => {
      page.value = 1
    },
    { flush: 'sync' }
  )

  // Sync URL — dùng replace để không tạo history entry mới
  watch([page, pageSize, search, ...filterRefs], () => {
    const query: Record<string, string> = {}
    if (page.value !== paginationDefault.page) query.page = String(page.value)
    if (pageSize.value !== paginationDefault.limit) query.limit = String(pageSize.value)
    if (search.value) query.search = search.value
    for (const [key, filterRef] of filterEntries) {
      if (filterRef.value) query[key] = filterRef.value
    }
    router.replace({ query })
  })

  const loading = ref(false)

  if (options.onFetch) {
    const minDelay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

    const fetch = async () => {
      loading.value = true
      await Promise.all([options.onFetch!(), minDelay(options.loadingDelay ?? 200)])
      loading.value = false
    }

    // nextTick để tránh gọi trước khi caller destructure xong (TDZ)
    watch([page, pageSize, search, ...filterRefs], fetch)
    nextTick(fetch)
  }

  const isServerSide = !!options.total
  const total = options.total ?? computed(() => options.data.value.length)
  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  const table: Table<TData> = useVueTable({
    get data() {
      return options.data.value
    },
    get columns() {
      return toValue(options.columns)
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: isServerSide,
    get pageCount() {
      return pageCount.value
    },
    get state() {
      return {
        pagination: { pageIndex: page.value - 1, pageSize: pageSize.value },
      }
    },
  })

  return { table, page, pageSize, search, total, pageCount, loading }
}
