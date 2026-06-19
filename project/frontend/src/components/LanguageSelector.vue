<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale: i18nLocale } = useI18n();
const langOpen = ref(false);

const languages = [
  { code: 'pt', flag: '🇧🇷', label: 'Português' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
];

function currentFlag() {
  return languages.find(l => l.code === i18nLocale.value)?.flag || '🇧🇷';
}

function selectLang(code: string) {
  i18nLocale.value = code;
  localStorage.setItem('inmovel_lang', code);
  langOpen.value = false;
}

function closeLangMenu() {
  langOpen.value = false;
}
</script>

<template>
  <div class="relative">
    <button 
      @click="langOpen = !langOpen"
      class="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-neutral-border hover:bg-slate-50 transition text-sm bg-white text-neutral-dark"
    >
      <span class="text-lg">{{ currentFlag() }}</span>
      <svg class="w-3 h-3 text-neutral-muted transition-transform" :class="{ 'rotate-180': langOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <!-- Backdrop -->
    <div v-if="langOpen" @click="closeLangMenu" class="fixed inset-0 z-30"></div>
    <!-- Menu -->
    <div 
      v-if="langOpen"
      class="absolute right-0 mt-2 w-44 bg-white border border-neutral-border rounded-xl shadow-lg z-40 py-1 overflow-hidden"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="selectLang(lang.code)"
        :class="[
          'w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition',
          i18nLocale.value === lang.code 
            ? 'bg-inmo-primary/5 text-inmo-primary font-semibold' 
            : 'text-neutral-dark hover:bg-slate-50'
        ]"
      >
        <span class="text-lg">{{ lang.flag }}</span>
        <span>{{ lang.label }}</span>
      </button>
    </div>
  </div>
</template>
