<!-- Modal for creating or editing a feature — emits 'save' with the feature object, 'close' on cancel -->
<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">{{ isEdit ? 'EDIT STAGE' : 'NEW STAGE' }}</span>
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Title -->
        <div class="form-group">
          <label class="field-label" for="f-title">TITLE *</label>
          <input id="f-title" v-model="form.title" class="input" :class="{ error: errors.title }" type="text" placeholder="User Authentication" />
          <p v-if="errors.title" class="field-error">Required</p>
        </div>

        <!-- Version flag -->
        <div class="form-group">
          <label class="field-label" for="f-version">VERSION FLAG *</label>
          <select id="f-version" v-model="form.versionFlag" class="select">
            <option value="demo">DEMO — minimal MVP</option>
            <option value="v1">V1 — first stable version</option>
            <option value="v2">V2 — future improvement</option>
            <option value="v3">V3 — future improvement</option>
            <option value="undetermined">UNDETERMINED</option>
          </select>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="field-label" for="f-desc">DESCRIPTION *</label>
          <textarea
            id="f-desc"
            v-model="form.description"
            class="textarea"
            :class="{ error: errors.description }"
            style="min-height:120px"
            placeholder="Complete explanation of what the feature does, how it works, why it matters..."
          ></textarea>
          <p v-if="errors.description" class="field-error">Required</p>
        </div>

        <!-- Acceptance criteria -->
        <div class="form-group">
          <label class="field-label" for="f-ac">ACCEPTANCE CRITERIA *</label>
          <textarea
            id="f-ac"
            v-model="form.acceptanceCriteriaRaw"
            class="textarea"
            :class="{ error: errors.acceptanceCriteria }"
            style="min-height:100px"
            placeholder="[ ] User can create account&#10;[ ] User can login&#10;[ ] Session persists after refresh"
          ></textarea>
          <p class="field-hint">One condition per line. Start lines with [ ] for checklist format.</p>
          <p v-if="errors.acceptanceCriteria" class="field-error">At least one criterion required</p>
        </div>

        <!-- Dependencies -->
        <div v-if="otherFeatures.length > 0" class="form-group">
          <span class="field-label">DEPENDENCIES</span>
          <div class="check-list">
            <label v-for="f in otherFeatures" :key="f.id" class="check-item">
              <input type="checkbox" :value="f.id" v-model="form.dependencies" />
              <span>{{ f.title }}</span>
              <span class="badge" :class="`badge-${f.versionFlag}`">{{ f.versionFlag }}</span>
            </label>
          </div>
        </div>

        <!-- Technical notes -->
        <div class="form-group">
          <label class="field-label" for="f-notes">TECHNICAL NOTES</label>
          <textarea
            id="f-notes"
            v-model="form.technicalNotes"
            class="textarea"
            placeholder="Watch out for timezone handling. Use bcrypt for passwords..."
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('close')">CANCEL</button>
        <button class="btn btn-primary" @click="save">{{ isEdit ? '▶ UPDATE' : '▶ ADD STAGE' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({
  feature: { type: Object, default: null },
  otherFeatures: { type: Array, default: () => [] },
})

const emit = defineEmits(['save', 'close'])

const isEdit = computed(() => !!props.feature?.id && props.feature.title !== '')

const form = reactive({
  title: props.feature?.title ?? '',
  description: props.feature?.description ?? '',
  versionFlag: props.feature?.versionFlag ?? 'v1',
  acceptanceCriteriaRaw: (props.feature?.acceptanceCriteria ?? []).join('\n'),
  dependencies: [...(props.feature?.dependencies ?? [])],
  technicalNotes: props.feature?.technicalNotes ?? '',
})

const errors = reactive({ title: false, description: false, acceptanceCriteria: false })

function save() {
  errors.title = !form.title.trim()
  errors.description = !form.description.trim()

  const criteria = form.acceptanceCriteriaRaw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  errors.acceptanceCriteria = criteria.length === 0

  if (errors.title || errors.description || errors.acceptanceCriteria) return

  emit('save', {
    id: props.feature?.id ?? crypto.randomUUID(),
    title: form.title.trim(),
    description: form.description.trim(),
    versionFlag: form.versionFlag,
    acceptanceCriteria: criteria,
    dependencies: form.dependencies,
    technicalNotes: form.technicalNotes.trim(),
  })
}
</script>
