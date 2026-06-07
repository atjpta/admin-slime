# admin-slime

## Stack

- Vite + Vue 3 + TypeScript
- Pinia (stores in `src/stores/`)
- vue-i18n v11 (locales in `src/i18n/locales/`)
- Vue Router 5 (routes in `src/router/`)
- TailwindCSS v4 + DaisyUI v5
- @tanstack/vue-form + Zod v4 (form validation)
- @tanstack/vue-table (table)
- Package manager: **yarn** (không dùng npm)

---

## Cấu trúc thư mục

### Pages

Mỗi page là một **thư mục** đặt theo tên route, chứa `index.vue` và thư mục `components/` riêng.

```
src/pages/
└── <group>/
    └── <page>/
        ├── index.vue           ← entry point của page
        └── components/         ← components chỉ dùng trong page này
            └── <name>.vue
```

Ví dụ:

```
src/pages/
├── auth/
│   └── login/
│       ├── index.vue
│       └── components/
│           └── login-card.vue
└── dashboard/
    └── index.vue
```

> Không đặt file `.vue` ngang hàng với thư mục cùng tên.
> Sai: `auth/login.vue` + `auth/login/` — đúng: chỉ có `auth/login/index.vue`.

### Components dùng chung

Components dùng được ở nhiều nơi (page, layout...) đặt thẳng trong `src/components/`:

```
src/components/
├── lang-switcher.vue       ← feature component dùng chung
├── theme-switcher.vue
└── ui/
    └── <name>/
        └── v-<name>.vue    ← UI primitive (button, modal...)
```

> Chỉ tạo component khi cần reuse. Input đơn giản dùng thẳng `<input>` native + DaisyUI class.

### Layouts

Layout là **file đơn** trong `src/layouts/`, không cần tạo thư mục + `index.vue`.

```
src/layouts/
└── guest-layout.vue
```

#### Quy tắc viết UI component

**Đặt tên:** prefix `v-` (v-button, v-input, v-modal...) để phân biệt với HTML native và DaisyUI class.

**Props và native attrs:**

- Dùng `defineOptions({ inheritAttrs: false })` + `useAttrs()` để tự spread attrs vào đúng element. Nếu không, Vue fallthrough lên root element gây lỗi runtime.
- **Không** dùng `extends HTMLAttributes` hay `extends ButtonHTMLAttributes` — tạo union type quá phức tạp, gây lỗi TS2590.
- Thay vào đó, khai báo **explicit** các native attrs hay dùng ngay trong `interface Props`:

  ```ts
  defineOptions({ inheritAttrs: false })

  interface Props {
    loading?: boolean
    icon?: Component | string
    // native attrs hay dùng
    disabled?: boolean
    type?: string
  }

  const { loading, icon } = defineProps<Props>()
  const attrs = useAttrs()
  ```

- Không khai báo `class` trong Props — để tự đi qua `attrs`, Vue merge với `class` static trên element tự động.
- Khi cần thêm native attr mới: thêm thẳng vào `interface Props`.

- Không định nghĩa `variant`, `size` hay các DaisyUI modifier làm prop — truyền thẳng qua `class`:

  ```vue
  <!-- đúng -->
  <VButton class="btn-primary btn-sm">Lưu</VButton>

  <!-- sai -->
  <VButton variant="primary" size="sm">Lưu</VButton>
  ```

**Loading / disabled:**

- Khi `loading`, dùng `invisible` thay `v-if` để giữ kích thước button không bị thay đổi.
- Spinner dùng `absolute inset-0` đè lên giữa.
- Luôn set `:disabled="(attrs.disabled as boolean) || loading"`.

**Icon:**

- Prop `icon` nhận cả `Component` (lucide, svg component) lẫn `string` (URL ảnh).
- Render `<img>` nếu `typeof icon === 'string'`, ngược lại dùng `<component :is="icon">`.
- Desktop hiện icon + chữ, mobile chỉ hiện icon: wrap text trong `<span class="hidden sm:inline">`.

**Icon library:** dùng `@lucide/vue`.

---

## i18n

Keys được tổ chức theo namespace:

```json
{
  "common": { ... },
  "nav": { ... },
  "auth": { ... }
}
```

- Thêm key vào **cả hai** file `vi.json` và `en.json` cùng lúc.
- Dùng `useI18n()` trong `<script setup>`, gọi `t('namespace.key')` trong template.
- Không hardcode chuỗi tiếng Việt trong template.

---

## Form Validation

Dùng **@tanstack/vue-form** + **Zod v4**. Không dùng adapter — validate thủ công qua `safeParse`.

### Composable

`src/composables/useZodForm.ts` — export `useZodForm()` trả về `fieldValidator(schema)`.

`fieldValidator` nhận Zod schema cho một field, trả về validator function cho TanStack Form. Error code được map sang i18n key trong `validation.*`.

### Cách dùng

```vue
<script setup>
import { useForm } from '@tanstack/vue-form'
import { z } from 'zod'
import { useZodForm } from '@/composables/useZodForm'

const { fieldValidator } = useZodForm()

const form = useForm({
  defaultValues: { email: '', password: '' },
  onSubmit: ({ value }) => console.log(value),
})
</script>

<template>
  <form @submit.prevent="form.handleSubmit">
    <form.Field name="email" :validators="{ onChange: fieldValidator(z.string().min(1).email()) }">
      <template #default="{ field }">
        <input :value="field.state.value" @input="field.handleChange($event.target.value)" />
        <p v-if="field.state.meta.errors[0]">{{ field.state.meta.errors[0] }}</p>
      </template>
    </form.Field>
  </form>
</template>
```

### i18n keys

Error messages nằm trong namespace `validation`:

```json
{
  "validation": {
    "required": "...",
    "email": "...",
    "min": "... {min} ...",
    "max": "... {max} ...",
    "invalid": "..."
  }
}
```

Để thêm rule mới: thêm case vào `issueToI18nKey()` trong `useZodForm.ts` và thêm key tương ứng vào cả `vi.json` và `en.json`.

---

## Table Page Pattern

Mọi page dạng danh sách (list/table) dùng chung pattern sau. Tham khảo `src/pages/users/` làm ví dụ cụ thể.

### Cấu trúc file

```
src/pages/<name>/
├── index.vue                   ← page chính
└── components/
    └── <name>-edit-modal.vue   ← modal edit (nếu có)
```

### Script setup

```ts
// 1. Data
const items = ref<Item[]>([])
const total = ref(0)
const editingItem = ref<Item | null>(null)

// 2. Filter — dùng reactive object, mỗi key tương ứng URL param
const filter = reactive({ status: '' as ItemStatus | '' })

// 3. Columns — computed để react khi đổi ngôn ngữ
const columns = computed<ColumnDef<Item>[]>(() => [
  { accessorKey: 'name', header: t('item.columns.name') },
  {
    accessorKey: 'status',
    header: t('item.columns.status'),
    cell: ({ row }) =>
      h(VStatusBadge, {
        value: row.getValue<string>('status'),
        i18nKey: 'item.status',
        colors: { [ItemStatus.ACTIVE]: 'success' },
      }),
    meta: { align: 'center' },
  },
  {
    id: 'actions',
    header: '',
    meta: { align: 'center', minWidth: 'w-16' },
    cell: ({ row }) =>
      h('div', { class: 'flex justify-center gap-1' }, [
        h(VButton, {
          icon: SquarePenIcon,
          class: 'btn-ghost text-primary',
          onClick: () => (editingItem.value = row.original),
        }),
      ]),
  },
])

// 4. Fetch function — KHÔNG tự quản lý loading, không reset page/filter
async function fetchItems() {
  const res = await itemService.index({
    page: page.value,
    limit: pageSize.value,
    search: search.value || undefined,
    status: filter.status || undefined,
  })
  items.value = res.items
  total.value = res.pagination.total
}

// 5. useDataTable — tự xử lý loading, URL sync, debounce, page reset
const { table, page, pageSize, search, loading } = useDataTable({
  columns,
  data: items,
  total,
  filters: { status: toRef(filter, 'status') }, // key = URL param name
  onFetch: fetchItems,
})
```

### Template

```vue
<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">{{ t('item.title') }}</h1>
        <p class="text-base-content/50 text-sm">{{ t('item.subtitle') }}</p>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body gap-4 p-4">
        <VTableToolbar v-model="search">
          <template #filters>
            <VSelectFilter
              v-model="filter.status"
              :label="t('item.columns.status')"
              :enum-values="ItemStatus"
              i18n-key="item.status"
            />
          </template>
        </VTableToolbar>
        <VTable :table="table" :loading="loading" />
        <VPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </div>
    </div>
  </div>

  <ItemEditModal :item="editingItem" @close="editingItem = null" @updated="fetchItems" />
</template>
```

### Các component tái sử dụng

| Component       | Props chính                                   | Ghi chú                                                          |
| --------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| `VTable`        | `table`, `loading`                            | `meta.align` trên column để căn chỉnh                            |
| `VTableToolbar` | `v-model` (search)                            | Slot `#filters` cho filter thêm, slot default cho action buttons |
| `VPagination`   | `v-model:page`, `v-model:page-size`, `total`  |                                                                  |
| `VSelectFilter` | `v-model`, `label`, `enum-values`, `i18n-key` | Hoặc truyền `options` thủ công                                   |
| `VStatusBadge`  | `value`, `i18n-key`, `colors`                 | `colors`: map value → DaisyUI color name                         |

### i18n namespace cho mỗi resource

```json
{
  "<resource>": {
    "title": "...",
    "subtitle": "...",
    "status": { "active": "...", "inactive": "..." },
    "columns": { "name": "...", "status": "...", "createdAt": "..." },
    "edit": { "title": "...", "success": "..." }
  }
}
```

---

## Quy tắc chung

**Event handler gọi nhiều hàm:** Nếu một event handler cần gọi ≥ 2 hàm, tạo wrapper function trong script thay vì viết inline arrow function trong template.

```vue
<!-- sai -->
@updated="() => { refreshA(); refreshB(); refreshC() }"

<!-- đúng -->
async function onSomethingUpdated() { await Promise.all([refreshA(), refreshB(), refreshC()]) } ...
@updated="onSomethingUpdated"
```

---

### useDataTable — những gì tự xử lý

- **URL sync**: `page`, `limit`, `search` và tất cả `filters` tự ghi/đọc từ `route.query`
- **Loading**: set `loading = true` khi fetch, giữ tối thiểu `loadingDelay` ms (default 200ms)
- **Page reset**: khi `search` hoặc bất kỳ filter nào thay đổi, tự reset `page = 1`
- **Debounce**: search input debounce 400ms tại `VTableToolbar`, filter select là immediate
- **TDZ safe**: `onFetch` được gọi qua `nextTick` để tránh lỗi temporal dead zone
