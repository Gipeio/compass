<!-- Root shell — 3-panel app (no router): projects sidebar | stages list | template / stage editor -->
<template>
  <div
    class="app"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <!-- ── ASCII header — replaces HUD ─────────────────────── -->
    <header class="app-header-section">
      <pre class="app-ascii-title"> ██████╗  ██████╗ ███╗   ███╗██████╗  █████╗ ███████╗███████╗
██╔════╝██╔═══██╗████╗ ████║██╔══██╗██╔══██╗██╔════╝██╔════╝
██║     ██║   ██║██╔████╔██║██████╔╝███████║███████╗███████╗
██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██╔══██║╚════██║╚════██║
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ██║  ██║███████║███████║
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝</pre>
      <div class="app-ascii-sub">project planner · {{ projects.length }} project{{ projects.length !== 1 ? 's' : '' }}{{ activeProject ? ' · ' + activeProject.features.length + ' stage' + (activeProject.features.length !== 1 ? 's' : '') : '' }} — v0.1</div>
    </header>

    <!-- ── 3-panel body ─────────────────────────────────────── -->
    <div class="app-body">

      <!-- LEFT: project list ─────────────────────────────────── -->
      <div class="app-sidebar">
        <div class="panel-header">
          <span class="panel-title">Projects</span>
          <button class="btn btn-primary btn-sm" @click="showCreate = true">+</button>
        </div>

        <input ref="fileInput" type="file" accept=".json" multiple class="sr-only" @change="handleFileInput" />
        <div class="sidebar-actions">
          <button class="btn btn-ghost btn-sm sidebar-import" @click="fileInput.click()">⬇ Import</button>
        </div>

        <div v-if="projects.length === 0" class="panel-empty">
          <img src="/logo.svg" class="empty-logo" alt="" />
          <p class="empty-text">NO PROJECTS</p>
        </div>

        <div v-else class="project-list">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-item"
            :class="{ active: activeProject?.id === project.id }"
            @click="selectProject(project)"
          >
            <span class="project-item-name">{{ project.name }}</span>
          </div>
        </div>
      </div>

      <!-- MIDDLE: stages list ────────────────────────────────── -->
      <div class="app-middle">
        <template v-if="activeProject">
          <div class="panel-header">
            <span class="panel-title">Stages</span>
            <button class="btn btn-primary btn-sm" @click="addNewStage">+</button>
          </div>

          <div v-if="activeProject.features.length === 0" class="panel-empty">
            <span class="empty-icon">◈</span>
            <p class="empty-text">NO STAGES YET</p>
          </div>

          <div v-else class="stage-list">
            <div
              v-for="(stage, i) in sortedFeatures"
              :key="stage.id"
              class="stage-item"
              :class="{ active: selectedStageId === stage.id && rightPanel === 'stage' }"
              @click="selectStage(stage)"
            >
              <span class="stage-item-num">{{ pad2(i + 1) }}</span>
              <span class="stage-item-title">{{ stage.title || '—' }}</span>
              <span class="badge" :class="`badge-${stage.versionFlag}`">{{ stage.versionFlag }}</span>
              <button
                class="stage-item-delete btn btn-ghost btn-sm"
                @click.stop="confirmDeleteStage(stage)"
              >✕</button>
            </div>
          </div>
        </template>

        <div v-else class="panel-empty" style="padding-top:60px;">
          <span class="empty-icon" style="font-size:18px;">◂</span>
          <p class="empty-text">SELECT A PROJECT</p>
        </div>
      </div>

      <!-- RIGHT: template form or stage editor ─────────────── -->
      <div class="app-reading">

        <!-- Template form -->
        <template v-if="activeProject && rightPanel === 'template'">
          <div class="reading-header">
            <span class="reading-project-name">{{ activeProject.name }}</span>
            <span class="save-indicator" :class="{ saved: saveStatus === 'saved' }">
              {{ saveStatus === 'saved' ? '● SAVED' : saveStatus === 'saving' ? '… SAVING' : '' }}
            </span>
          </div>

          <div class="reading-body">
            <div class="form-section">
              <div class="form-section-header"><span class="form-section-title">01 · Basic info</span></div>
              <div class="form-section-body">
                <div class="form-group">
                  <label class="field-label" for="p-name">Project name *</label>
                  <input id="p-name" v-model="activeProject.name" class="input" type="text" placeholder="My Awesome Project" />
                </div>
                <div class="form-group">
                  <label class="field-label" for="p-desc">Short description *</label>
                  <textarea id="p-desc" v-model="activeProject.template.shortDescription" class="textarea" placeholder="A platform for… (1–2 sentences)"></textarea>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-header"><span class="form-section-title">02 · Problem & solution</span></div>
              <div class="form-section-body">
                <div class="form-group">
                  <label class="field-label" for="p-problem">What problem does it solve? *</label>
                  <textarea id="p-problem" v-model="activeProject.template.problem" class="textarea" placeholder="Users find it difficult to…"></textarea>
                </div>
                <div class="form-group">
                  <label class="field-label" for="p-solution">How does it solve it? *</label>
                  <textarea id="p-solution" v-model="activeProject.template.solution" class="textarea" placeholder="We create a tool that…"></textarea>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-header"><span class="form-section-title">03 · Tech stack</span></div>
              <div class="form-section-body">
                <div class="form-row">
                  <div class="form-group">
                    <label class="field-label" for="ts-fe">Frontend</label>
                    <input id="ts-fe" v-model="activeProject.template.techStack.frontend" class="input" type="text" placeholder="Vue 3, React, vanilla…" />
                  </div>
                  <div class="form-group">
                    <label class="field-label" for="ts-be">Backend</label>
                    <input id="ts-be" v-model="activeProject.template.techStack.backend" class="input" type="text" placeholder="Node.js, Go, Python…" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="field-label" for="ts-db">Database</label>
                    <input id="ts-db" v-model="activeProject.template.techStack.database" class="input" type="text" placeholder="PostgreSQL, SQLite…" />
                  </div>
                  <div class="form-group">
                    <label class="field-label" for="ts-host">Hosting / infra</label>
                    <input id="ts-host" v-model="activeProject.template.techStack.hosting" class="input" type="text" placeholder="Vercel, Railway, VPS…" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="field-label" for="ts-ext">External tools</label>
                  <input
                    id="ts-ext"
                    :value="activeProject.template.techStack.externalTools.join(', ')"
                    class="input"
                    type="text"
                    placeholder="Stripe, Auth0, SendGrid…"
                    @change="activeProject.template.techStack.externalTools = parseList($event.target.value, ',')"
                  />
                  <p class="field-hint">Comma-separated</p>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-header"><span class="form-section-title">04 · Scope</span></div>
              <div class="form-section-body">
                <div class="form-group">
                  <label class="field-label" for="p-obj">Key objectives (3–5)</label>
                  <textarea
                    id="p-obj"
                    :value="activeProject.template.keyObjectives.join('\n')"
                    class="textarea"
                    placeholder="Get 100 users in the first month&#10;Reduce setup time to under 5 minutes"
                    @change="activeProject.template.keyObjectives = parseList($event.target.value)"
                  ></textarea>
                  <p class="field-hint">One per line</p>
                </div>
                <div class="form-group">
                  <label class="field-label" for="p-excl">Scope exclusions</label>
                  <textarea
                    id="p-excl"
                    :value="activeProject.template.scopeExclusions.join('\n')"
                    class="textarea"
                    placeholder="No mobile app for v1&#10;No Slack integration for v1"
                    @change="activeProject.template.scopeExclusions = parseList($event.target.value)"
                  ></textarea>
                  <p class="field-hint">One per line</p>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-header"><span class="form-section-title">05 · Constraints</span></div>
              <div class="form-section-body">
                <div class="form-row">
                  <div class="form-group">
                    <label class="field-label" for="p-deadline">Approximate deadline</label>
                    <input id="p-deadline" v-model="activeProject.template.deadline" class="input" type="text" placeholder="2024-12-31 or Q1 2025" />
                  </div>
                  <div class="form-group">
                    <label class="field-label" for="p-team">Team</label>
                    <input id="p-team" v-model="activeProject.template.team" class="input" type="text" placeholder="solo" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="field-label" for="p-budget">Budget / resources</label>
                  <input id="p-budget" v-model="activeProject.template.budget" class="input" type="text" placeholder="Limited personal budget" />
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-header"><span class="form-section-title">06 · Success metrics *</span></div>
              <div class="form-section-body">
                <div class="form-group">
                  <label class="field-label" for="p-metrics">How do we know it's good?</label>
                  <textarea id="p-metrics" v-model="activeProject.template.successMetrics" class="textarea" placeholder="KPI: 100 active users. Feedback: 4+ stars average."></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="reading-footer">
            <button class="btn btn-ghost btn-sm" @click="onExportJson">⬇ JSON</button>
            <button class="btn btn-ghost btn-sm" @click="onExportMarkdown">⬇ Markdown</button>
            <button class="btn btn-primary btn-sm" @click="openPromptModal">✦ Prompt</button>
            <button class="btn btn-danger btn-sm" style="margin-left:auto;" @click="confirmDeleteProject(activeProject)">✕ Delete</button>
          </div>
        </template>

        <!-- Stage editor -->
        <template v-else-if="activeProject && rightPanel === 'stage' && selectedStage">
          <div class="reading-header">
            <button class="btn btn-ghost btn-sm" @click="rightPanel = 'template'">◄ Template</button>
            <span class="save-indicator" :class="{ saved: saveStatus === 'saved' }">
              {{ saveStatus === 'saved' ? '● SAVED' : saveStatus === 'saving' ? '… SAVING' : '' }}
            </span>
          </div>

          <div class="reading-body">
            <div class="form-section">
              <div class="form-section-header"><span class="form-section-title">Stage details</span></div>
              <div class="form-section-body">
                <div class="form-group">
                  <label class="field-label" for="s-title">Title *</label>
                  <input id="s-title" v-model="selectedStage.title" class="input" type="text" placeholder="User authentication" />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="field-label" for="s-version">Version flag</label>
                    <select id="s-version" v-model="selectedStage.versionFlag" class="select">
                      <option value="demo">demo</option>
                      <option value="v1">v1</option>
                      <option value="v2">v2</option>
                      <option value="v3">v3</option>
                      <option value="undetermined">undetermined</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label class="field-label" for="s-desc">Description *</label>
                  <textarea id="s-desc" v-model="selectedStage.description" class="textarea" placeholder="What this stage delivers…"></textarea>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-header"><span class="form-section-title">Acceptance criteria</span></div>
              <div class="form-section-body">
                <div class="form-group">
                  <textarea
                    :value="selectedStage.acceptanceCriteria.join('\n')"
                    class="textarea"
                    placeholder="User can sign up with email&#10;Password must be at least 8 characters"
                    @change="selectedStage.acceptanceCriteria = parseList($event.target.value)"
                  ></textarea>
                  <p class="field-hint">One per line</p>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-header"><span class="form-section-title">Dependencies</span></div>
              <div class="form-section-body">
                <div v-if="otherStages.length === 0" style="font-size:12px; color:var(--t-muted-2);">No other stages to depend on.</div>
                <div v-else class="check-list">
                  <label
                    v-for="s in otherStages"
                    :key="s.id"
                    class="check-item"
                  >
                    <input
                      type="checkbox"
                      :checked="selectedStage.dependencies.includes(s.id)"
                      @change="toggleDependency(s.id, $event.target.checked)"
                    />
                    {{ s.title || '(untitled)' }}
                  </label>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-header"><span class="form-section-title">Technical notes</span></div>
              <div class="form-section-body">
                <div class="form-group">
                  <textarea v-model="selectedStage.technicalNotes" class="textarea" placeholder="Implementation notes, API contracts, caveats…"></textarea>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Nothing selected -->
        <div v-else class="reading-empty">
          <img src="/logo.svg" class="empty-logo empty-logo--lg" alt="" />
          <p class="empty-text">SELECT OR CREATE A PROJECT</p>
        </div>

      </div><!-- /app-reading -->
    </div><!-- /app-body -->

    <!-- ── Drag overlay ─────────────────────────────────────── -->
    <div v-if="isDragging" class="page-drag-overlay">
      <span class="drop-message">⬇ DROP JSON FILES TO IMPORT</span>
    </div>

    <!-- ── Create project modal ─────────────────────────────── -->
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

    <!-- ── Prompt modal ─────────────────────────────────────── -->
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
            style="border:none;border-radius:0;min-height:360px;font-size:12px;resize:none;background:var(--t-bg-dim-2);color:var(--t-text);"
          ></textarea>
        </div>
        <div class="modal-footer">
          <span v-if="promptModal.copied" class="save-indicator saved" style="margin-right:auto;">● COPIED</span>
          <button class="btn btn-ghost" @click="promptModal.open = false">Close</button>
          <button class="btn btn-primary" @click="copyPrompt">⎘ Copy to clipboard</button>
        </div>
      </div>
    </div>

    <!-- ── Delete project confirmation ─────────────────────── -->
    <div v-if="deleteProjectTarget" class="overlay" @click.self="deleteProjectTarget = null">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title danger">Delete project</span>
        </div>
        <div class="modal-body">
          <p>Delete <strong style="color:var(--t-accent); font-family:var(--font-head)">{{ deleteProjectTarget.name }}</strong>? This cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="deleteProjectTarget = null">Cancel</button>
          <button class="btn btn-danger" @click="doDeleteProject">Delete</button>
        </div>
      </div>
    </div>

    <!-- ── Delete stage confirmation ────────────────────────── -->
    <div v-if="deleteStageTarget" class="overlay" @click.self="deleteStageTarget = null">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title danger">Delete stage</span>
        </div>
        <div class="modal-body">
          <p>Delete <strong style="font-family:var(--font-head)">{{ deleteStageTarget.title || '(untitled)' }}</strong>? This cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="deleteStageTarget = null">Cancel</button>
          <button class="btn btn-danger" @click="doDeleteStage">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { dbGetAll, dbSave, dbDelete } from './composables/useDb.js'
import { exportJson, exportMarkdown, generatePrompt } from './composables/useExport.js'

// ── State ──────────────────────────────────────────────────────

const projects            = ref([])
const activeProject       = ref(null)
const selectedStageId     = ref(null)
const rightPanel          = ref('template') // 'template' | 'stage'

const showCreate          = ref(false)
const newName             = ref('')
const nameError           = ref(false)
const fileInput           = ref(null)
const deleteProjectTarget = ref(null)
const deleteStageTarget   = ref(null)
const promptModal         = reactive({ open: false, text: '', copied: false })

const dragCounter = ref(0)
const isDragging  = computed(() => dragCounter.value > 0)

const VERSION_ORDER = ['demo', 'v1', 'v2', 'v3', 'undetermined']

const sortedFeatures = computed(() =>
  [...(activeProject.value?.features ?? [])].sort(
    (a, b) => VERSION_ORDER.indexOf(a.versionFlag) - VERSION_ORDER.indexOf(b.versionFlag)
  )
)

// selectedStage is a live reference into activeProject.features — mutations auto-save via the deep watcher
const selectedStage = computed(() => {
  if (!activeProject.value || !selectedStageId.value) return null
  return activeProject.value.features.find(f => f.id === selectedStageId.value) ?? null
})

const otherStages = computed(() => {
  if (!activeProject.value || !selectedStageId.value) return []
  return activeProject.value.features.filter(f => f.id !== selectedStageId.value)
})

// ── Auto-save ──────────────────────────────────────────────────

const saveStatus = ref('')
let saveTimer    = null
// Track which project ID was last loaded to skip the watcher fire on project switch
let _loadedId    = null

watch(
  activeProject,
  (val) => {
    if (!val) return
    // Project switched — register new ID, don't trigger a save
    if (val.id !== _loadedId) {
      _loadedId = val.id
      return
    }
    saveStatus.value = 'saving'
    clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      const snapshot = JSON.parse(JSON.stringify(val))
      snapshot.updatedAt = new Date().toISOString()
      await dbSave(snapshot)
      saveStatus.value = 'saved'
      setTimeout(() => { saveStatus.value = '' }, 2000)
    }, 600)
  },
  { deep: true }
)

// ── Lifecycle ──────────────────────────────────────────────────

onMounted(async () => {
  await loadProjects()
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(saveTimer)
})

// ── Projects ───────────────────────────────────────────────────

async function loadProjects() {
  const all = await dbGetAll()
  projects.value = all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

function selectProject(project) {
  // Point at the actual object in projects.value so sidebar stage count stays in sync
  activeProject.value = projects.value.find(p => p.id === project.id) ?? project
  selectedStageId.value = null
  rightPanel.value = 'template'
}

async function createProject() {
  if (!newName.value.trim()) { nameError.value = true; return }
  nameError.value = false
  const project = emptyProject(newName.value.trim())
  await dbSave(project)
  newName.value  = ''
  showCreate.value = false
  await loadProjects()
  const fresh = projects.value.find(p => p.id === project.id)
  if (fresh) selectProject(fresh)
}

function confirmDeleteProject(project) {
  deleteProjectTarget.value = project
}

async function doDeleteProject() {
  const wasActive = activeProject.value?.id === deleteProjectTarget.value.id
  await dbDelete(deleteProjectTarget.value.id)
  deleteProjectTarget.value = null
  await loadProjects()
  if (wasActive) {
    activeProject.value    = null
    selectedStageId.value  = null
    rightPanel.value       = 'template'
    _loadedId              = null
  }
}

// ── Stages ─────────────────────────────────────────────────────

function addNewStage() {
  if (!activeProject.value) return
  const stage = {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    versionFlag: 'v1',
    acceptanceCriteria: [],
    dependencies: [],
    technicalNotes: '',
  }
  activeProject.value.features.push(stage)
  selectStage(stage)
}

function selectStage(stage) {
  selectedStageId.value = stage.id
  rightPanel.value      = 'stage'
}

function confirmDeleteStage(stage) {
  deleteStageTarget.value = stage
}

function doDeleteStage() {
  activeProject.value.features = activeProject.value.features.filter(
    f => f.id !== deleteStageTarget.value.id
  )
  if (selectedStageId.value === deleteStageTarget.value.id) {
    selectedStageId.value = null
    rightPanel.value      = 'template'
  }
  deleteStageTarget.value = null
}

function toggleDependency(id, checked) {
  if (!selectedStage.value) return
  selectedStage.value.dependencies = checked
    ? [...selectedStage.value.dependencies, id]
    : selectedStage.value.dependencies.filter(d => d !== id)
}

// ── Export / Prompt ────────────────────────────────────────────

function onExportJson()     { exportJson(activeProject.value) }
function onExportMarkdown() { exportMarkdown(activeProject.value) }

function openPromptModal() {
  promptModal.text   = generatePrompt(activeProject.value)
  promptModal.copied = false
  promptModal.open   = true
}

async function copyPrompt() {
  await navigator.clipboard.writeText(promptModal.text)
  promptModal.copied = true
  setTimeout(() => { promptModal.copied = false }, 2000)
}

// ── Drag & drop ────────────────────────────────────────────────

function onDragEnter(e) {
  if (e.dataTransfer?.types?.includes('Files')) dragCounter.value++
}
function onDragLeave() {
  dragCounter.value = Math.max(0, dragCounter.value - 1)
}
function onDrop(e) {
  dragCounter.value = 0
  importFiles(e.dataTransfer.files)
}

async function handleFileInput(e) {
  await importFiles(e.target.files)
  e.target.value = ''
}

async function importFiles(files) {
  for (const file of files) {
    try {
      const data = JSON.parse(await file.text())
      if (data.id && data.name) await dbSave(data)
    } catch { /* skip malformed */ }
  }
  await loadProjects()
}

// ── Keyboard ───────────────────────────────────────────────────

function onKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's' && activeProject.value) {
    e.preventDefault()
    onExportJson()
  }
}

// ── Helpers ────────────────────────────────────────────────────

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

function parseList(str, sep = '\n') {
  return str.split(sep).map(s => s.trim()).filter(Boolean)
}

const pad  = (n) => String(n).padStart(3, '0')
const pad2 = (n) => String(n).padStart(2, '0')
</script>
