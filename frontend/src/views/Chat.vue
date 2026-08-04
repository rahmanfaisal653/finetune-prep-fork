<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const sessions = ref([])
const currentSessionId = ref(null)
const messages = ref([])   // {role, content, sources?}
const input = ref('')
const streaming = ref(false)
const scroller = ref(null)

onMounted(() => {
  const saved = localStorage.getItem('chat_sessions')
  if (saved) {
    try {
      sessions.value = JSON.parse(saved)
    } catch (e) {
      sessions.value = []
    }
  }

  const id = route.query.id
  if (id) {
    loadSession(id)
  } else if (sessions.value.length > 0) {
    router.replace(`/chat?id=${sessions.value[0].id}`)
  } else {
    const newId = Date.now().toString()
    sessions.value.unshift({ id: newId, title: 'New Chat', messages: [] })
    saveSessions()
    router.replace(`/chat?id=${newId}`)
  }
})

watch(
  () => route.query.id,
  (newId) => {
    if (newId) loadSession(newId)
  }
)

function saveSessions() {
  localStorage.setItem('chat_sessions', JSON.stringify(sessions.value))
  window.dispatchEvent(new Event('chat-sessions-updated'))
}

watch(messages, () => {
  const session = sessions.value.find(s => s.id === currentSessionId.value)
  if (session) {
    session.messages = messages.value
    saveSessions()
  }
}, { deep: true })

function loadSession(id) {
  currentSessionId.value = id
  const session = sessions.value.find(s => s.id === id)
  if (session) {
    // Break reference to avoid strange Vue array assignment quirks
    messages.value = JSON.parse(JSON.stringify(session.messages))
    nextTick(scrollDown)
  }
}

async function scrollDown() {
  await nextTick()
  if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
}

async function send() {
  const text = input.value.trim()
  if (!text || streaming.value) return
  input.value = ''
  
  // Set title to the first message if this is a new chat
  const currentSession = sessions.value.find(s => s.id === currentSessionId.value)
  if (currentSession && messages.value.length === 0) {
    currentSession.title = text.length > 30 ? text.substring(0, 30) + '...' : text
    saveSessions()
  }

  messages.value.push({ role: 'user', content: text })

  // history sent to backend: prior turns only (backend builds the RAG prompt)
  const history = messages.value
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(0, -1)
    .map((m) => ({ role: m.role, content: m.content }))

  messages.value.push({ role: 'assistant', content: '', sources: [] })
  const reactiveAssistant = messages.value[messages.value.length - 1]
  
  streaming.value = true
  scrollDown()

  try {
    const appSettings = JSON.parse(localStorage.getItem('app_settings') || '{}')
    
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history, settings: appSettings }),
    })
    if (!res.ok || !res.body) throw new Error(await res.text())

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n\n')
      buffer = parts.pop()
      for (const part of parts) {
        const line = part.replace(/^data: /, '')
        if (line === '[DONE]') continue
        const evt = JSON.parse(line)
        if (evt.sources) reactiveAssistant.sources = evt.sources
        if (evt.delta) reactiveAssistant.content += evt.delta
        scrollDown()
      }
    }
  } catch (e) {
    reactiveAssistant.content = `⚠️ ${e}`
  } finally {
    streaming.value = false
    scrollDown()
  }
}

function uniqueSources(sources) {
  return [...new Set(sources.map((s) => s.file))]
}
</script>

<template>
  <div class="flex flex-col flex-1 h-full min-w-0 bg-transparent relative z-10">
    <div ref="scroller" class="flex-1 overflow-y-auto px-6 py-8 scroll-smooth">
      <div class="max-w-3xl mx-auto space-y-8 pb-20">
        <!-- Empty State -->
        <div v-if="!messages.length" class="flex flex-col items-center justify-center mt-32 opacity-70">
          <div class="w-20 h-20 mb-6 rounded-full bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 shadow-[0_0_30px_rgba(34,211,238,0.2)] border border-cyan-500/30 flex items-center justify-center">
            <svg class="w-10 h-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
          </div>
          <h2 class="text-2xl font-semibold text-white tracking-tight drop-shadow-lg mb-2">How can I help you?</h2>
          <p class="text-zinc-400 text-sm">Ask anything about your uploaded documents.</p>
        </div>

        <!-- Messages -->
        <div v-for="(m, i) in messages" :key="i" class="flex gap-4 group"
             :class="m.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
          
          <!-- Avatar -->
          <div class="w-10 h-10 shrink-0 rounded-full flex items-center justify-center mt-1"
               :class="m.role === 'user' 
                 ? 'bg-zinc-800 border border-zinc-700' 
                 : 'bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]'">
            <svg v-if="m.role === 'user'" class="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <div v-else class="w-4 h-4 bg-white rounded-full"></div>
          </div>

          <!-- Bubble -->
          <div class="max-w-[80%] rounded-3xl px-6 py-4 whitespace-pre-wrap leading-relaxed shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl text-[15px]"
               :class="m.role === 'user'
                 ? 'bg-gradient-to-br from-cyan-600/90 to-indigo-600/90 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-400/30 rounded-tr-sm'
                 : 'bg-white/5 border border-white/10 text-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.3)] rounded-tl-sm'">
            <span v-if="m.content">{{ m.content }}</span>
            <span v-else class="flex space-x-1 items-center h-5">
              <span class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
            </span>
            
            <div v-if="m.sources && m.sources.length"
                 class="mt-4 pt-3 border-t border-white/10 text-xs font-medium text-cyan-200/70 flex gap-2 flex-wrap">
              <span class="text-zinc-500">Sources:</span>
              <span v-for="src in uniqueSources(m.sources)" :key="src" class="px-2 py-1 bg-black/30 rounded-md border border-white/5">
                {{ src }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Input Dock -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-20">
      <div class="flex gap-3 bg-black/40 backdrop-blur-2xl border border-white/10 p-2 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.1)] transition-all duration-300 focus-within:shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(34,211,238,0.2)] focus-within:border-cyan-500/50">
        <textarea
          v-model="input"
          rows="1"
          placeholder="Ask a question..."
          class="flex-1 resize-none bg-transparent px-6 py-4 text-[15px] text-zinc-100 placeholder-zinc-500 focus:outline-none max-h-32"
          @keydown.enter.exact.prevent="send"
        ></textarea>
        <button
          class="shrink-0 w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] disabled:opacity-30 disabled:hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] disabled:hover:bg-cyan-500/20 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:bg-cyan-500/30 hover:text-cyan-100 hover:scale-105 transition-all duration-300 self-end mb-[2px] mr-[2px]"
          :disabled="streaming || !input.trim()"
          @click="send"
        >
          <svg class="w-5 h-5 -ml-0.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m-7 7l7-7 7 7"></path></svg>
        </button>
      </div>
    </div>
  </div>
</template>
