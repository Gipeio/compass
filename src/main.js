// Entry point — applies Garance palette tokens, shows boot screen, then mounts the app.
import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'
import { shouldBoot, markBooted, showBoot, showScan, mountReplayButton } from './boot/index.js'

// Garance palette — tokens read by the boot screen and all CSS
const GARANCE = { bg: 'EEE2DE', surface: 'EA906C', accent: 'B31312', text: '2B2A4C' };
const root = document.documentElement;
root.style.setProperty('--t-bg',      `#${GARANCE.bg}`);
root.style.setProperty('--t-surface', `#${GARANCE.surface}`);
root.style.setProperty('--t-accent',  `#${GARANCE.accent}`);
root.style.setProperty('--t-text',    `#${GARANCE.text}`);

createApp(App).mount('#app')

if (shouldBoot()) {
  markBooted();
  showBoot();
} else {
  showScan();
}

mountReplayButton();
