<template>
  <div class="flex flex-col gap-6">
    <!-- Info card skeleton -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body p-5">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-start">
          <!-- Avatar -->
          <div class="skeleton size-16 shrink-0 rounded-2xl"></div>
          <!-- Main info -->
          <div class="flex flex-1 flex-col gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <div class="skeleton h-6 w-32 rounded"></div>
              <div class="skeleton h-5 w-16 rounded-full"></div>
              <div class="skeleton h-5 w-16 rounded-full"></div>
            </div>
            <div class="grid grid-cols-2 gap-x-8 gap-y-3 lg:grid-cols-4">
              <div v-for="i in 4" :key="i" class="flex flex-col gap-1">
                <div class="skeleton h-3 w-14 rounded"></div>
                <div class="skeleton h-4 w-24 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs card skeleton -->
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body p-4">
        <!-- Tab bar -->
        <div class="mb-4 flex gap-4 pb-2">
          <div v-for="i in 4" :key="i" class="skeleton h-6 w-20 rounded"></div>
        </div>
        <!-- Content placeholder -->
        <div class="rounded-box border-base-200 border p-4">
          <div class="flex flex-col gap-3">
            <div class="skeleton h-4 w-full rounded"></div>
            <div class="skeleton h-4 w-5/6 rounded"></div>
            <div class="skeleton h-4 w-4/6 rounded"></div>
            <div class="skeleton mt-2 h-4 w-full rounded"></div>
            <div class="skeleton h-4 w-3/4 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
