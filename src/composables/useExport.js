// JSON and Markdown export — triggers browser file download for each format
const VERSION_ORDER = ['demo', 'v1', 'v2', 'v3', 'undetermined']

export function exportJson(project) {
  const p = JSON.parse(JSON.stringify(project))
  trigger(
    new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' }),
    `${slugify(p.name)}.json`
  )
}

export function exportMarkdown(rawProject) {
  const project = JSON.parse(JSON.stringify(rawProject))
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

export function generatePrompt(rawProject) {
  const project = JSON.parse(JSON.stringify(rawProject))
  const byId = Object.fromEntries(project.features.map((f) => [f.id, f]))
  const sorted = [...project.features].sort(
    (a, b) => VERSION_ORDER.indexOf(a.versionFlag) - VERSION_ORDER.indexOf(b.versionFlag)
  )
  const t = project.template

  const techStack = [
    t.techStack.frontend  && `- Frontend: ${t.techStack.frontend}`,
    t.techStack.backend   && `- Backend: ${t.techStack.backend}`,
    t.techStack.database  && `- Database: ${t.techStack.database}`,
    t.techStack.hosting   && `- Hosting: ${t.techStack.hosting}`,
    t.techStack.externalTools.length && `- External tools: ${t.techStack.externalTools.join(', ')}`,
  ].filter(Boolean).join('\n')

  const features = sorted.map((f, i) => {
    const deps = f.dependencies.map((id) => byId[id]?.title).filter(Boolean)
    const lines = [
      `### ${i + 1}. ${f.title} [${f.versionFlag.toUpperCase()}]`,
      '',
      f.description,
      '',
      '**Acceptance criteria:**',
      ...f.acceptanceCriteria.map((c) => `- ${c}`),
    ]
    if (deps.length) lines.push('', `**Depends on:** ${deps.join(', ')}`)
    if (f.technicalNotes) lines.push('', `**Technical notes:** ${f.technicalNotes}`)
    return lines.join('\n')
  }).join('\n\n---\n\n')

  return [
    `You are an expert software architect. I need a detailed technical plan before I start building the following project. Do not write any code — focus entirely on planning and structure.`,
    '',
    '---',
    '',
    `# Project: ${project.name}`,
    '',
    `## Overview`,
    t.shortDescription,
    '',
    '## Problem & Solution',
    `**Problem:** ${t.problem}`,
    '',
    `**Solution:** ${t.solution}`,
    '',
    ...(techStack ? ['## Tech Stack', techStack, ''] : []),
    ...(t.keyObjectives.length ? ['## Key Objectives', ...t.keyObjectives.map((o) => `- ${o}`), ''] : []),
    ...(t.scopeExclusions.length ? ['## Out of Scope', ...t.scopeExclusions.map((e) => `- ${e}`), ''] : []),
    ...([t.deadline, t.team, t.budget].some(Boolean) ? [
      '## Constraints',
      t.deadline && `- Deadline: ${t.deadline}`,
      t.team     && `- Team: ${t.team}`,
      t.budget   && `- Budget: ${t.budget}`,
      '',
    ].filter((l) => l !== false) : []),
    ...(t.successMetrics ? ['## Success Metrics', t.successMetrics, ''] : []),
    '## Features',
    '',
    features,
    '',
    '---',
    '',
    '## Your task',
    '',
    'Based on the specification above, produce a detailed technical plan that includes:',
    '',
    '1. **Architecture overview** — high-level design decisions, component/module breakdown, data models, API surface if applicable',
    '2. **Implementation order** — which features to tackle first and why (respect the priority levels: DEMO → V1 → V2+)',
    '3. **Task breakdown** — for each feature, a concrete list of developer subtasks that can be executed one by one',
    '4. **Risks and open questions** — technical challenges, edge cases, ambiguities, or missing information that should be resolved before coding',
    '',
    'Be specific. Assume a solo developer will execute this plan from top to bottom.',
  ].join('\n')
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
