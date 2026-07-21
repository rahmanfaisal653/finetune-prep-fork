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
  <div class="flex flex-col flex-1 h-full min-w-0 bg-slate-950">
    <div ref="scroller" class="flex-1 overflow-y-auto px-6 py-6">
      <div class="max-w-3xl mx-auto space-y-6">
        <div v-if="!messages.length" class="text-center text-slate-500 mt-20">
          <div class="text-4xl mb-3">💬</div>
          Ask anything about your uploaded documents.
        </div>

        <div v-for="(m, i) in messages" :key="i" class="flex gap-3"
             :class="m.role === 'user' ? 'justify-end' : 'justify-start'">
          <div class="max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed"
               :class="m.role === 'user'
                 ? 'bg-sky-600 text-white'
                 : 'bg-slate-800 text-slate-100'">
            <span v-if="m.content">{{ m.content }}</span>
            <span v-else class="text-slate-400 animate-pulse">…</span>
            <div v-if="m.sources && m.sources.length"
                 class="mt-3 pt-2 border-t border-slate-700 text-xs text-slate-400">
              Sources: {{ uniqueSources(m.sources).join(', ') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-slate-800 bg-slate-900 px-6 py-4">
      <div class="max-w-3xl mx-auto flex gap-2">
        <textarea
          v-model="input"
          rows="1"
          placeholder="Message…"
          class="flex-1 resize-none rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm focus:outline-none focus:border-sky-500"
          @keydown.enter.exact.prevent="send"
        ></textarea>
        <button
          class="rounded-xl bg-sky-600 px-5 font-medium text-white disabled:opacity-40 hover:bg-sky-500"
          :disabled="streaming || !input.trim()"
          @click="send"
        >Send</button>
      </div>
    </div>
  </div>
</template>
