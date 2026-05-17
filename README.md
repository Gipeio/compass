# Project Plan: Project Specification Webapp

## 1. Overview

### General Objective
Transform a simple idea/concept into a detailed, actionable specification ready to be coded. The application helps a solo developer structure their project comprehensively before starting development.

### Target User
- Solo developer with side project ideas
- Need to structure ideas in a clear and complete way
- Want to transform vague ideas into actionable specifications

### Product Core
- **No integrated AI** : The application doesn't generate anything automatically
- **Generic templates** : The app provides pre-made forms with standardized sections that users fill out
- **Prompt generation** (future feature) : Ability to generate prompts to copy/paste into their choice of AI (Claude, ChatGPT, etc.) for each component
- **Reusable data structure** : Specifications are stored locally in JSON, versionable in git

---

## 2. Global Architecture

### Technology Stack
- **Frontend** : Vue 3
- **Persistence** : IndexedDB (browser cache) + Export/Import JSON
- **Export Format** : JSON for data, Markdown for tickets
- **Initial Hosting** : Local repo to run locally (no cloud, no auth for v1)

### Main User Workflow
```
1. Home Screen
   ├─ List of projects stored in browser cache
   ├─ Button "Create new project"
   └─ Drag & drop zone to import existing JSONs

2. Project Page (Editing)
   ├─ General template form (project sections)
   ├─ List of features with version flag
   ├─ Buttons : Add feature, Edit feature, Delete feature
   ├─ Button "Export as JSON"
   └─ Button "Export as Markdown"

3. Modal/Page : Add or edit a feature
   └─ Form with all feature fields
```

---

## 3. Generic Project Template

This is the main form that the user fills out once per project. It should cover all essential aspects without being too heavy.

### Template Sections

#### 3.1 Basic Info
- **Project name** (string, required)
- **Short description** (text, 1-2 sentences, the pitch) (required)

#### 3.2 Problem & Solution
- **What problem does it solve?** (text, required)
- **How does it solve it?** (text, required)

#### 3.3 Tech Stack
Sub-sections (each optional but with a suggested default) :
- **Frontend** (ex: React, Vue, Svelte, vanilla JS, none...)
- **Backend** (ex: Node.js, Python, Go, Rust, none...)
- **Database** (ex: PostgreSQL, MongoDB, SQLite, Firebase, none...)
- **Hosting/Infra** (ex: Vercel, Railway, Docker + VPS, AWS, Netlify, none...)
- **External Tools** (ex: Stripe, Auth0, S3, SendGrid, etc. — free-form list)

#### 3.4 Scope
- **Key Objectives** (list of 3-5 points — what we WANT to accomplish)
- **Scope Exclusions** (free-form list — what we WILL NOT do, to clarify boundaries)

#### 3.5 Constraints
- **Approximate deadline** (date or free text, optional)
- **Team** (string: "solo", or description of planned size/structure, optional)
- **Budget/Resources** (text, optional)

#### 3.6 Success Metrics
- **How do we know it's good?** (text or list — KPIs, user feedback, etc., required)

---

## 4. Feature Structure

Each feature represents a functionality or major element of the project. It will be transformed into a Markdown ticket on export.

### Required Fields

#### 4.1 Title
- Short and descriptive string
- Example : "User Authentication", "Analytics Dashboard", "PDF Export"

#### 4.2 Detailed Description
- Text : complete explanation of what the feature does, how it works, why it matters
- Should be detailed enough that a developer understands exactly what to code without asking questions

#### 4.3 Version Flag
- Enum : "demo" | "v1" | "v2" | "v3" | "undetermined"
- Allows prioritization and planning by phase
- "demo" = minimal MVP, "v1" = first stable version, "v2"+ = future improvements

#### 4.4 Acceptance Criteria
- Simple checklist (list of conditions to check)
- Format : "[ ] Condition 1", "[ ] Condition 2", etc.
- Lets the developer know exactly when the feature is done
- Example for "Auth" :
  - [ ] User can create an account
  - [ ] User can login with email/password
  - [ ] User can reset password
  - [ ] Sessions persist after page refresh

### Optional Fields

#### 4.5 Dependencies
- List of other features required before this one
- Can be empty
- Example : "Dashboard" feature depends on "Authentication"

#### 4.6 Technical Notes
- Free-form text for implementation notes, known pitfalls, suggested approaches
- Example : "Watch out for timezone handling if users are international"
- Optional, to avoid overload but available if needed

---

## 5. JSON Data Structure

### Global project format

```json
{
  "id": "uuid-unique",
  "name": "My Awesome Project",
  "createdAt": "2024-05-17T10:30:00Z",
  "updatedAt": "2024-05-17T14:45:00Z",
  
  "template": {
    "shortDescription": "A platform for...",
    "problem": "Users find it difficult to...",
    "solution": "We create a tool that...",
    
    "techStack": {
      "frontend": "Vue 3",
      "backend": "Node.js + Express",
      "database": "PostgreSQL",
      "hosting": "Railway",
      "externalTools": ["Stripe", "SendGrid"]
    },
    
    "keyObjectives": [
      "Get 100 users in the first month",
      "Reduce setup time to less than 5 minutes",
      "Be profitable in 6 months"
    ],
    
    "scopeExclusions": [
      "No mobile app for v1",
      "No Slack integration for v1",
      "No multi-language for v1"
    ],
    
    "deadline": "2024-12-31",
    "team": "solo",
    "budget": "Limited personal budget",
    
    "successMetrics": "KPI: 100 active users. Feedback: 4+ stars average."
  },
  
  "features": [
    {
      "id": "feature-uuid-1",
      "title": "User Authentication",
      "description": "Users must be able to create an account and login...",
      "versionFlag": "v1",
      
      "acceptanceCriteria": [
        "[ ] User can create account with email/password",
        "[ ] User can login",
        "[ ] User can reset password",
        "[ ] Session persists after refresh"
      ],
      
      "dependencies": [],
      "technicalNotes": "Use bcrypt for hashing, JWT for tokens. Watch out for CORS."
    },
    {
      "id": "feature-uuid-2",
      "title": "Dashboard",
      "description": "A homepage displaying the main user stats...",
      "versionFlag": "v1",
      
      "acceptanceCriteria": [
        "[ ] Dashboard shows 5 main KPIs",
        "[ ] Trend chart for last 30 days",
        "[ ] CSV export of data"
      ],
      
      "dependencies": ["feature-uuid-1"],
      "technicalNotes": "Use Chart.js or Recharts for charts"
    }
  ]
}
```

### Notes on structure
- Each project has a unique `id` (UUID)
- Each feature has its own `id` (UUID)
- Dependencies between features are done by ID
- Dates are in ISO 8601
- All fields listed above must be present (even if empty array or null for optional ones)

---

## 6. Home Screen

### Layout
- **Top** : "My Projects" title + Button "Create new project"
- **Drag & drop zone** : "Drop your JSONs here to import them" (or click to browse files)
- **Project list** : Grid or list with :
  - Project name
  - Last modification date
  - Buttons : Open, Export JSON, Delete

### Interactions
- **Create new project** → Modal with empty form (or pre-filled basically)
- **Drag & drop JSON** → Detects file, parses it, stores in IndexedDB, appears in list
- **Open** → Navigate to project page
- **Export JSON** → Downloads project JSON file
- **Delete** → Confirmation before deletion

---

## 7. Project Page (Editing)

### Layout
- **Top** : Project name + Last modification date
- **Tabs or sections** :
  1. **Project Template** (large form section)
  2. **Features** (list + buttons)
- **Buttons at bottom** :
  - "Export as JSON" → Downloads JSON
  - "Export as Markdown" → Downloads Markdown (tickets)
  - "Back to Home"

### Interactions
- **Fill/modify template** → Real-time editing, auto-save to IndexedDB
- **Add a feature** → Button "+ Add feature" → Modal/Page for creation
- **Edit a feature** → Click on a feature → Modal/Page for editing
- **Delete a feature** → Button in list + confirmation
- **Export JSON** → Downloads current JSON
- **Export Markdown** → Generates and downloads Markdown (see section 8)

---

## 8. Markdown Export

### Format and Content

The Markdown export generates a readable file with a clear structure for each feature.

#### General Structure
```markdown
# Spec: [Project Name]

## Basic Info

**Description:** [Short description]

### Problem
[What problem it solves]

### Solution
[How it solves it]

### Tech Stack
- Frontend: [Frontend]
- Backend: [Backend]
- Database: [Database]
- Hosting: [Hosting]
- External Tools: [List]

### Key Objectives
- [Objective 1]
- [Objective 2]
- ...

### Scope Exclusions
- [Exclusion 1]
- [Exclusion 2]
- ...

### Deadline
[Deadline]

### Team
[Team]

### Budget
[Budget]

### Success Metrics
[Metrics]

---

## Features

### 1. [Feature Title] ([Version Flag])

**Description:**
[Detailed description of the feature]

**Acceptance Criteria:**
[Checklist items]

**Dependencies:**
- [Dependent Feature 1]
- [Dependent Feature 2]
(or "None" if list is empty)

**Technical Notes:**
[Technical notes]

---

### 2. [Feature Title] ([Version Flag])
...
```

#### Generation Rules
- Features are sorted by version flag (demo → v1 → v2 → undetermined)
- Each feature = 1 "ticket" = 1 H3 section
- Readable and directly copyable format
- Checklists remain in format `- [ ] Item` for copy-paste compatibility

---

## 9. Modal/Page : Create or Edit a Feature

### Layout
- Form with all fields
- Buttons : Save, Cancel
- (Optional) Button "Generate prompt" → Shows pre-made prompt to copy/paste into AI (future feature)

### Fields and Validation
- **Title** : required, string
- **Description** : required, long text
- **Version flag** : required, select (demo / v1 / v2 / v3 / undetermined)
- **Acceptance Criteria** : required, textarea with format "- [ ] Item" (one per line)
- **Dependencies** : optional, multi-select of other project features
- **Technical Notes** : optional, textarea

### Interactions
- **Save** → Creates or updates feature in IndexedDB, return to feature list
- **Cancel** → Return without saving
- **Validation** : Required fields must be filled, clear error messages

---

## 10. Storage and Persistence

### IndexedDB
- **Database** : `specProject`
- **Store** : `projects`
- **Key** : `id` (UUID of project)
- **Value** : Complete project object (JSON structure described in section 5)

### Operations
- **Create** : New project with generated UUID
- **Read** : Load existing project
- **Update** : Modify template or features, auto-save
- **Delete** : Delete project completely
- **Export** : Download JSON
- **Import** : Parse received JSON, store in IndexedDB

### Auto-save
- On every template or feature modification
- No explicit "Save" button — everything saves automatically
- Optional visual feedback (ex: "Saved 2s ago")

---

## 11. Future Features (Post-v1)

These features are documented here so they're not forgotten but should NOT be implemented in v1 :

1. **Pre-made templates by project type** : SaaS web, Mobile app, CLI tool, etc.
2. **AI prompt generation** : Button for each component that generates a prompt to copy/paste
3. **Custom template creation** : User can create their own templates and reuse them
4. **Cloud hosting + Auth** : Required for feature #3
5. **Decomposition into sub-tickets** : Each feature can be broken down into sub-tasks
6. **Export to GitHub Issues / Jira** : Direct integrations with platforms
7. **Collaboration** : Multiple devs on same project (requires cloud + auth)
8. **Versioning** : History of project modifications
9. **Auto-generated diagrams** : Architecture, dependencies, Gantt, etc.

---

## 12. Technical Considerations

### Vue 3
- Use Composition API for better clarity
- Structure : Components + Pages + Stores (Pinia optional, simple state if small)
- Router : Vue Router for navigation
- UI Framework : TailwindCSS or PrimeVue for components (flexibility)

### State Management
- For v1 : Simple state with Vue reactivity (ref, computed)
- Pinia optional if it becomes complex

### Validation
- Check required fields before save
- Clear and obvious error messages

### UX
- Confirmations before destructive deletions
- Visual feedback for save (optional but appreciated)
- Drag & drop on home screen should be obvious
- Responsive (desktop first, mobile nice-to-have)

---

## 13. v1 Deliverables Checklist

- [ ] Home screen with project list
- [ ] Create new project
- [ ] Import JSON via drag & drop
- [ ] Export JSON from project
- [ ] Project page (template + features)
- [ ] Generic template form (all fields)
- [ ] Add/Edit/Delete features
- [ ] Feature form (all fields)
- [ ] Export Markdown (1 ticket per feature)
- [ ] Persistence in IndexedDB
- [ ] Project deletion (with confirmation)
- [ ] Smooth navigation between pages
- [ ] Minimal but functional design

---

## 14. General Notes

- **Objective** : Make sure that once the template + features are filled out, the developer only has to "eat code"
- **Philosophy** : Simple, local, versionable in git, no heavy external dependencies
- **Language** : English for labels/placeholders
- **v1 Scope** : Just the webapp, nothing magical, it's a structuring tool
