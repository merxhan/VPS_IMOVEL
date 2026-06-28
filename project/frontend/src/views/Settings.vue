<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useToast } from '../utils/useToast';

const token = computed(() => localStorage.getItem('inmovel_token'));
const user = computed(() => JSON.parse(localStorage.getItem('inmovel_user') || '{}'));
const toast = useToast();

interface UserItem {
  id: string;
  name: string;
  phone: string;
  role: string;
  createdAt?: string;
}

const users = ref<UserItem[]>([]);
const usersLoading = ref(false);
const usersError = ref('');
const usersSuccess = ref('');

const backendUrl = import.meta.env.VITE_API_URL || '/api';


const showUserModal = ref(false);
const editingUser = ref<UserItem | null>(null);
const userForm = ref({ name: '', phone: '', password: '', role: 'ADMIN' });
const userFormError = ref('');
const userFormLoading = ref(false);


const showDeleteConfirm = ref(false);
const deletingUser = ref<UserItem | null>(null);
const deleteLoading = ref(false);

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`,
  };
}

async function loadUsers() {
  usersLoading.value = true;
  usersError.value = '';
  try {
    const res = await fetch(`${backendUrl}/auth/users`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error();
    users.value = await res.json();
  } catch {
    usersError.value = 'Erro ao carregar os usuários do sistema.';
    toast.error(usersError.value);
  } finally {
    usersLoading.value = false;
  }
}

function openCreateModal() {
  editingUser.value = null;
  userForm.value = { name: '', phone: '', password: '', role: 'ADMIN' };
  userFormError.value = '';
  showUserModal.value = true;
}

function openEditModal(u: UserItem) {
  editingUser.value = u;
  userForm.value = { name: u.name, phone: u.phone, password: '', role: u.role };
  userFormError.value = '';
  showUserModal.value = true;
}

async function handleUserSave() {
  if (!userForm.value.name || !userForm.value.phone) {
    userFormError.value = 'Por favor, preencha todos os campos obrigatórios.';
    return;
  }

  if (!editingUser.value && !userForm.value.password) {
    userFormError.value = 'Por favor, preencha todos os campos obrigatórios.';
    return;
  }

  userFormLoading.value = true;
  userFormError.value = '';

  try {
    let res: Response;
    const isNew = !editingUser.value;
    if (editingUser.value) {
      const body: any = {
        name: userForm.value.name,
        phone: userForm.value.phone,
        role: userForm.value.role,
      };
      if (userForm.value.password) body.password = userForm.value.password;

      res = await fetch(`${backendUrl}/auth/users/${editingUser.value.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(userForm.value),
      });
    }

    if (!res.ok) {
      const data = await res.json();
      userFormError.value = data.error || 'Erro ao salvar o usuário.';
      toast.error(userFormError.value);
      return;
    }

    showUserModal.value = false;
    if (isNew) {
      toast.success('Usuário cadastrado com sucesso!');
    } else {
      toast.info('Usuário atualizado com sucesso!');
    }
    await loadUsers();
  } catch {
    userFormError.value = 'Erro de rede ao conectar ao servidor.';
    toast.error(userFormError.value);
  } finally {
    userFormLoading.value = false;
  }
}

function openDeleteConfirm(u: UserItem) {
  deletingUser.value = u;
  showDeleteConfirm.value = true;
}

async function handleDelete() {
  if (!deletingUser.value) return;
  deleteLoading.value = true;

  try {
    const res = await fetch(`${backendUrl}/auth/users/${deletingUser.value.id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!res.ok) {
      const data = await res.json();
      usersError.value = data.error || 'Erro ao excluir o usuário.';
      toast.error(usersError.value);
      return;
    }

    showDeleteConfirm.value = false;
    toast.error('Usuário excluído com sucesso!');
    await loadUsers();
  } catch {
    usersError.value = 'Erro ao excluir o usuário.';
    toast.error(usersError.value);
  } finally {
    deleteLoading.value = false;
  }
}


function getInitials(name: string): string {
  if (!name) return 'US';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-8 relative">
    
    <div class="border-b border-slate-100 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 font-sans">
          Configurações
        </h2>
        <p class="text-sm text-slate-500 mt-1 font-sans">
          Administre as preferências globais e o acesso de usuários do sistema.
        </p>
      </div>
      
      <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 max-w-sm shrink-0">
        <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-[11px] font-sans leading-normal">
          Parâmetros: Goiânia-GO (UTC-3). Fuso horário de persistência e relatórios ativo.
        </span>
      </div>
    </div>

    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="lg:col-span-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition">
        <div>
          
          <div class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-slate-100 rounded-lg text-slate-700">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 font-sans">Controle de Acesso</h3>
                <p class="text-xs text-slate-400 font-sans mt-0.5">Administre os usuários com permissão para acessar o painel administrativo</p>
              </div>
            </div>
            <button 
              @click="openCreateModal"
              class="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 active:scale-95 transition-all shadow-sm font-sans"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>NOVO USUÁRIO</span>
            </button>
          </div>

          
          <div v-if="usersSuccess" class="m-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2 font-sans">
            <svg class="w-4.5 h-4.5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>{{ usersSuccess }}</span>
          </div>

          <div v-if="usersError" class="m-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2 font-sans">
            <svg class="w-4.5 h-4.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ usersError }}</span>
          </div>

          
          <div v-if="usersLoading" class="py-12 flex justify-center items-center">
            <div class="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          </div>

          
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[500px]">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Nome do Usuário</th>
                  <th class="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Nível de Acesso</th>
                  <th class="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr 
                  v-for="u in users" 
                  :key="u.id"
                  class="hover:bg-slate-50/50 transition-colors"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 font-sans">
                        {{ getInitials(u.name) }}
                      </div>
                      <div>
                        <p class="font-semibold text-slate-900 text-sm font-sans">{{ u.name }}</p>
                        <p class="text-xs text-slate-400 font-mono mt-0.5">{{ u.phone }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white font-sans uppercase">
                      {{ u.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button 
                        @click="openEditModal(u)"
                        class="text-slate-400 hover:text-slate-900 p-1.5 rounded hover:bg-slate-100 transition"
                        title="Editar permissões"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        v-if="user?.id !== u.id"
                        @click="openDeleteConfirm(u)"
                        class="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-slate-100 transition"
                        title="Excluir usuário"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="users.length === 0">
                  <td colspan="3" class="px-6 py-12 text-center text-slate-400 text-sm italic font-sans">
                    Nenhum usuário registrado no sistema.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        
        <div class="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <p class="text-xs font-semibold text-slate-500 font-sans">
            Mostrando {{ users.length }} de {{ users.length }} usuários registrados
          </p>
          <div class="flex gap-1">
            <button disabled class="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-300 cursor-not-allowed text-xs transition">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button disabled class="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-300 cursor-not-allowed text-xs transition">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    
    <footer class="p-6 border-t border-slate-200 text-center font-sans">
      <p class="text-xs text-slate-400 font-medium tracking-wide">
        SICI © 2026 - Sistema Integrado de Controle Imobiliário. Todos os direitos reservados.
      </p>
    </footer>

    
    <div 
      v-if="showUserModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div class="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        
        <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 class="text-base font-bold text-slate-900 font-sans">
            {{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}
          </h3>
          <button @click="showUserModal = false" class="text-slate-400 hover:text-red-500 font-bold p-1 rounded hover:bg-slate-100 transition">✕</button>
        </div>

        
        <form @submit.prevent="handleUserSave" class="p-6 space-y-4 flex-1">
          
          <div v-if="userFormError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2 font-sans">
            <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ userFormError }}</span>
          </div>

          
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
              Nome de Usuário *
            </label>
            <input
              v-model="userForm.name"
              type="text"
              required
              class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-0 transition font-sans"
            />
          </div>

          
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
              Telefone Celular *
            </label>
            <input
              v-model="userForm.phone"
              type="text"
              required
              placeholder="62999999999"
              class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-0 transition font-mono"
            />
          </div>

          
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
              Senha
              <span v-if="editingUser" class="normal-case text-slate-400 font-normal font-sans">(deixe em branco para não alterar)</span>
              <span v-else class="text-slate-500">*</span>
            </label>
            <input
              v-model="userForm.password"
              type="password"
              :required="!editingUser"
              placeholder="••••••••"
              class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-0 transition font-mono"
            />
          </div>

          
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
              Função de Acesso *
            </label>
            <select
              v-model="userForm.role"
              class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-0 font-medium transition font-sans appearance-none"
            >
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          
          <div class="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="showUserModal = false"
              class="flex-1 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded text-sm transition font-sans"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="userFormLoading"
              class="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-sm shadow transition flex items-center justify-center gap-1.5 font-sans"
            >
              <span v-if="userFormLoading" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ editingUser ? 'SALVAR ALTERAÇÕES' : 'CRIAR USUÁRIO' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    
    <div 
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div class="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 z-10 text-center animate-in fade-in zoom-in duration-200 flex flex-col items-center">
        <div class="w-12 h-12 mb-4 rounded-full bg-red-50 flex items-center justify-center border border-red-100 text-red-500">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h4 class="text-sm font-bold text-slate-950 font-sans mb-1">Confirmar Exclusão</h4>
        <p class="text-xs text-slate-500 font-sans mb-6 font-medium">{{ deletingUser?.name }} ({{ deletingUser?.phone }})</p>

        <div class="flex gap-3 w-full">
          <button
            @click="showDeleteConfirm = false"
            class="flex-1 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded text-sm transition font-sans"
          >
            Cancelar
          </button>
          <button
            @click="handleDelete"
            :disabled="deleteLoading"
            class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded text-sm shadow transition flex items-center justify-center gap-1.5 font-sans"
          >
            <span v-if="deleteLoading" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>EXCLUIR</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
