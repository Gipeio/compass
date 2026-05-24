<!-- Home screen — project list, import via button or drag & drop anywhere -->
<template>
  <div
    class="page"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <header class="hud">
      <div class="hud-inner">
        <div class="hud-brand">
          <img src="/logo.svg" alt="" class="hud-logo" />
          <span class="hud-title">Compass</span>
        </div>
        <div class="hud-stats">
          <div class="hud-stat">
            <span class="label">PROJECTS</span>
            <span class="value">{{ pad(projects.length) }}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="page-content-wrap">
      <div class="page-content">
        <input ref="fileInput" type="file" accept=".json" multiple class="sr-only" @change="handleFileInput" />

        <div class="section-header">
          <span class="section-title">All projects</span>
          <div style="display:flex; gap:8px; align-items:center;">
            <button class="btn btn-ghost btn-sm" @click="fileInput.click()">⬇ Import</button>
            <button class="btn btn-primary" @click="showCreate = true">+ New project</button>
          </div>
        </div>

        <div v-if="projects.length === 0" class="empty">
          <span class="empty-icon">🧭</span>
          <p class="empty-text">NO PROJECTS YET — CREATE ONE OR DROP A JSON FILE</p>
        </div>

        <div v-else class="card-grid">
          <div
            v-for="(project, i) in projects"
            :key="project.id"
            class="card"
            style="cursor:pointer;"
            @click="$router.push(`/project/${project.id}`)"
          >
            <div class="card-inner">
              <div class="card-top">
                <span class="card-num">{{ pad2(i + 1) }}</span>
                <span class="card-name">{{ project.name }}</span>
              </div>
              <p v-if="project.template?.shortDescription" class="card-desc">
                {{ project.template.shortDescription }}
              </p>
              <div class="card-meta">
                <span class="card-date">{{ formatDate(project.updatedAt) }}</span>
                <span class="card-stages">{{ project.features.length }} stages</span>
              </div>
              <div class="card-actions" @click.stop>
                <button class="btn btn-ghost btn-sm" @click="onExportJson(project)">⬇ JSON</button>
                <button class="btn btn-teal btn-sm" @click="openPrompt(project)">✦ Prompt</button>
                <button class="btn btn-danger btn-sm" @click="confirmDelete(project)">✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Full-page drag overlay -->
    <div v-if="isDragging" class="page-drag-overlay">
      <span class="drop-message">⬇ DROP JSON FILES TO IMPORT</span>
    </div>

    <!-- Create project modal -->
    <div v-if="showCreate" class="overlay" @click.self="showCreate = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">New project</span>
          <button class="btn btn-ghost btn-sm" @click="showCreate = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="field-label" for="new-name">Project name</label>
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
          <button class="btn btn-ghost" @click="showCreate = false">Cancel</button>
          <button class="btn btn-primary" @click="createProject">Create</button>
        </div>
      </div>
    </div>

    <!-- Prompt modal -->
    <div v-if="promptModal.open" class="overlay" @click.self="promptModal.open = false">
      <div class="modal" style="max-width:760px;">
        <div class="modal-header">
          <span class="modal-title">✦ AI Planning Prompt</span>
          <button class="btn btn-ghost btn-sm" @click="promptModal.open = false">✕</button>
        </div>
        <div class="modal-body" style="padding:0;">
          <textarea
            class="textarea"
            readonly
            :value="promptModal.text"
            style="border:none;min-height:360px;font-size:12px;resize:none;background:var(--t-bg-dim-2);color:var(--t-text);"
          ></textarea>
        </div>
        <div class="modal-footer">
          <span v-if="promptModal.copied" class="save-indicator saved" style="margin-right:auto;">● Copied</span>
          <button class="btn btn-ghost" @click="promptModal.open = false">Close</button>
          <button class="btn btn-primary" @click="copyPrompt">⎘ Copy to clipboard</button>
        </div>
      </div>
    </div>

    <!-- Ctrl+S toast -->
    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>

    <!-- Delete confirmation modal -->
    <div v-if="deleteTarget" class="overlay" @click.self="deleteTarget = null">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title danger">Delete project</span>
        </div>
        <div class="modal-body">
          <p>Delete <strong style="color:var(--t-accent); font-family:var(--font-head)">{{ deleteTarget.name }}</strong>? This cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="deleteTarget = null">Cancel</button>
          <button class="btn btn-danger" @click="doDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { dbGetAll, dbSave, dbDelete } from '../composables/useDb.js'
import { exportJson, generatePrompt } from '../composables/useExport.js'

const router = useRouter()

const projects    = ref([])
const showCreate  = ref(false)
const newName     = ref('')
const nameError   = ref(false)
const deleteTarget = ref(null)
const fileInput   = ref(null)
const promptModal = reactive({ open: false, text: '', copied: false })
const toast       = ref('')
let toastTimer    = null

// Drag counter prevents false negatives when crossing child elements
const dragCounter = ref(0)
const isDragging  = computed(() => dragCounter.value > 0)

function onDragEnter(e) {
  if (e.dataTransfer?.types?.includes('Files')) dragCounter.value++
}
function onDragLeave() {
  dragCounter.value = Math.max(0, dragCounter.value - 1)
}
function onDrop(e) {
  dragCounter.value = 0
  handleDrop(e)
}

function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2000)
}

function onKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    showToast('Open a project to export')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  loadProjects()
})
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

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

function confirmDelete(project) { deleteTarget.value = project }

async function doDelete() {
  await dbDelete(deleteTarget.value.id)
  deleteTarget.value = null
  await loadProjects()
}

function onExportJson(project) { exportJson(project) }

function openPrompt(project) {
  promptModal.text   = generatePrompt(project)
  promptModal.copied = false
  promptModal.open   = true
}

async function copyPrompt() {
  await navigator.clipboard.writeText(promptModal.text)
  promptModal.copied = true
  setTimeout(() => { promptModal.copied = false }, 2000)
}

async function handleDrop(e) {
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
