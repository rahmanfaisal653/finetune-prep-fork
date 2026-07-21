import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Knowledge from './views/Knowledge.vue'
import Chat from './views/Chat.vue'
import Settings from './views/Settings.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/chat' },
    { path: '/knowledge', component: Knowledge },
    { path: '/chat', component: Chat },
    { path: '/settings', component: Settings },
  ],
})

createApp(App).use(router).mount('#app')
