<script setup>
import { ref, onMounted } from 'vue'

const files = ref([])
const loading = ref(false)
const uploading = ref(false)
const error = ref('')
const dragOver = ref(false)

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

onMounted(loadFiles)
</script>

<template>
  <div class="p-8 overflow-y-auto">
    <h1 class="text-2xl font-semibold mb-1">Knowledge</h1>
    <p class="text-slate-400 mb-6 text-sm">
      Upload PDF, TXT, or MD files. Each is chunked, embedded, and indexed into the RAG store automatically — then available in Chat.
    </p>

    <label
      class="block cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors"
      :class="dragOver ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 hover:border-slate-500'"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <input type="file" class="hidden" multiple accept=".pdf,.txt,.md" @change="onPick" />
      <div class="text-slate-300">
        <span class="font-medium">Click to browse</span> or drag files here
      </div>
      <div class="text-xs text-slate-500 mt-1">PDF · TXT · MD</div>
    </label>

    <div v-if="uploading" class="mt-4 text-sky-400 text-sm">Indexing…</div>
    <div v-if="error" class="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-red-300 text-sm">{{ error }}</div>

    <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mt-8 mb-3">Indexed files</h2>
    <div v-if="loading" class="text-slate-500 text-sm">Loading…</div>
    <div v-else-if="!files.length" class="text-slate-500 text-sm">No files yet.</div>
    <ul v-else class="space-y-2">
      <li
        v-for="f in files"
        :key="f.name"
        class="flex items-center justify-between rounded-lg bg-slate-900 border border-slate-800 px-4 py-3"
      >
        <div class="min-w-0">
          <div class="truncate font-medium">{{ f.name }}</div>
          <div class="text-xs text-slate-500">{{ f.chunks }} chunks</div>
        </div>
        <button
          class="text-slate-500 hover:text-red-400 text-sm shrink-0 ml-4"
          @click="remove(f.name)"
        >Remove</button>
      </li>
    </ul>
  </div>
</template>
