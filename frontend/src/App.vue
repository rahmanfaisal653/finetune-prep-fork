<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'

const nav = [
  { to: '/knowledge', label: 'Knowledge', icon: '📚' },
  { to: '/chat', label: 'Chat', icon: '💬' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

const router = useRouter()
const route = useRoute()
const sessions = ref([])

onMounted(() => {
  const saved = localStorage.getItem('chat_sessions')
  if (saved) {
    try {
      sessions.value = JSON.parse(saved)
    } catch (e) {
      sessions.value = []
    }
  }
  window.addEventListener('chat-sessions-updated', () => {
    const saved = localStorage.getItem('chat_sessions')
    if (saved) {
      sessions.value = JSON.parse(saved)
    }
  })
})

function newChat() {
  const id = Date.now().toString()
  const s = { id, title: 'New Chat', messages: [] }
  sessions.value.unshift(s)
  localStorage.setItem('chat_sessions', JSON.stringify(sessions.value))
  router.push(`/chat?id=${id}`)
}
</script>

<template>
  <div class="flex h-full bg-slate-950 text-slate-100">
    <aside class="w-64 shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">
      <div class="px-5 py-5 text-lg font-semibold tracking-tight">RAG Dashboard</div>
      
      <div class="px-3 mb-4">
        <button @click="newChat" class="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          New Chat
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 space-y-1">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-800"
          :class="{'bg-slate-800 text-white': route.path === item.to && item.to !== '/chat'}"
        >
          <span>{{ item.icon }}</span>{{ item.label }}
        </RouterLink>

        <!-- Sessions list inside the sidebar -->
        <div v-if="sessions.length > 0" class="mt-6 mb-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Chat History
        </div>

        <RouterLink
          v-for="s in sessions"
          :key="s.id"
          :to="`/chat?id=${s.id}`"
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          :class="{ 'bg-slate-800 text-white': route.path === '/chat' && route.query.id === s.id }"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
          <span class="truncate">{{ s.title }}</span>
        </RouterLink>
      </nav>

      <div class="px-5 py-4 border-t border-slate-800 text-xs text-slate-500">Local RAG · Chroma + Haiku</div>
    </aside>

    <main class="flex-1 min-w-0 flex flex-col">
      <RouterView :key="route.fullPath" />
    </main>
  </div>
</template>
