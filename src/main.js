// Entry point — mounts the Vue app with router and global styles
import { createApp } from 'vue'
import router from './router/index.js'
import App from './App.vue'
import './assets/style.css'

createApp(App).use(router).mount('#app')
