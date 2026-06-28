<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Sidebar from './components/Sidebar.vue';
import ToastContainer from './components/ToastContainer.vue';

const route = useRoute();
const router = useRouter();
const mobileMenuOpen = ref(false);

const token = computed(() => localStorage.getItem('inmovel_token'));
const hideHeader = computed(() => route.name === 'login');

let inactivityTimeout: number | undefined;
const TIMEOUT_1_HOUR = 3600000;

function logout() {
  localStorage.removeItem('inmovel_token');
  localStorage.removeItem('inmovel_user');
  localStorage.removeItem('inmovel_session_expires');
  router.push({ name: 'login' });
}

function resetInactivityTimer() {
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout);
  }
  if (token.value) {
    localStorage.setItem('inmovel_session_expires', (Date.now() + TIMEOUT_1_HOUR).toString());
    inactivityTimeout = window.setTimeout(() => {
      logout();
    }, TIMEOUT_1_HOUR);
  }
}

const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

function setupActivityListeners() {
  activityEvents.forEach(event => {
    window.addEventListener(event, resetInactivityTimer);
  });
}

function removeActivityListeners() {
  activityEvents.forEach(event => {
    window.removeEventListener(event, resetInactivityTimer);
  });
}

watch(token, (newToken) => {
  if (newToken) {
    resetInactivityTimer();
    setupActivityListeners();
  } else {
    if (inactivityTimeout) clearTimeout(inactivityTimeout);
    removeActivityListeners();
  }
}, { immediate: true });

onUnmounted(() => {
  if (inactivityTimeout) clearTimeout(inactivityTimeout);
  removeActivityListeners();
});
</script>

<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-sici-background font-sans antialiased text-slate-900">
    <header 
      v-if="token && !hideHeader"
      class="md:hidden bg-sici-primary text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-30"
    >
      <div class="flex items-center space-x-3">
        <div class="w-7 h-7 rounded bg-sici-accent flex items-center justify-center text-white font-bold text-sm">
          S
        </div>
        <span class="text-sm font-bold tracking-wide">SICI</span>
      </div>
      <div class="flex items-center space-x-2">
      <button 
        @click="mobileMenuOpen = true"
        class="text-white hover:text-sici-warning transition p-1"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      </div>
    </header>

    <Sidebar :mobile-open="mobileMenuOpen" @close="mobileMenuOpen = false" />

    <div class="flex-grow flex flex-col min-h-0 overflow-y-auto bg-slate-50">
      <header 
        v-if="token && !hideHeader"
        class="hidden md:flex items-center justify-end px-8 py-4 bg-white border-b border-sici-border shadow-sm sticky top-0 z-20"
      >
      </header>

      <main class="flex-grow">
        <router-view />
      </main>
    </div>
    
    <ToastContainer />
  </div>
</template>
