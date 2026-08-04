<script setup>
import { ref, onMounted } from 'vue'

const settings = ref({
  apiUrl: 'http://43.159.43.50:20128/v1',
  model: 'kr/claude-haiku-4.5',
  apiKey: 'sk-c60b5b633b8ba408-ekg39z-70bf55ae',
  googleClientId: '',
  googleApiKey: '',
  googleAppId: ''
})
const savedMessage = ref('')

onMounted(() => {
  const saved = localStorage.getItem('app_settings')
  if (saved) {
    try {
      settings.value = { ...settings.value, ...JSON.parse(saved) }
    } catch (e) {
      console.error('Failed to parse settings', e)
    }
  }
})

function saveSettings() {
  localStorage.setItem('app_settings', JSON.stringify(settings.value))
  savedMessage.value = 'Settings saved successfully!'
  setTimeout(() => {
    savedMessage.value = ''
  }, 3000)
}
</script>

<template>
  <div class="flex-1 p-8 overflow-y-auto bg-transparent relative z-10 scroll-smooth flex justify-center items-start">
    <div class="w-full max-w-2xl mt-12">
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Configuration</h1>
        <p class="text-zinc-400 mt-3 text-[15px]">Connect your custom LLM and backend endpoints.</p>
      </div>

      <div class="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(34,211,238,0.05)] relative overflow-hidden group">
        <!-- Background Ambient Glow inside the card -->
        <div class="absolute -inset-1 bg-gradient-to-br from-cyan-500/0 via-cyan-500/5 to-indigo-500/10 opacity-50 blur-2xl -z-10 pointer-events-none"></div>

        <div class="space-y-8">
          <!-- API URL -->
          <div class="relative group/input">
            <label class="block text-xs font-bold text-cyan-400/80 uppercase tracking-[0.15em] mb-2 transition-colors group-focus-within/input:text-cyan-400">API Endpoint URL</label>
            <input
              v-model="settings.apiUrl"
              type="text"
              placeholder="http://43.159.43.50:20128/v1"
              class="w-full bg-transparent border-b border-white/20 px-1 py-3 text-[15px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors duration-300"
            />
            <!-- Glowing bottom border highlight -->
            <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-500 group-focus-within/input:w-full"></div>
          </div>

          <!-- LLM Model -->
          <div class="relative group/input">
            <label class="block text-xs font-bold text-cyan-400/80 uppercase tracking-[0.15em] mb-2 transition-colors group-focus-within/input:text-cyan-400">LLM Model Name</label>
            <input
              v-model="settings.model"
              type="text"
              placeholder="kr/claude-haiku-4.5"
              class="w-full bg-transparent border-b border-white/20 px-1 py-3 text-[15px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors duration-300"
            />
            <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-500 group-focus-within/input:w-full"></div>
          </div>

          <!-- API Key -->
          <div class="relative group/input">
            <label class="block text-xs font-bold text-cyan-400/80 uppercase tracking-[0.15em] mb-2 transition-colors group-focus-within/input:text-cyan-400">Authentication Token</label>
            <input
              v-model="settings.apiKey"
              type="password"
              placeholder="sk-..."
              class="w-full bg-transparent border-b border-white/20 px-1 py-3 text-[15px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-colors duration-300"
            />
            <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-500 group-focus-within/input:w-full"></div>
          </div>
        </div>
      </div>

      <div class="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_30px_rgba(34,211,238,0.05)] relative overflow-hidden group mt-8">
        <!-- Background Ambient Glow inside the card -->
        <div class="absolute -inset-1 bg-gradient-to-br from-indigo-500/0 via-indigo-500/5 to-purple-500/10 opacity-50 blur-2xl -z-10 pointer-events-none"></div>

        <div class="mb-6">
          <h2 class="text-xl font-bold text-white tracking-wide">Google Drive Integration</h2>
          <p class="text-zinc-400 text-sm mt-1">Configure credentials for the Google Picker API.</p>
        </div>

        <div class="space-y-8">
          <!-- Google Client ID -->
          <div class="relative group/input">
            <label class="block text-xs font-bold text-indigo-400/80 uppercase tracking-[0.15em] mb-2 transition-colors group-focus-within/input:text-indigo-400">Google Client ID</label>
            <input
              v-model="settings.googleClientId"
              type="text"
              placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
              class="w-full bg-transparent border-b border-white/20 px-1 py-3 text-[15px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            />
            <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)] transition-all duration-500 group-focus-within/input:w-full"></div>
          </div>

          <!-- Google API Key -->
          <div class="relative group/input">
            <label class="block text-xs font-bold text-indigo-400/80 uppercase tracking-[0.15em] mb-2 transition-colors group-focus-within/input:text-indigo-400">Google API Key</label>
            <input
              v-model="settings.googleApiKey"
              type="password"
              placeholder="e.g. AIzaSy..."
              class="w-full bg-transparent border-b border-white/20 px-1 py-3 text-[15px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            />
            <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)] transition-all duration-500 group-focus-within/input:w-full"></div>
          </div>

          <!-- Google App ID -->
          <div class="relative group/input">
            <label class="block text-xs font-bold text-indigo-400/80 uppercase tracking-[0.15em] mb-2 transition-colors group-focus-within/input:text-indigo-400">Google App ID</label>
            <input
              v-model="settings.googleAppId"
              type="text"
              placeholder="e.g. 123456789"
              class="w-full bg-transparent border-b border-white/20 px-1 py-3 text-[15px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-400 transition-colors duration-300"
            />
            <div class="absolute bottom-0 left-0 h-[2px] w-0 bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)] transition-all duration-500 group-focus-within/input:w-full"></div>
          </div>
        </div>
      </div>

        <!-- Action Area -->
        <div class="mt-12 flex items-center justify-between">
          <div class="h-6 flex items-center">
            <span v-if="savedMessage" class="text-cyan-400 text-sm font-bold tracking-wide animate-fade-in-out drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              {{ savedMessage }}
            </span>
          </div>
          <button
            @click="saveSettings"
            class="rounded-2xl bg-cyan-500/20 border border-cyan-500/40 px-8 py-3 text-[15px] font-bold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:bg-cyan-500/30 hover:border-cyan-400/60 hover:text-white transition-all duration-300 focus:outline-none"
          >
            Apply Changes
          </button>
        </div>
      </div>
  </div>
</template>

<style scoped>
.animate-fade-in-out {
  animation: fadeInOut 3s forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
