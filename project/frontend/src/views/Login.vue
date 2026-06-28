<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const token = computed(() => localStorage.getItem('inmovel_token'));
const user = computed(() => JSON.parse(localStorage.getItem('inmovel_user') || '{}'));

const router = useRouter();

const phone = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);
const showPassword = ref(false);

const backendUrl = import.meta.env.VITE_API_URL || '/api';

async function handleLogin() {
  if (!phone.value || !password.value) {
    errorMsg.value = 'Erro ao iniciar sessão. Verifique as credenciais.';
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
      errorMsg.value = data.error || 'Erro ao iniciar sessão. Verifique as credenciais.';
    } else {
      localStorage.setItem('inmovel_token', data.token);
      localStorage.setItem('inmovel_user', JSON.stringify(data.user));
      localStorage.setItem('inmovel_session_expires', (Date.now() + 3600000).toString());
      router.push({ name: 'dashboard' });
    }
  } catch (err) {
    errorMsg.value = 'Erro ao iniciar sessão. Verifique as credenciais.';
  } finally {
    isLoading.value = false;
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value;
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 font-sans">
    <div class="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 to-slate-100"></div>

    <div class="relative z-10 w-full max-w-md px-6 flex flex-col items-center justify-center min-h-[600px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden bg-white border border-slate-100 transition-all duration-500 py-12 m-4">
      
      <div class="w-full bg-white flex flex-col justify-center items-center">
        <div class="max-w-sm mx-auto w-full text-center">
          
          <div class="flex flex-col items-center gap-2 mb-10">
            <div class="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-2 shadow-sm">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">SICI</h1>
          </div>

          <div class="mb-8 text-center">
            <h3 class="text-lg font-bold text-slate-900 font-sans mb-1.5">
              Bem-vindo de volta
            </h3>
            <p class="text-xs text-slate-500 font-sans">
              Insira suas credenciais para acessar
            </p>
          </div>

          <div 
            v-if="errorMsg"
            class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-start gap-2 text-left font-sans animate-in fade-in"
          >
            <svg class="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ errorMsg }}</span>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4 text-left">
            
            <div class="space-y-1">
              <label class="sr-only" for="phone">Telefone Celular</label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <input 
                  id="phone"
                  v-model="phone"
                  required
                  type="text" 
                  placeholder="62999999999"
                  class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-0 transition text-sm text-slate-900 font-mono placeholder:text-slate-400/70"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="sr-only" for="password">Senha</label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input 
                  id="password"
                  v-model="password"
                  required
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="Senha"
                  class="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-0 transition text-sm text-slate-900 font-mono placeholder:text-slate-400/70"
                />
                <button 
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors p-1 rounded hover:bg-slate-100/50"
                >
                  <svg v-if="!showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <div class="text-right mt-2">
                <a href="#" class="text-xs font-semibold text-slate-900 hover:underline transition font-sans">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <button 
              type="submit"
              :disabled="isLoading"
              class="w-full bg-slate-900 text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow mt-8 disabled:opacity-50 font-sans"
            >
              <span v-if="isLoading" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span v-else>Entrar no Sistema</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>

    <div class="fixed bottom-6 w-full flex justify-center gap-8 opacity-45 grayscale hover:grayscale-0 transition-all duration-300 z-20 font-sans">
      <div class="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>ISO/IEC 27001 Certified</span>
      </div>
      <div class="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>LGPD Compliant</span>
      </div>
    </div>
  </div>
</template>
