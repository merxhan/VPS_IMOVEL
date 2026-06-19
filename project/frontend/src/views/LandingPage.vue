<script setup lang="ts">
import { computed } from 'vue';
const token = computed(() => localStorage.getItem('inmovel_token'));
const user = computed(() => JSON.parse(localStorage.getItem('inmovel_user') || '{}'));


const router = useRouter();
const { t: $t, locale: i18nLocale } = useI18n();

import LanguageSelector from '../components/LanguageSelector.vue';

</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-between">
    <!-- Header -->
    <header class="bg-white border-b border-neutral-border py-4 px-4 sm:px-6 md:px-12 flex justify-between items-center shadow-sm">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded bg-goiania-green flex items-center justify-center text-goiania-ipe font-bold text-xl">
          S
        </div>
        <div>
          <h1 class="text-xl font-extrabold tracking-tight text-inmo-brand">SICI</h1>
          <p class="text-[10px] text-neutral-muted uppercase tracking-wider font-semibold">Goiânia - GO</p>
        </div>
      </div>

      <div class="flex items-center space-x-2 sm:space-x-4">
        <!-- Language Dropdown -->
        <LanguageSelector />

        <!-- Access Button Only -->
        <button 
          @click="navigate(token ? 'dashboard' : 'login')"
          class="bg-inmo-primary hover:bg-inmo-brand text-white px-4 py-2 sm:px-5 rounded-lg text-sm font-semibold shadow transition duration-150"
        >
          {{ token ? $t('nav.dashboard') : $t('nav.access') }}
        </button>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="flex-grow">
      <section class="relative overflow-hidden py-16 sm:py-20 px-4 sm:px-6 md:px-12 bg-gradient-to-br from-inmo-brand via-slate-900 to-indigo-950 text-white">
        <!-- Floating shapes -->
        <div class="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-goiania-green/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-goiania-ipe/10 rounded-full blur-3xl"></div>

        <div class="max-w-5xl mx-auto text-center relative z-10">
          <span class="inline-block px-3 py-1 bg-goiania-green/30 border border-goiania-green text-goiania-ipe rounded-full text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            {{ $t('landing.badge') }}
          </span>
          <h2 class="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            {{ $t('landing.heroTitle1') }} <br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-goiania-ipe to-emerald-400">
              {{ $t('landing.heroTitle2') }}
            </span>
          </h2>
          <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {{ $t('landing.heroDesc') }}
          </p>

          <div class="flex justify-center">
            <a 
              href="#features" 
              class="w-full sm:w-auto border border-slate-700 hover:border-slate-500 hover:bg-white/5 text-slate-200 font-semibold px-8 py-4 rounded-xl transition duration-150 text-center"
            >
              {{ $t('landing.viewFeatures') }}
            </a>
          </div>
        </div>
      </section>

      <!-- Key Metrics Strip -->
      <section class="bg-white border-b border-neutral-border py-8 px-4 sm:px-6">
        <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div>
            <div class="text-2xl sm:text-3xl font-black text-inmo-brand">{{ $t('landing.metricCloud') }}</div>
            <div class="text-[10px] sm:text-xs text-neutral-muted font-medium uppercase mt-1">{{ $t('landing.metricCloudLabel') }}</div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-black text-goiania-green">{{ $t('landing.metricCompliance') }}</div>
            <div class="text-[10px] sm:text-xs text-neutral-muted font-medium uppercase mt-1">{{ $t('landing.metricComplianceLabel') }}</div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-black text-inmo-brand">{{ $t('landing.metricDays') }}</div>
            <div class="text-[10px] sm:text-xs text-neutral-muted font-medium uppercase mt-1">{{ $t('landing.metricDaysLabel') }}</div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-black text-goiania-green">{{ $t('landing.metricPdf') }}</div>
            <div class="text-[10px] sm:text-xs text-neutral-muted font-medium uppercase mt-1">{{ $t('landing.metricPdfLabel') }}</div>
          </div>
        </div>
      </section>

      <!-- Features Grid -->
      <section id="features" class="py-16 sm:py-20 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto">
        <div class="text-center mb-12 sm:mb-16">
          <h3 class="text-2xl sm:text-3xl font-extrabold text-inmo-brand tracking-tight mb-4">
            {{ $t('landing.featuresTitle') }}
          </h3>
          <p class="text-neutral-muted max-w-xl mx-auto text-sm sm:text-base">
            {{ $t('landing.featuresDesc') }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <!-- Feature 2 -->
          <div class="bg-white border border-neutral-border p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-200">
            <div class="w-12 h-12 bg-goiania-green/10 rounded-xl flex items-center justify-center text-goiania-green mb-6">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 class="text-lg font-bold text-inmo-brand mb-2">{{ $t('landing.feature2Title') }}</h4>
            <p class="text-sm text-neutral-muted leading-relaxed">
              {{ $t('landing.feature2Desc') }}
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-white border border-neutral-border p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-200">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-6">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 class="text-lg font-bold text-inmo-brand mb-2">{{ $t('landing.feature3Title') }}</h4>
            <p class="text-sm text-neutral-muted leading-relaxed">
              {{ $t('landing.feature3Desc') }}
            </p>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-inmo-brand text-slate-400 py-10 sm:py-12 px-4 sm:px-6 border-t border-slate-800">
      <div class="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 rounded bg-goiania-green flex items-center justify-center text-goiania-ipe font-bold text-xs">
            S
          </div>
          <span class="text-white font-bold text-sm tracking-wider">{{ $t('landing.footerName') }}</span>
        </div>
        <div class="text-xs text-slate-500 text-center md:text-right">
          {{ $t('landing.footerCopy') }}
        </div>
      </div>
    </footer>
  </div>
</template>
