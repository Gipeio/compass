// Client-side routes — Home (project list) and Project (edit page)
import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProjectView from '../views/ProjectView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/project/:id', component: ProjectView },
  ],
})
