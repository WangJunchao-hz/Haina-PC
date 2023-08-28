import { createApp } from 'vue'
import App from './App.vue'
import router from './routers'
// import { SetHoliday } from './common/utils'
// SetHoliday()
const app = createApp(App)
app.use(router)
app.mount('#app')
