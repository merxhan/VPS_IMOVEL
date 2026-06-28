<script setup lang="ts">
import { useToast } from '../utils/useToast';

const { toasts, removeToast } = useToast();
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
    <TransitionGroup 
      name="toast" 
      tag="div" 
      class="flex flex-col gap-3 w-full"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 w-full bg-white',
          toast.type === 'success' ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800' : '',
          toast.type === 'info' ? 'border-blue-200 bg-blue-50/90 text-blue-800' : '',
          toast.type === 'error' ? 'border-red-200 bg-red-50/90 text-red-800' : ''
        ]"
      >
        
        <span class="shrink-0 mt-0.5">
          
          <svg v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          
          <svg v-else-if="toast.type === 'info'" class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </span>

        
        <div class="flex-grow text-xs font-semibold font-sans leading-relaxed">
          {{ toast.text }}
        </div>

        
        <button 
          @click="removeToast(toast.id)"
          class="shrink-0 p-0.5 rounded-full hover:bg-black/5 text-slate-400 hover:text-slate-600 transition"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
