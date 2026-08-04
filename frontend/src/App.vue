<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'

const nav = [
  { to: '/knowledge', label: 'Knowledge', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { to: '/chat', label: 'Chat', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { to: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
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

function deleteChat(id) {
  sessions.value = sessions.value.filter(s => s.id !== id)
  localStorage.setItem('chat_sessions', JSON.stringify(sessions.value))
  
  if (route.query.id === id) {
    if (sessions.value.length > 0) {
      router.replace(`/chat?id=${sessions.value[0].id}`)
    } else {
      router.replace('/chat')
    }
  }
}
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center">
    <!-- Animated Orbs (defined in style.css, added here to ensure they exist behind the app) -->
    <div class="orb-1"></div>
    <div class="orb-2"></div>
    <div class="orb-3"></div>
    <div class="noise-overlay"></div>

    <!-- The Main Glass Window -->
    <div class="w-full h-full flex overflow-hidden bg-zinc-950/40 backdrop-blur-3xl relative z-10">
      
      <!-- Sidebar / Navigation -->
      <aside class="w-72 shrink-0 border-r border-white/5 bg-black/20 flex flex-col relative z-20">
        <div class="px-6 py-8 flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-[0_0_15px_rgba(34,211,238,0.5)] flex items-center justify-center">
            <div class="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span class="text-xl font-bold tracking-tight text-white drop-shadow-md">RAG System</span>
        </div>
        
        <div class="px-4 mb-6">
          <button @click="newChat" class="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 px-4 py-3 text-sm font-semibold text-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:border-cyan-400/60 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-indigo-500/20 transition-all duration-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Start New Session
          </button>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 space-y-1">
          <RouterLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden"
            :class="{'text-white': route.path === item.to && item.to !== '/chat', 'text-zinc-400 hover:text-zinc-200': route.path !== item.to || item.to === '/chat'}"
          >
            <!-- Glowing highlight line for active state -->
            <div v-if="route.path === item.to && item.to !== '/chat'" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,1)]"></div>
            <!-- Glass background for active state -->
            <div v-if="route.path === item.to && item.to !== '/chat'" class="absolute inset-0 bg-white/5 border border-white/10 rounded-xl z-[-1]"></div>
            
            <svg class="w-5 h-5 transition-colors duration-300" :class="{'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]': route.path === item.to && item.to !== '/chat'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
            </svg>
            {{ item.label }}
          </RouterLink>

          <!-- History -->
          <div v-if="sessions.length > 0" class="mt-8 mb-3 px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Recent Conversations
          </div>

          <RouterLink
            v-for="s in sessions"
            :key="s.id"
            :to="`/chat?id=${s.id}`"
            class="group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-300 relative overflow-hidden text-zinc-400 hover:text-zinc-200"
            :class="{ 'text-white': route.path === '/chat' && route.query.id === s.id }"
          >
            <div v-if="route.path === '/chat' && route.query.id === s.id" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo-400 rounded-r-full shadow-[0_0_10px_rgba(129,140,248,1)]"></div>
            <div v-if="route.path === '/chat' && route.query.id === s.id" class="absolute inset-0 bg-white/5 border border-white/10 rounded-xl z-[-1]"></div>
            
            <div class="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-zinc-400 transition-colors shrink-0" :class="{'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]': route.path === '/chat' && route.query.id === s.id}"></div>
            <span class="truncate flex-1">{{ s.title }}</span>
            
            <button @click.prevent="deleteChat(s.id)" class="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all shrink-0">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </RouterLink>
        </nav>

        <div class="px-6 py-5 border-t border-white/5 flex items-center justify-between">
          <div class="text-xs text-zinc-500 font-medium">v0.1.0-alpha</div>
          <div class="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 min-w-0 flex flex-col relative bg-gradient-to-br from-black/40 to-black/10">
        <RouterView :key="route.fullPath" />
      </main>
    </div>
  </div>
</template>
