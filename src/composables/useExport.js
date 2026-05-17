// JSON and Markdown export — triggers browser file download for each format
const VERSION_ORDER = ['demo', 'v1', 'v2', 'v3', 'undetermined']

export function exportJson(project) {
  trigger(
    new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }),
    `${slugify(project.name)}.json`
  )
}

export function exportMarkdown(project) {
  const byId = Object.fromEntries(project.features.map((f) => [f.id, f]))
  const sorted = [...project.features].sort(
    (a, b) => VERSION_ORDER.indexOf(a.versionFlag) - VERSION_ORDER.indexOf(b.versionFlag)
  )
  const t = project.template

  const lines = [
    `# Spec: ${project.name}`,
    '',
    '## Basic Info',
    '',
    `**Description:** ${t.shortDescription}`,
    '',
    '### Problem',
    t.problem,
    '',
    '### Solution',
    t.solution,
    '',
    '### Tech Stack',
    `- Frontend: ${t.techStack.frontend || '—'}`,
    `- Backend: ${t.techStack.backend || '—'}`,
    `- Database: ${t.techStack.database || '—'}`,
    `- Hosting: ${t.techStack.hosting || '—'}`,
    `- External Tools: ${t.techStack.externalTools.join(', ') || '—'}`,
    '',
    '### Key Objectives',
    ...t.keyObjectives.map((o) => `- ${o}`),
    '',
    '### Scope Exclusions',
    ...t.scopeExclusions.map((e) => `- ${e}`),
    '',
    `### Deadline\n${t.deadline || '—'}`,
    '',
    `### Team\n${t.team || '—'}`,
    '',
    `### Budget\n${t.budget || '—'}`,
    '',
    `### Success Metrics\n${t.successMetrics || '—'}`,
    '',
    '---',
    '',
    '## Features',
    '',
    ...sorted.flatMap((f, i) => {
      const deps = f.dependencies.map((id) => byId[id]?.title).filter(Boolean)
      return [
        `### ${i + 1}. ${f.title} (${f.versionFlag})`,
        '',
        '**Description:**',
        f.description,
        '',
        '**Acceptance Criteria:**',
        ...f.acceptanceCriteria.map((c) => `- ${c}`),
        '',
        '**Dependencies:**',
        deps.length ? deps.map((d) => `- ${d}`).join('\n') : 'None',
        '',
        '**Technical Notes:**',
        f.technicalNotes || '—',
        '',
        '---',
        '',
      ]
    }),
  ]

  trigger(new Blob([lines.join('\n')], { type: 'text/markdown' }), `${slugify(project.name)}.md`)
}

function trigger(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
