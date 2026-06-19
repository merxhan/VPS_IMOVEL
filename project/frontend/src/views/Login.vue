<script setup lang="ts">
import { computed } from 'vue';
const token = computed(() => localStorage.getItem('inmovel_token'));
const user = computed(() => JSON.parse(localStorage.getItem('inmovel_user') || '{}'));

import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t: $t, locale: i18nLocale } = useI18n();

import { ref } from 'vue';

const phone = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

const backendUrl = import.meta.env.VITE_API_URL || '/api';

async function handleLogin() {
  if (!phone.value || !password.value) {
    errorMsg.value = $t('auth.error');
    return;
  }

  errorMsg.value = '';
  isLoading.value = true;

  try {
    const res = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone.value,
        password: password.value,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      errorMsg.value = data.error || $t('auth.error');
    } else {
      localStorage.setItem('inmovel_token', data.token);
      localStorage.setItem('inmovel_user', JSON.stringify(data.user));
      router.push({ name: 'dashboard' });
    }
  } catch (err) {
    errorMsg.value = $t('auth.error');
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-inmo-light px-4">
    <div class="max-w-md w-full bg-white border border-neutral-border rounded-2xl p-6 sm:p-8 shadow-md">
      <!-- Title -->
      <div class="text-center mb-8">
        <div class="inline-flex w-12 h-12 rounded-xl bg-inmo-brand text-goiania-ipe items-center justify-center font-bold text-2xl mb-4">
          S
        </div>
        <h2 class="text-2xl font-bold text-inmo-brand">{{ $t('auth.title') }}</h2>
        <p class="text-xs text-neutral-muted mt-1">SICI - Goiânia-GO (UTC-3)</p>
      </div>

      <!-- Error Alert -->
      <div 
        v-if="errorMsg"
        class="mb-6 p-4 bg-yellow-50 border-l-4 border-goiania-ipe text-yellow-900 rounded text-sm flex items-start space-x-2"
      >
        <!-- Warning Icon -->
        <svg class="w-5 h-5 text-goiania-ipe shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{{ errorMsg }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label for="phone" class="block text-xs uppercase font-semibold text-neutral-muted mb-2">
            {{ $t('auth.phone') }}
          </label>
          <input
            id="phone"
            v-model="phone"
            type="text"
            placeholder="Ej: 62999999999"
            class="w-full px-4 py-3 bg-slate-50 border border-neutral-border rounded-lg text-sm text-neutral-dark focus:outline-none focus:border-inmo-primary transition"
          />
        </div>

        <div>
          <label for="password" class="block text-xs uppercase font-semibold text-neutral-muted mb-2">
            {{ $t('auth.password') }}
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-slate-50 border border-neutral-border rounded-lg text-sm text-neutral-dark focus:outline-none focus:border-inmo-primary transition"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 bg-inmo-primary hover:bg-inmo-brand text-white font-bold rounded-lg text-sm shadow transition duration-150 flex items-center justify-center space-x-2"
        >
          <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ $t('auth.btn') }}</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <button 
          @click="router.push({ name: 'landing' })"
          class="text-xs text-neutral-muted hover:text-inmo-primary transition underline"
        >
          {{ $t('auth.backToHome') }}
        </button>
      </div>
    </div>
  </div>
</template>
