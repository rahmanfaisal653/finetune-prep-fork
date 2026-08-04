<script setup>
import { ref, onMounted } from 'vue'

const files = ref([])
const loading = ref(false)
const uploading = ref(false)
const error = ref('')
const dragOver = ref(false)

const googleReady = ref(false)
let tokenClient = null
let pickerApiLoaded = false
let oauthToken = null
async function loadFiles() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/knowledge/files')
    if (!res.ok) throw new Error(await res.text())
    files.value = (await res.json()).files
  } catch (e) {
    error.value = String(e)
  } finally {
    loading.value = false
  }
}

async function uploadFiles(fileList) {
  error.value = ''
  for (const file of fileList) {
    uploading.value = true
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/knowledge/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error(`${file.name}: ${await res.text()}`)
    } catch (e) {
      error.value = String(e)
    }
  }
  uploading.value = false
  await loadFiles()
}

function onPick(e) {
  if (e.target.files.length) uploadFiles([...e.target.files])
  e.target.value = ''
}

function onDrop(e) {
  dragOver.value = false
  if (e.dataTransfer.files.length) uploadFiles([...e.dataTransfer.files])
}

async function remove(name) {
  if (!confirm(`Remove "${name}" from the knowledge base?`)) return
  await fetch(`/api/knowledge/files/${encodeURIComponent(name)}`, { method: 'DELETE' })
  await loadFiles()
}

onMounted(() => {
  loadFiles()
  
  // Load Google APIs
  const script1 = document.createElement('script')
  script1.src = 'https://apis.google.com/js/api.js'
  script1.async = true
  script1.defer = true
  script1.onload = () => gapi.load('picker', () => { pickerApiLoaded = true; checkGoogleReady() })
  document.head.appendChild(script1)

  const script2 = document.createElement('script')
  script2.src = 'https://accounts.google.com/gsi/client'
  script2.async = true
  script2.defer = true
  script2.onload = () => {
    const saved = localStorage.getItem('app_settings')
    let clientId = ''
    if (saved) {
      try {
        clientId = JSON.parse(saved).googleClientId
      } catch(e) {}
    }
    if (clientId) {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        callback: (tokenResponse) => {
          oauthToken = tokenResponse.access_token
          createPicker()
        },
      })
      checkGoogleReady()
    }
  }
  document.head.appendChild(script2)
})

function checkGoogleReady() {
  if (pickerApiLoaded && tokenClient) {
    googleReady.value = true
  }
}

function handleAuthClick() {
  if (tokenClient) {
    tokenClient.requestAccessToken()
  } else {
    error.value = 'Google Client ID is not configured in Settings.'
  }
}

function createPicker() {
  const saved = localStorage.getItem('app_settings')
  let apiKey = '', appId = ''
  if (saved) {
    try {
      const s = JSON.parse(saved)
      apiKey = s.googleApiKey
      appId = s.googleAppId
    } catch(e) {}
  }
  
  if (!apiKey || !appId) {
    error.value = 'Google API Key or App ID is missing in Settings.'
    return
  }

  const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
  view.setMimeTypes('application/pdf,text/plain,text/markdown,application/vnd.google-apps.document')
  
  const picker = new google.picker.PickerBuilder()
    .enableFeature(google.picker.Feature.NAV_HIDDEN)
    .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
    .setAppId(appId)
    .setOAuthToken(oauthToken)
    .addView(view)
    .setDeveloperKey(apiKey)
    .setCallback(pickerCallback)
    .build()
  
  picker.setVisible(true)
}

async function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    const docs = data.docs
    const downloadedFiles = []
    
    error.value = ''
    for (const doc of docs) {
       uploading.value = true
       try {
         const fileId = doc.id
         const name = doc.name
         const mime = doc.mimeType
         
         let fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
         let finalName = name
         
         if (mime === 'application/vnd.google-apps.document') {
           fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`
           finalName = name.endsWith('.txt') ? name : name + '.txt'
         }
         
         const res = await fetch(fetchUrl, {
           headers: { 'Authorization': `Bearer ${oauthToken}` }
         })
         
         if (!res.ok) throw new Error(`Failed to download ${name}`)
         
         const blob = await res.blob()
         const file = new File([blob], finalName, { type: blob.type })
         downloadedFiles.push(file)
       } catch (err) {
         error.value = String(err)
       }
    }
    
    if (downloadedFiles.length) {
      await uploadFiles(downloadedFiles)
    } else {
      uploading.value = false
    }
  }
}
</script>

<template>
  <div class="flex-1 p-8 overflow-y-auto bg-transparent relative z-10 scroll-smooth">
    <div class="max-w-5xl mx-auto">
      <div class="mb-10 flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold mb-3 text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Knowledge Base</h1>
          <p class="text-zinc-400 text-[15px]">
            Upload PDF, TXT, or MD files. They will be chunked, embedded, and instantly available in the RAG store.
          </p>
        </div>
        
        <!-- Google Drive Import Button -->
        <button
          v-if="googleReady"
          @click="handleAuthClick"
          class="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/40 text-blue-100 font-semibold shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.01 2.01L4.69 14.68l3.66 6.35 14.34-24.82L12.01 2.01zM11.66 22.84l-7.32-12.67-3.66 6.35 10.98 19 3.66-6.35-3.66-6.33zM23.32 14.68L16 2.01H8.68l7.32 12.67h7.32z"/>
          </svg>
          Import from Drive
        </button>
      </div>

      <!-- Massive Glowing Drop Zone -->
      <label
        class="block cursor-pointer rounded-[2.5rem] border-[3px] border-dashed p-16 text-center transition-all duration-500 backdrop-blur-xl relative overflow-hidden group"
        :class="dragOver ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.3),inset_0_0_50px_rgba(34,211,238,0.2)] scale-[1.02]' : 'border-white/10 bg-black/20 hover:border-cyan-500/50 hover:bg-white/5 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]'"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="onDrop"
      >
        <!-- Background Glow Element -->
        <div class="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        <input type="file" class="hidden" multiple accept=".pdf,.txt,.md" @change="onPick" />
        
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.1)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] group-hover:bg-cyan-500/20 transition-all duration-500">
          <svg class="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        </div>

        <div class="text-zinc-300 text-xl font-medium tracking-wide">
          <span class="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">Click to browse</span> or drag files here
        </div>
        <div class="text-sm text-cyan-200/50 mt-4 font-semibold tracking-widest uppercase">Supported: PDF · TXT · MD</div>
      </label>

      <!-- Status Indicators -->
      <div v-if="uploading" class="mt-8 flex items-center justify-center gap-3 text-cyan-400 font-medium animate-pulse">
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Processing and indexing files...
      </div>
      <div v-if="error" class="mt-8 rounded-2xl bg-red-500/10 backdrop-blur-md border border-red-500/30 p-4 text-red-400 flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        {{ error }}
      </div>

      <!-- Indexed Files Grid -->
      <div class="mt-16 mb-6 flex items-center justify-between">
        <h2 class="text-sm font-bold text-cyan-400 uppercase tracking-[0.2em] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Indexed Knowledge</h2>
        <div v-if="!loading && files.length" class="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{{ files.length }} Files</div>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="h-24 rounded-2xl bg-white/5 border border-white/5 animate-pulse"></div>
      </div>
      
      <div v-else-if="!files.length" class="flex flex-col items-center justify-center py-12 opacity-50">
        <svg class="w-16 h-16 text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        <div class="text-zinc-400 font-medium">Knowledge base is empty.</div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5 pb-10">
        <div
          v-for="f in files"
          :key="f.name"
          class="group flex items-center justify-between rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 p-5 shadow-lg transition-all duration-300 hover:bg-white/5 hover:border-white/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_15px_rgba(34,211,238,0.1)] relative overflow-hidden"
        >
          <!-- Hover Glow -->
          <div class="absolute -inset-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"></div>

          <div class="flex items-center gap-4 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
               <svg class="w-6 h-6 text-cyan-300 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div class="min-w-0">
              <div class="truncate font-semibold text-white tracking-wide text-[15px] mb-1 group-hover:text-cyan-50 transition-colors">{{ f.name }}</div>
              <div class="flex items-center gap-2">
                <span class="inline-flex w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]"></span>
                <span class="text-xs font-medium text-zinc-400">{{ f.chunks }} semantic chunks</span>
              </div>
            </div>
          </div>
          <button
            class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border hover:border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300 shrink-0 ml-4"
            @click="remove(f.name)"
            title="Remove Document"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
