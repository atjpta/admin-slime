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

## Detail Page Pattern

Tất cả page detail (route `/<resource>/:id`) phải theo layout này. Tham khảo `src/pages/players/detail/` và `src/pages/gachas/detail/`.

### Cấu trúc file

```
src/pages/<resource>/detail/
├── index.vue                        ← layout + tabs logic
└── components/
    ├── <resource>-info-card.vue     ← full-width info card
    └── <resource>-<section>.vue     ← nội dung từng tab section
```

### Template layout

```vue
<template>
  <div class="flex flex-col gap-6">
    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <template v-else-if="detail">
      <!-- 1. Info card (tên, ID, field, nút edit nếu có — tất cả trong đây) -->
      <ResourceInfoCard :detail="detail" @edit="..." />

      <!-- 2. Tabbed sections -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <div role="tablist" class="tabs tabs-border mb-4">
            <VButton
              v-for="tab in tabs"
              :key="tab.key"
              role="tab"
              class="tab border-0 bg-transparent"
              :class="{ 'tab-active': activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
              <span v-if="'count' in tab" class="badge badge-sm ml-1.5">{{ tab.count }}</span>
            </VButton>
          </div>
          <div class="flex flex-col gap-4">
            <div :class="sectionOrder('tab1')" class="rounded-box border-base-200 border p-4">
              <Tab1Section :detail="detail" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
```

### Script tabs pattern

```ts
type Tab = 'tab1' | 'tab2' | 'tab3'
const activeTab = ref<Tab>('tab1')

const tabs = computed(() => [
  { key: 'tab1' as Tab, label: t('resource.tabs.tab1') },
  { key: 'tab2' as Tab, label: t('resource.tabs.tab2'), count: list.value.length },
])

function sectionOrder(tab: Tab) {
  return activeTab.value === tab ? 'order-first' : 'order-last'
}
```

### Info card pattern

```vue
<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-5">
      <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('resource.columns.field') }}</span>
          <span class="font-medium">{{ detail.field }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

### Info card pattern

Info card chứa tất cả: tên resource, ID mono, các field chính, và nút edit (nếu có). Không có header riêng bên ngoài card.

```vue
<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-5">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-xl font-semibold">{{ detail.name }}</h1>
          <p class="text-base-content/50 font-mono text-sm">{{ detail._id }}</p>
        </div>
        <!-- nút edit nếu có -->
        <VButton :icon="SquarePenIcon" class="btn-primary btn-sm" @click="emit('edit')" />
      </div>
      <!-- grid các field -->
      <div class="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-6">
        <div class="flex flex-col gap-0.5">
          <span class="text-base-content/50 text-xs">{{ t('resource.columns.field') }}</span>
          <span class="font-medium">{{ detail.field }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

### Quy tắc

- **Không** có header riêng ngoài card — tên, ID, nút edit đều nằm trong info card
- **Không** có back button — điều hướng qua sidebar
- **Không** dùng tiêu đề "Chi tiết X" — hiển thị tên/code của chính resource
- Tab section components **không** bọc thêm `card`/`card-body` — root element là `<div class="flex flex-col gap-4">`

---

## Modal Pattern

Mọi `<dialog>` modal phải dùng native dialog API. Tham khảo `src/pages/items/components/item-equipment-modal.vue`.

### Script

```ts
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
defineExpose({ open })   // nếu parent gọi trực tiếp

function open() {
  dialogRef.value?.showModal()
}

function close() {
  emit('close')
  dialogRef.value?.close()
}
```

**Modals controlled bởi data prop** (e.g. `gacha: Gacha | null`):

```ts
watch(() => props.gacha, (g) => {
  if (g) dialogRef.value?.showModal()
})
```

**Modals controlled bởi `open: boolean` prop**:

```ts
watch(() => props.open, (v) => {
  if (v) dialogRef.value?.showModal()
  else dialogRef.value?.close()
})
```

### Template

```vue
<dialog ref="dialog" class="modal">
  <div class="modal-box max-w-lg">
    <!-- X button -->
    <div class="absolute top-3 right-3">
      <VButton class="btn-ghost btn-circle" @click="close"> ✕ </VButton>
    </div>

    <h3 class="mb-4 text-lg font-semibold">{{ title }}</h3>

    <!-- Scrollable content -->
    <div class="-mx-6 max-h-[50dvh] overflow-y-auto px-6">
      <!-- body -->
    </div>

    <!-- Actions NGOÀI scroll container -->
    <div class="modal-action">
      <VButton class="btn-ghost" @click="close">{{ t('common.cancel') }}</VButton>
      <VButton class="btn-primary" @click="submit">{{ t('common.save') }}</VButton>
    </div>
  </div>
</dialog>
```

### Quy tắc

- **Không** dùng `:class="{ 'modal-open': ... }"` — dùng `dialogRef.showModal()` / `dialogRef.close()`
- **Không** có `<form method="dialog" class="modal-backdrop">` — không click-outside-to-close
- `modal-action` luôn nằm **ngoài** scroll container
- Scroll container dùng class `"-mx-6 max-h-[50dvh] overflow-y-auto px-6"` — margin âm để padding của modal-box không bị cộng thêm

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
