<!-- Home screen — project list, import via drag & drop, create new project -->
<template>
  <div class="page">
    <header class="hud">
      <div class="hud-brand">
        <img src="/favicon.svg" alt="" class="hud-logo" />
        <span class="hud-title">COMPASS</span>
      </div>
      <div class="hud-stats">
        <div class="hud-stat">
          <span class="label">PROJECTS</span>
          <span class="value">{{ pad(projects.length) }}</span>
        </div>
      </div>
    </header>

    <div class="page-content">
      <!-- Import zone -->
      <div
        class="drop-zone"
        :class="{ active: isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInput.click()"
      >
        <span class="icon">⬇</span>
        <span class="label">DROP JSON FILES TO IMPORT</span>
        <span class="sub">or click to browse</span>
      </div>
      <input ref="fileInput" type="file" accept=".json" multiple class="sr-only" @change="handleFileInput" />

      <!-- Project list -->
      <div class="section-header">
        <span class="section-title">— MY PROJECTS —</span>
        <button class="btn btn-primary" @click="showCreate = true">▶ NEW PROJECT</button>
      </div>

      <div class="ground"></div>

      <div v-if="projects.length === 0" class="empty">
        <span class="empty-icon">🗺</span>
        <p class="empty-text">NO PROJECTS YET — START A NEW QUEST</p>
      </div>

      <div v-else class="card-grid">
        <div
          v-for="(project, i) in projects"
          :key="project.id"
          class="card"
        >
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="card-num">{{ pad2(i + 1) }}</span>
            <span class="card-name">{{ project.name }}</span>
          </div>
          <div class="card-meta">
            <span class="card-date">{{ formatDate(project.updatedAt) }}</span>
            <span class="card-stages">{{ project.features.length }} STAGES</span>
          </div>
          <div class="card-actions">
            <button class="btn btn-primary btn-sm" @click="$router.push(`/project/${project.id}`)">▶ OPEN</button>
            <button class="btn btn-ghost btn-sm" @click="onExportJson(project)">⬇ JSON</button>
            <button class="btn btn-danger btn-sm" @click="confirmDelete(project)">✕</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create project modal -->
    <div v-if="showCreate" class="overlay" @click.self="showCreate = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">NEW PROJECT</span>
          <button class="btn btn-ghost btn-sm" @click="showCreate = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="field-label" for="new-name">PROJECT NAME</label>
            <input
              id="new-name"
              v-model="newName"
              class="input"
              :class="{ error: nameError }"
              type="text"
              placeholder="My Awesome Project"
              @keydown.enter="createProject"
            />
            <p v-if="nameError" class="field-error">Name is required</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showCreate = false">CANCEL</button>
          <button class="btn btn-primary" @click="createProject">▶ CREATE</button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="deleteTarget" class="overlay" @click.self="deleteTarget = null">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title danger">⚠ DELETE PROJECT</span>
        </div>
        <div class="modal-body">
          <p>Delete <strong>{{ deleteTarget.name }}</strong>? This cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="deleteTarget = null">CANCEL</button>
          <button class="btn btn-danger" @click="doDelete">✕ DELETE</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { dbGetAll, dbSave, dbDelete } from '../composables/useDb.js'
import { exportJson } from '../composables/useExport.js'

const router = useRouter()

const projects   = ref([])
const showCreate = ref(false)
const newName    = ref('')
const nameError  = ref(false)
const deleteTarget = ref(null)
const isDragging = ref(false)
const fileInput  = ref(null)

onMounted(loadProjects)

async function loadProjects() {
  const all = await dbGetAll()
  projects.value = all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

async function createProject() {
  if (!newName.value.trim()) { nameError.value = true; return }
  nameError.value = false
  const project = emptyProject(newName.value.trim())
  await dbSave(project)
  newName.value = ''
  showCreate.value = false
  router.push(`/project/${project.id}`)
}

function confirmDelete(project) {
  deleteTarget.value = project
}

async function doDelete() {
  await dbDelete(deleteTarget.value.id)
  deleteTarget.value = null
  await loadProjects()
}

function onExportJson(project) {
  exportJson(project)
}

async function handleDrop(e) {
  isDragging.value = false
  await importFiles(e.dataTransfer.files)
}

async function handleFileInput(e) {
  await importFiles(e.target.files)
  e.target.value = ''
}

async function importFiles(files) {
  for (const file of files) {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data.id || !data.name) continue
      await dbSave(data)
    } catch { /* skip malformed files */ }
  }
  await loadProjects()
}

function emptyProject(name) {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    template: {
      shortDescription: '',
      problem: '',
      solution: '',
      techStack: { frontend: '', backend: '', database: '', hosting: '', externalTools: [] },
      keyObjectives: [],
      scopeExclusions: [],
      deadline: '',
      team: '',
      budget: '',
      successMetrics: '',
    },
    features: [],
  }
}

const pad  = (n) => String(n).padStart(3, '0')
const pad2 = (n) => String(n).padStart(2, '0')

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
