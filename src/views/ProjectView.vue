<!-- Project edit page — template form and feature list with auto-save to IndexedDB -->
<template>
  <div class="page">
    <header class="hud">
      <div class="hud-brand">
        <button class="btn btn-ghost btn-sm" @click="$router.push('/')">◄ BACK</button>
        <span class="hud-title" style="margin-left:12px;">{{ project?.name || '...' }}</span>
      </div>
      <div class="hud-stats">
        <div class="hud-stat">
          <span class="label">STAGES</span>
          <span class="value">{{ pad(project?.features?.length ?? 0) }}</span>
        </div>
      </div>
    </header>

    <div v-if="!project" class="page-content">
      <p class="text-muted">Loading...</p>
    </div>

    <template v-else>
      <div class="page-content">
        <div class="tabs">
          <button class="tab" :class="{ active: tab === 'template' }" @click="tab = 'template'">TEMPLATE</button>
          <button class="tab" :class="{ active: tab === 'features' }" @click="tab = 'features'">
            STAGES ({{ project.features.length }})
          </button>
        </div>

        <!-- ── TEMPLATE TAB ───────────────────────────────── -->
        <div v-if="tab === 'template'">

          <div class="form-section">
            <div class="form-section-header"><span class="form-section-title">01 · BASIC INFO</span></div>
            <div class="form-section-body">
              <div class="form-group">
                <label class="field-label" for="p-name">PROJECT NAME *</label>
                <input id="p-name" v-model="project.name" class="input" type="text" placeholder="My Awesome Project" />
              </div>
              <div class="form-group">
                <label class="field-label" for="p-desc">SHORT DESCRIPTION *</label>
                <textarea id="p-desc" v-model="project.template.shortDescription" class="textarea" placeholder="A platform for... (1–2 sentences)"></textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-header"><span class="form-section-title">02 · PROBLEM & SOLUTION</span></div>
            <div class="form-section-body">
              <div class="form-group">
                <label class="field-label" for="p-problem">WHAT PROBLEM DOES IT SOLVE? *</label>
                <textarea id="p-problem" v-model="project.template.problem" class="textarea" placeholder="Users find it difficult to..."></textarea>
              </div>
              <div class="form-group">
                <label class="field-label" for="p-solution">HOW DOES IT SOLVE IT? *</label>
                <textarea id="p-solution" v-model="project.template.solution" class="textarea" placeholder="We create a tool that..."></textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-header"><span class="form-section-title">03 · TECH STACK</span></div>
            <div class="form-section-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="field-label" for="ts-fe">FRONTEND</label>
                  <input id="ts-fe" v-model="project.template.techStack.frontend" class="input" type="text" placeholder="Vue 3, React, vanilla..." />
                </div>
                <div class="form-group">
                  <label class="field-label" for="ts-be">BACKEND</label>
                  <input id="ts-be" v-model="project.template.techStack.backend" class="input" type="text" placeholder="Node.js, Go, Python..." />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="field-label" for="ts-db">DATABASE</label>
                  <input id="ts-db" v-model="project.template.techStack.database" class="input" type="text" placeholder="PostgreSQL, SQLite..." />
                </div>
                <div class="form-group">
                  <label class="field-label" for="ts-host">HOSTING / INFRA</label>
                  <input id="ts-host" v-model="project.template.techStack.hosting" class="input" type="text" placeholder="Vercel, Railway, VPS..." />
                </div>
              </div>
              <div class="form-group">
                <label class="field-label" for="ts-ext">EXTERNAL TOOLS</label>
                <input
                  id="ts-ext"
                  :value="project.template.techStack.externalTools.join(', ')"
                  class="input"
                  type="text"
                  placeholder="Stripe, Auth0, SendGrid..."
                  @change="project.template.techStack.externalTools = parseList($event.target.value, ',')"
                />
                <p class="field-hint">Comma-separated list</p>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-header"><span class="form-section-title">04 · SCOPE</span></div>
            <div class="form-section-body">
              <div class="form-group">
                <label class="field-label" for="p-obj">KEY OBJECTIVES (3–5)</label>
                <textarea
                  id="p-obj"
                  :value="project.template.keyObjectives.join('\n')"
                  class="textarea"
                  placeholder="Get 100 users in the first month&#10;Reduce setup time to under 5 minutes&#10;Be profitable in 6 months"
                  @change="project.template.keyObjectives = parseList($event.target.value)"
                ></textarea>
                <p class="field-hint">One objective per line</p>
              </div>
              <div class="form-group">
                <label class="field-label" for="p-excl">SCOPE EXCLUSIONS</label>
                <textarea
                  id="p-excl"
                  :value="project.template.scopeExclusions.join('\n')"
                  class="textarea"
                  placeholder="No mobile app for v1&#10;No Slack integration for v1"
                  @change="project.template.scopeExclusions = parseList($event.target.value)"
                ></textarea>
                <p class="field-hint">One exclusion per line</p>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-header"><span class="form-section-title">05 · CONSTRAINTS</span></div>
            <div class="form-section-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="field-label" for="p-deadline">APPROXIMATE DEADLINE</label>
                  <input id="p-deadline" v-model="project.template.deadline" class="input" type="text" placeholder="2024-12-31 or Q1 2025" />
                </div>
                <div class="form-group">
                  <label class="field-label" for="p-team">TEAM</label>
                  <input id="p-team" v-model="project.template.team" class="input" type="text" placeholder="solo" />
                </div>
              </div>
              <div class="form-group">
                <label class="field-label" for="p-budget">BUDGET / RESOURCES</label>
                <input id="p-budget" v-model="project.template.budget" class="input" type="text" placeholder="Limited personal budget" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-header"><span class="form-section-title">06 · SUCCESS METRICS *</span></div>
            <div class="form-section-body">
              <div class="form-group">
                <label class="field-label" for="p-metrics">HOW DO WE KNOW IT'S GOOD?</label>
                <textarea id="p-metrics" v-model="project.template.successMetrics" class="textarea" placeholder="KPI: 100 active users. Feedback: 4+ stars average."></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- ── FEATURES TAB ───────────────────────────────── -->
        <div v-else>
          <div class="section-header">
            <span class="section-title">— STAGES —</span>
            <button class="btn btn-primary" @click="openFeatureModal(null)">▶ ADD STAGE</button>
          </div>

          <div class="ground"></div>

          <div v-if="project.features.length === 0" class="empty">
            <span class="empty-icon">📋</span>
            <p class="empty-text">NO STAGES YET — ADD YOUR FIRST FEATURE</p>
          </div>

          <div v-else class="feature-list">
            <div v-for="feature in sortedFeatures" :key="feature.id" class="feature-item">
              <span class="badge" :class="`badge-${feature.versionFlag}`">{{ feature.versionFlag }}</span>
              <span class="feature-item-title">{{ feature.title }}</span>
              <div class="feature-item-actions">
                <button class="btn btn-ghost btn-sm" @click="openFeatureModal(feature)">EDIT</button>
                <button class="btn btn-danger btn-sm" @click="confirmDeleteFeature(feature)">✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export footer -->
      <footer class="page-footer">
        <button class="btn btn-ghost btn-sm" @click="onExportJson">⬇ JSON</button>
        <button class="btn btn-ghost btn-sm" @click="onExportMarkdown">⬇ MARKDOWN</button>
        <span class="save-indicator" :class="{ saved: saveStatus === 'saved' }">
          {{ saveStatus === 'saved' ? '● SAVED' : saveStatus === 'saving' ? '... SAVING' : '' }}
        </span>
      </footer>
    </template>

    <!-- Feature modal -->
    <FeatureModal
      v-if="featureModal.open"
      :feature="featureModal.feature"
      :other-features="featureModal.others"
      @save="onFeatureSave"
      @close="featureModal.open = false"
    />

    <!-- Delete feature confirmation -->
    <div v-if="deleteFeatureTarget" class="overlay" @click.self="deleteFeatureTarget = null">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title danger">⚠ DELETE STAGE</span>
        </div>
        <div class="modal-body">
          <p>Delete <strong>{{ deleteFeatureTarget.title }}</strong>? This cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="deleteFeatureTarget = null">CANCEL</button>
          <button class="btn btn-danger" @click="doDeleteFeature">✕ DELETE</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { dbGet, dbSave } from '../composables/useDb.js'
import { exportJson, exportMarkdown } from '../composables/useExport.js'
import FeatureModal from '../components/FeatureModal.vue'

const route = useRoute()

const project    = ref(null)
const tab        = ref('template')
const saveStatus = ref('')
const deleteFeatureTarget = ref(null)

const featureModal = reactive({ open: false, feature: null, others: [] })

const VERSION_ORDER = ['demo', 'v1', 'v2', 'v3', 'undetermined']
const sortedFeatures = computed(() =>
  [...(project.value?.features ?? [])].sort(
    (a, b) => VERSION_ORDER.indexOf(a.versionFlag) - VERSION_ORDER.indexOf(b.versionFlag)
  )
)

onMounted(async () => {
  project.value = await dbGet(route.params.id)
})

// Auto-save with 600ms debounce on any project change
let saveTimer = null
watch(
  project,
  () => {
    saveStatus.value = 'saving'
    clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      project.value.updatedAt = new Date().toISOString()
      await dbSave(project.value)
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

function parseList(str, sep = '\n') {
  return str.split(sep).map((s) => s.trim()).filter(Boolean)
}

const pad = (n) => String(n).padStart(3, '0')
</script>
