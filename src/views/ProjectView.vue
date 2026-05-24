<!-- Project edit page — 2-column layout: template form left, stages right, auto-save to IndexedDB -->
<template>
  <div class="page">
    <header class="hud">
      <div class="hud-inner">
        <div class="hud-brand">
          <button class="btn btn-ghost btn-sm" @click="$router.push('/')">◄ Back</button>
          <img src="/logo.svg" alt="" class="hud-logo" style="margin-left:10px;" />
          <span class="hud-title" style="margin-left:8px;">{{ project?.name || '…' }}</span>
        </div>
        <div class="hud-stats">
          <div class="hud-stat">
            <span class="label">STAGES</span>
            <span class="value">{{ pad(project?.features?.length ?? 0) }}</span>
          </div>
        </div>
      </div>
    </header>

    <div v-if="!project" class="page-content-wrap">
      <div class="page-content">
        <p class="text-muted">Loading...</p>
      </div>
    </div>

    <template v-else>
      <div class="project-layout">

        <!-- ── LEFT: template form ─────────────────────────── -->
        <div class="project-form">

          <div class="form-section">
            <div class="form-section-header"><span class="form-section-title">01 · Basic info</span></div>
            <div class="form-section-body">
              <div class="form-group">
                <label class="field-label" for="p-name">Project name *</label>
                <input id="p-name" v-model="project.name" class="input" type="text" placeholder="My Awesome Project" />
              </div>
              <div class="form-group">
                <label class="field-label" for="p-desc">Short description *</label>
                <textarea id="p-desc" v-model="project.template.shortDescription" class="textarea" placeholder="A platform for… (1–2 sentences)"></textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-header"><span class="form-section-title">02 · Problem & solution</span></div>
            <div class="form-section-body">
              <div class="form-group">
                <label class="field-label" for="p-problem">What problem does it solve? *</label>
                <textarea id="p-problem" v-model="project.template.problem" class="textarea" placeholder="Users find it difficult to…"></textarea>
              </div>
              <div class="form-group">
                <label class="field-label" for="p-solution">How does it solve it? *</label>
                <textarea id="p-solution" v-model="project.template.solution" class="textarea" placeholder="We create a tool that…"></textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-header"><span class="form-section-title">03 · Tech stack</span></div>
            <div class="form-section-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="field-label" for="ts-fe">Frontend</label>
                  <input id="ts-fe" v-model="project.template.techStack.frontend" class="input" type="text" placeholder="Vue 3, React, vanilla…" />
                </div>
                <div class="form-group">
                  <label class="field-label" for="ts-be">Backend</label>
                  <input id="ts-be" v-model="project.template.techStack.backend" class="input" type="text" placeholder="Node.js, Go, Python…" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="field-label" for="ts-db">Database</label>
                  <input id="ts-db" v-model="project.template.techStack.database" class="input" type="text" placeholder="PostgreSQL, SQLite…" />
                </div>
                <div class="form-group">
                  <label class="field-label" for="ts-host">Hosting / infra</label>
                  <input id="ts-host" v-model="project.template.techStack.hosting" class="input" type="text" placeholder="Vercel, Railway, VPS…" />
                </div>
              </div>
              <div class="form-group">
                <label class="field-label" for="ts-ext">External tools</label>
                <input
                  id="ts-ext"
                  :value="project.template.techStack.externalTools.join(', ')"
                  class="input"
                  type="text"
                  placeholder="Stripe, Auth0, SendGrid…"
                  @change="project.template.techStack.externalTools = parseList($event.target.value, ',')"
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
                  :value="project.template.keyObjectives.join('\n')"
                  class="textarea"
                  placeholder="Get 100 users in the first month&#10;Reduce setup time to under 5 minutes"
                  @change="project.template.keyObjectives = parseList($event.target.value)"
                ></textarea>
                <p class="field-hint">One per line</p>
              </div>
              <div class="form-group">
                <label class="field-label" for="p-excl">Scope exclusions</label>
                <textarea
                  id="p-excl"
                  :value="project.template.scopeExclusions.join('\n')"
                  class="textarea"
                  placeholder="No mobile app for v1&#10;No Slack integration for v1"
                  @change="project.template.scopeExclusions = parseList($event.target.value)"
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
                  <input id="p-deadline" v-model="project.template.deadline" class="input" type="text" placeholder="2024-12-31 or Q1 2025" />
                </div>
                <div class="form-group">
                  <label class="field-label" for="p-team">Team</label>
                  <input id="p-team" v-model="project.template.team" class="input" type="text" placeholder="solo" />
                </div>
              </div>
              <div class="form-group">
                <label class="field-label" for="p-budget">Budget / resources</label>
                <input id="p-budget" v-model="project.template.budget" class="input" type="text" placeholder="Limited personal budget" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-header"><span class="form-section-title">06 · Success metrics *</span></div>
            <div class="form-section-body">
              <div class="form-group">
                <label class="field-label" for="p-metrics">How do we know it's good?</label>
                <textarea id="p-metrics" v-model="project.template.successMetrics" class="textarea" placeholder="KPI: 100 active users. Feedback: 4+ stars average."></textarea>
              </div>
            </div>
          </div>

        </div><!-- /project-form -->

        <!-- ── RIGHT: stages ──────────────────────────────── -->
        <div class="project-stages">
          <div class="stages-header">
            <span class="section-title">Stages</span>
            <button class="btn btn-primary btn-sm" @click="openFeatureModal(null)">+ Add stage</button>
          </div>

          <div v-if="project.features.length === 0" class="empty" style="margin:16px; border:1px solid var(--t-border-1);">
            <span class="empty-icon">🧭</span>
            <p class="empty-text">NO STAGES YET</p>
          </div>

          <div v-else class="feature-list">
            <div
              v-for="(feature, i) in sortedFeatures"
              :key="feature.id"
              class="feature-item"
              style="cursor:pointer;"
              @click="openFeatureModal(feature)"
            >
              <span class="feature-item-num">{{ pad2(i + 1) }}</span>
              <span class="feature-item-title">{{ feature.title }}</span>
              <span class="badge" :class="`badge-${feature.versionFlag}`">{{ feature.versionFlag }}</span>
              <div class="feature-item-actions" @click.stop>
                <button class="btn btn-danger btn-sm" @click="confirmDeleteFeature(feature)">✕</button>
              </div>
            </div>
          </div>
        </div><!-- /project-stages -->

      </div><!-- /project-layout -->

      <!-- Export footer -->
      <footer class="page-footer">
        <button class="btn btn-ghost btn-sm" @click="onExportJson">⬇ JSON</button>
        <button class="btn btn-ghost btn-sm" @click="onExportMarkdown">⬇ Markdown</button>
        <button class="btn btn-primary btn-sm" @click="openPromptModal">✦ Prompt</button>
        <span class="save-indicator" :class="{ saved: saveStatus === 'saved' }">
          {{ saveStatus === 'saved' ? '● SAVED' : saveStatus === 'saving' ? '… SAVING' : '' }}
        </span>
      </footer>
    </template>

    <!-- Feature modal -->
    <FeatureModal
      v-if="featureModal.open"
      :key="featureModal.feature?.id || 'new'"
      :feature="featureModal.feature"
      :other-features="featureModal.others"
      @save="onFeatureSave"
      @close="featureModal.open = false"
    />

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

    <!-- Delete stage confirmation -->
    <div v-if="deleteFeatureTarget" class="overlay" @click.self="deleteFeatureTarget = null">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title danger">Delete stage</span>
        </div>
        <div class="modal-body">
          <p>Delete <strong style="font-family:var(--font-head)">{{ deleteFeatureTarget.title }}</strong>? This cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="deleteFeatureTarget = null">Cancel</button>
          <button class="btn btn-danger" @click="doDeleteFeature">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { dbGet, dbSave } from '../composables/useDb.js'
import { exportJson, exportMarkdown, generatePrompt } from '../composables/useExport.js'
import FeatureModal from '../components/FeatureModal.vue'

const route = useRoute()

const project    = ref(null)
const saveStatus = ref('')
const deleteFeatureTarget = ref(null)

const featureModal = reactive({ open: false, feature: null, others: [] })
const promptModal  = reactive({ open: false, text: '', copied: false })

const VERSION_ORDER = ['demo', 'v1', 'v2', 'v3', 'undetermined']
const sortedFeatures = computed(() =>
  [...(project.value?.features ?? [])].sort(
    (a, b) => VERSION_ORDER.indexOf(a.versionFlag) - VERSION_ORDER.indexOf(b.versionFlag)
  )
)

function onKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's' && project.value) {
    e.preventDefault()
    onExportJson()
  }
}

onMounted(async () => {
  project.value = await dbGet(route.params.id)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

// Auto-save with 600ms debounce — snapshot to plain object to avoid Vue Proxy issues
// updatedAt is set only in the snapshot, not on project.value, to avoid re-triggering the watch
let saveTimer = null
watch(
  project,
  () => {
    saveStatus.value = 'saving'
    clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      const snapshot = JSON.parse(JSON.stringify(project.value))
      snapshot.updatedAt = new Date().toISOString()
      await dbSave(snapshot)
      saveStatus.value = 'saved'
      setTimeout(() => { saveStatus.value = '' }, 2000)
    }, 600)
  },
  { deep: true }
)

function openFeatureModal(feature) {
  featureModal.feature = feature ?? { id: '', title: '', description: '', versionFlag: 'v1', acceptanceCriteria: [], dependencies: [], technicalNotes: '' }
  featureModal.others  = feature
    ? project.value.features.filter((f) => f.id !== feature.id)
    : project.value.features
  featureModal.open = true
}

function onFeatureSave(saved) {
  const idx = project.value.features.findIndex((f) => f.id === saved.id)
  if (idx >= 0) {
    project.value.features[idx] = saved
  } else {
    project.value.features.push(saved)
  }
  featureModal.open = false
}

function confirmDeleteFeature(feature) {
  deleteFeatureTarget.value = feature
}

function doDeleteFeature() {
  project.value.features = project.value.features.filter((f) => f.id !== deleteFeatureTarget.value.id)
  deleteFeatureTarget.value = null
}

function onExportJson()      { exportJson(project.value) }
function onExportMarkdown()  { exportMarkdown(project.value) }

function openPromptModal() {
  promptModal.text   = generatePrompt(project.value)
  promptModal.copied = false
  promptModal.open   = true
}

async function copyPrompt() {
  await navigator.clipboard.writeText(promptModal.text)
  promptModal.copied = true
  setTimeout(() => { promptModal.copied = false }, 2000)
}

function parseList(str, sep = '\n') {
  return str.split(sep).map((s) => s.trim()).filter(Boolean)
}

const pad  = (n) => String(n).padStart(3, '0')
const pad2 = (n) => String(n).padStart(2, '0')
</script>
