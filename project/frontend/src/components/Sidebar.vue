<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { token, user, clearSession } from '../utils/auth';

const router = useRouter();

const props = defineProps<{
  mobileOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isCollapsed = ref(false);

function handleNav(view: any) {
  router.push({ name: view });
  emit('close');
}

function handleLogout() {
  clearSession();
  router.push({ name: 'login' });
  emit('close');
}
</script>

<template>
  
  <aside 
    v-if="token"
    :class="[
      'hidden md:flex bg-sici-primary text-white h-screen flex-col justify-between shadow-lg shrink-0 transition-all duration-300',
      isCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    
    <div>
      <div class="p-4 border-b border-slate-700/50 flex items-center h-20" :class="isCollapsed ? 'justify-center' : 'justify-between'">
        <div class="flex items-center space-x-3 overflow-hidden" v-if="!isCollapsed">
          <div class="w-8 h-8 rounded bg-sici-accent flex items-center justify-center text-white font-bold text-lg shrink-0">
            S
          </div>
          <div class="whitespace-nowrap">
            <h1 class="text-lg font-bold tracking-wide">SICI</h1>
            <span class="text-xs text-slate-400 block">Goiânia - GO</span>
          </div>
        </div>
        <button @click="isCollapsed = !isCollapsed" class="text-slate-400 hover:text-white transition p-1 shrink-0">
          <svg v-if="!isCollapsed" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      
      <nav class="mt-6 px-3 space-y-2">
        <button
          @click="handleNav('dashboard')"
          :title="isCollapsed ? 'Painel de Controle' : ''"
          :class="[
            'w-full flex items-center py-3 rounded-lg text-sm font-medium transition-all duration-150',
            router.currentRoute.value.name === 'dashboard' 
              ? 'bg-sici-accent text-white shadow-md' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white',
            isCollapsed ? 'justify-center px-0' : 'px-4 space-x-3'
          ]"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
          <span v-if="!isCollapsed" class="whitespace-nowrap">Painel de Controle</span>
        </button>

        <button
          @click="handleNav('properties')"
          :title="isCollapsed ? 'Imóveis' : ''"
          :class="[
            'w-full flex items-center py-3 rounded-lg text-sm font-medium transition-all duration-150',
            router.currentRoute.value.name === 'properties' 
              ? 'bg-sici-accent text-white shadow-md' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white',
            isCollapsed ? 'justify-center px-0' : 'px-4 space-x-3'
          ]"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span v-if="!isCollapsed" class="whitespace-nowrap">Imóveis</span>
        </button>

        <button
          @click="handleNav('tenants')"
          :title="isCollapsed ? 'Inquilinos' : ''"
          :class="[
            'w-full flex items-center py-3 rounded-lg text-sm font-medium transition-all duration-150',
            router.currentRoute.value.name === 'tenants' 
              ? 'bg-sici-accent text-white shadow-md' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white',
            isCollapsed ? 'justify-center px-0' : 'px-4 space-x-3'
          ]"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span v-if="!isCollapsed" class="whitespace-nowrap">Inquilinos</span>
        </button>

        <button
          @click="handleNav('settings')"
          :title="isCollapsed ? 'Configurações' : ''"
          :class="[
            'w-full flex items-center py-3 rounded-lg text-sm font-medium transition-all duration-150',
            router.currentRoute.value.name === 'setting' 
              ? 'bg-sici-accent text-white shadow-md' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white',
            isCollapsed ? 'justify-center px-0' : 'px-4 space-x-3'
          ]"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span v-if="!isCollapsed" class="whitespace-nowrap">Configurações</span>
        </button>
      </nav>
    </div>

    
    <div class="p-4 border-t border-slate-700/50 bg-slate-900/40">
      <div v-if="!isCollapsed" class="flex items-center space-x-3 mb-3">
        <div class="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-sici-warning shrink-0">
          {{ user?.name?.substring(0, 2).toUpperCase() || 'AD' }}
        </div>
        <div class="overflow-hidden">
          <div class="text-xs font-bold truncate text-slate-100">{{ user?.name || 'Administrador' }}</div>
          <div class="text-[10px] text-slate-400 truncate">{{ user?.phone }}</div>
        </div>
      </div>
      <div v-else class="flex justify-center mb-3">
        <div class="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-sici-warning shrink-0" :title="user?.name || 'Administrador'">
          {{ user?.name?.substring(0, 2).toUpperCase() || 'AD' }}
        </div>
      </div>
      <button
        @click="handleLogout"
        :class="[
          'flex items-center justify-center py-2 bg-red-950/40 hover:bg-red-900/50 border border-red-900/30 rounded-lg text-xs text-red-300 font-semibold transition duration-150',
          isCollapsed ? 'w-full px-0' : 'w-full px-3 space-x-2'
        ]"
        :title="isCollapsed ? 'Sair' : ''"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span v-if="!isCollapsed" class="whitespace-nowrap">Sair</span>
      </button>
    </div>
  </aside>

  
  <teleport to="body">
    <transition name="fade">
      <div 
        v-if="token && mobileOpen" 
        @click="emit('close')"
        class="md:hidden fixed inset-0 bg-black/50 z-40"
      ></div>
    </transition>
    <transition name="slide-right">
      <aside 
        v-if="token && mobileOpen"
        class="md:hidden fixed inset-y-0 right-0 w-72 bg-sici-primary text-white z-50 flex flex-col justify-between shadow-2xl"
      >
        
        <div>
          <div class="p-5 border-b border-slate-700/50 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded bg-sici-accent flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <div>
                <h1 class="text-lg font-bold tracking-wide">SICI</h1>
                <span class="text-xs text-slate-400 block">Goiânia - GO</span>
              </div>
            </div>
            
            <button @click="emit('close')" class="text-slate-400 hover:text-white transition p-1">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          
          <nav class="mt-4 px-4 space-y-1">
            <button
              @click="handleNav('dashboard')"
              :class="[
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150',
                router.currentRoute.value.name === 'dashboard' 
                  ? 'bg-sici-accent text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              ]"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              <span>Painel de Controle</span>
            </button>

            <button
              @click="handleNav('properties')"
              :class="[
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150',
                router.currentRoute.value.name === 'properties' 
                  ? 'bg-sici-accent text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              ]"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Imóveis</span>
            </button>

            <button
              @click="handleNav('tenants')"
              :class="[
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150',
                router.currentRoute.value.name === 'tenants' 
                  ? 'bg-sici-accent text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              ]"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Inquilinos</span>
            </button>

            <button
              @click="handleNav('settings')"
              :class="[
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150',
                router.currentRoute.value.name === 'setting' 
                  ? 'bg-sici-accent text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              ]"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Configurações</span>
            </button>
          </nav>
        </div>

        
        <div class="p-4 border-t border-slate-700/50 bg-slate-900/40">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-sici-warning shrink-0">
              {{ user?.name?.substring(0, 2).toUpperCase() || 'AD' }}
            </div>
            <div class="overflow-hidden">
              <div class="text-xs font-bold truncate text-slate-100">{{ user?.name || 'Administrador' }}</div>
              <div class="text-[10px] text-slate-400 truncate">{{ user?.phone }}</div>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-red-950/40 hover:bg-red-900/50 border border-red-900/30 rounded-lg text-xs text-red-300 font-semibold transition duration-150"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </transition>
  </teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Updated transition for right slide */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
