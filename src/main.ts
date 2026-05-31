import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from '@/i18n'
import router from '@/router'
import App from './App.vue'
import './style.css'
import 'vue-sonner/style.css'
import { LocalStorageKey, localStorageService } from '@/services/local-storage.service.ts'
import { themeChange } from 'theme-change'

// Khởi tạo theme từ localStorage
const savedTheme = localStorageService.get<string>(LocalStorageKey.Theme, 'light')
document.documentElement.setAttribute('data-theme', savedTheme)
themeChange(false)

// Khởi tạo locale từ localStorage
i18n.global.locale.value = localStorageService.get(LocalStorageKey.Locale, 'vi') as 'vi' | 'en'

const app = createApp(App)

app.use(createPinia())
app.use(i18n)
app.use(router)
app.mount('#app')
