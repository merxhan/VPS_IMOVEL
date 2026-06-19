<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

// Import components
import Sidebar from './components/Sidebar.vue';
import LanguageSelector from './components/LanguageSelector.vue';

const route = useRoute();
const mobileMenuOpen = ref(false);

const token = computed(() => localStorage.getItem('inmovel_token'));
const hideHeader = computed(() => route.name === 'landing' || route.name === 'login');
</script>

<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-inmo-light font-sans antialiased text-neutral-dark">
    <!-- Mobile Header (only when authenticated) -->
    <header 
      v-if="token && !hideHeader"
      class="md:hidden bg-inmo-brand text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-30"
    >
      <div class="flex items-center space-x-3">
        <div class="w-7 h-7 rounded bg-goiania-green flex items-center justify-center text-goiania-ipe font-bold text-sm">
          S
        </div>
        <span class="text-sm font-bold tracking-wide">SICI</span>
      </div>
      <div class="flex items-center space-x-2">
        <LanguageSelector />
      <button 
        @click="mobileMenuOpen = true"
        class="text-white hover:text-goiania-ipe transition p-1"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      </div>
    </header>

    <!-- Navigation Sidebar (Only displays if authenticated) -->
    <Sidebar :mobile-open="mobileMenuOpen" @close="mobileMenuOpen = false" />

    <!-- Main Content Container -->
    <div class="flex-grow flex flex-col min-h-0 overflow-y-auto bg-slate-50">
      <!-- Authenticated Top Bar (Desktop) -->
      <header 
        v-if="token && !hideHeader"
        class="hidden md:flex items-center justify-end px-8 py-4 bg-white border-b border-neutral-border shadow-sm sticky top-0 z-20"
      >
        <LanguageSelector />
      </header>

      <main class="flex-grow">
        <router-view />
      </main>
    </div>
  </div>
</template>
