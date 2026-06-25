import { ref } from 'vue';

export interface Toast {
  id: number;
  text: string;
  type: 'success' | 'info' | 'error';
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useToast() {
  const addToast = (text: string, type: 'success' | 'info' | 'error') => {
    const id = ++nextId;
    toasts.value.push({ id, text, type });
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  return {
    toasts,
    success: (text: string) => addToast(text, 'success'),
    info: (text: string) => addToast(text, 'info'),
    error: (text: string) => addToast(text, 'error'),
    removeToast,
  };
}
