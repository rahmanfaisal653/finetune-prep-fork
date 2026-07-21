<script setup>
import { ref, onMounted } from 'vue'

const settings = ref({
  apiUrl: 'http://43.159.43.50:20128/v1',
  model: 'kr/claude-haiku-4.5',
  apiKey: 'sk-c60b5b633b8ba408-ekg39z-70bf55ae'
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
  <div class="flex flex-col flex-1 h-full min-w-0 bg-slate-950 p-6 overflow-y-auto">
    <div class="max-w-2xl mx-auto w-full space-y-8 mt-10">
      <div>
        <h1 class="text-3xl font-semibold text-slate-100 tracking-tight">Settings</h1>
        <p class="text-slate-400 mt-2 text-sm">Configure your custom LLM API parameters.</p>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-300">API URL</label>
          <input
            v-model="settings.apiUrl"
            type="text"
            placeholder="http://43.159.43.50:20128/v1"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-300">LLM Model</label>
          <input
            v-model="settings.model"
            type="text"
            placeholder="kr/claude-haiku-4.5"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-300">API Key</label>
          <input
            v-model="settings.apiKey"
            type="password"
            placeholder="sk-..."
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button
          @click="saveSettings"
          class="rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
        >
          Save Settings
        </button>
        <span v-if="savedMessage" class="text-emerald-400 text-sm font-medium animate-fade-in-out">
          {{ savedMessage }}
        </span>
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
