import 'virtual:uno.css'
import './styles/global.css'
import { createPinia } from 'pinia'
import { createApp, watch } from 'vue'

import App from './App'
import i18n from './i18n'
import router from './router'
import loggerPlugin from './stores/plugins/loggerPlugin'
import { setLevel, setTransport } from './utils/log'

const app = createApp(App)

const pinia = createPinia()
pinia.use(loggerPlugin)
app.use(i18n)
app.use(pinia)
app.use(router)

app.mount('#app')

document.title = i18n.global.t('gameName')
watch(
  () => i18n.global.locale.value,
  () => {
    document.title = i18n.global.t('gameName')
  },
)

// Initialize logging
// DEV: show debug logs, PROD: show only warnings or above
setLevel(import.meta.env.PROD ? 'warn' : 'debug')

// Example transport: for production, logs can be forwarded to a remote service (Sentry/Analytics)
if (import.meta.env.PROD) {
  // setTransport will be used to bridge to Sentry or any other remote service
  setTransport(() => {
    // Placeholder: in future use Sentry.captureMessage or other transports
    // For now, keep it silent or forward to console
    // console.log(`[transport:${level}]`, message, meta)
  })
}
