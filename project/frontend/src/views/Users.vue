<script setup lang="ts">
import { computed } from 'vue';
const token = computed(() => localStorage.getItem('inmovel_token'));
const user = computed(() => JSON.parse(localStorage.getItem('inmovel_user') || '{}'));

import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();

import { ref, onMounted } from 'vue';



const backendUrl = import.meta.env.VITE_API_URL || '/api';

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
    usersError.value = $t('settings.errorLoad');
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
    userFormError.value = $t('settings.errorSave');
    return;
  }

  if (!editingUser.value && !userForm.value.password) {
    userFormError.value = $t('settings.errorSave');
    return;
  }

  userFormLoading.value = true;
  userFormError.value = '';

  try {
    let res: Response;
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
      userFormError.value = data.error || $t('settings.errorSave');
      return;
    }

    showUserModal.value = false;
    usersSuccess.value = $t('settings.saveSuccess');
    setTimeout(() => { usersSuccess.value = ''; }, 3000);
    await loadUsers();
  } catch {
    userFormError.value = $t('settings.errorSave');
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
      usersError.value = data.error || $t('settings.errorDelete');
      return;
    }

    showDeleteConfirm.value = false;
    usersSuccess.value = $t('settings.deleteSuccess');
    setTimeout(() => { usersSuccess.value = ''; }, 3000);
    await loadUsers();
  } catch {
    usersError.value = $t('settings.errorDelete');
  } finally {
    deleteLoading.value = false;
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto space-y-8">

    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-border pb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-inmo-brand tracking-tight">
            Gerenciamento de Usuários
          </h1>
          <p class="text-sm text-neutral-muted mt-1">Gestão de acessos e contas da plataforma.</p>
        </div>
        <button
          @click="openCreateModal"
          class="w-full sm:w-auto flex items-center justify-center space-x-2 bg-goiania-green hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-lg text-sm shadow transition duration-150"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ $t('settings.addUser') }}</span>
        </button>
      </div>


      <div 
        v-if="usersSuccess"
        class="p-3 bg-emerald-50 border-l-4 border-goiania-green text-goiania-green rounded text-sm font-semibold"
      >
        {{ usersSuccess }}
      </div>


      <div 
        v-if="usersError"
        class="p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded text-sm font-semibold"
      >
        {{ usersError }}
      </div>


      <div v-if="usersLoading" class="text-center py-10">
        <div class="w-8 h-8 border-4 border-inmo-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>


      <div v-else class="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 text-xs text-neutral-muted uppercase border-b border-neutral-border">
                <th class="text-left px-4 sm:px-6 py-3 font-semibold">{{ $t('settings.userName') }}</th>
                <th class="text-left px-4 sm:px-6 py-3 font-semibold">{{ $t('settings.userPhone') }}</th>
                <th class="text-left px-4 sm:px-6 py-3 font-semibold hidden sm:table-cell">{{ $t('settings.userRole') }}</th>
                <th class="text-right px-4 sm:px-6 py-3 font-semibold">{{ $t('settings.userActions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="u in users" 
                :key="u.id"
                class="border-b border-neutral-border last:border-b-0 hover:bg-slate-50 transition"
              >
                <td class="px-4 sm:px-6 py-4 font-medium text-neutral-dark">
                  <div>{{ u.name }}</div>
                  <div class="sm:hidden text-xs text-neutral-muted mt-0.5">{{ u.role }}</div>
                </td>
                <td class="px-4 sm:px-6 py-4 text-neutral-muted font-mono text-xs sm:text-sm">{{ u.phone }}</td>
                <td class="px-4 sm:px-6 py-4 hidden sm:table-cell">
                  <span class="inline-block px-2 py-1 bg-inmo-primary/10 text-inmo-primary text-xs font-bold rounded-full">
                    {{ u.role }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-4 text-right">
                  <div class="flex items-center justify-end space-x-2">

                    <button 
                      @click="openEditModal(u)"
                      class="p-1.5 rounded-lg bg-inmo-primary/10 text-inmo-primary hover:bg-inmo-primary/20 transition"
                      :title="$t('settings.editUser')"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button 
                      v-if="user?.id !== u.id"
                      @click="openDeleteConfirm(u)"
                      class="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                      :title="$t('settings.deleteConfirm')"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="4" class="px-6 py-10 text-center text-neutral-muted text-sm">
                  No hay usuarios registrados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>


    <teleport to="body">
      <div 
        v-if="showUserModal"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
      >

        <div @click="showUserModal = false" class="absolute inset-0 bg-black/50"></div>
        

        <div class="relative bg-white rounded-2xl shadow-xl border border-neutral-border w-full max-w-md p-6 sm:p-8 z-10">
          <h3 class="text-lg font-bold text-inmo-brand mb-6">
            {{ editingUser ? $t('settings.editUser') : $t('settings.createUser') }}
          </h3>


          <div 
            v-if="userFormError"
            class="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded text-sm"
          >
            {{ userFormError }}
          </div>

          <form @submit.prevent="handleUserSave" class="space-y-4">
            <div>
              <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">
                {{ $t('settings.userName') }}
              </label>
              <input
                v-model="userForm.name"
                type="text"
                required
                class="w-full px-4 py-2.5 bg-slate-50 border border-neutral-border rounded-lg text-sm text-neutral-dark focus:outline-none focus:border-inmo-primary transition"
              />
            </div>

            <div>
              <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">
                {{ $t('settings.userPhone') }}
              </label>
              <input
                v-model="userForm.phone"
                type="text"
                required
                placeholder="62999999999"
                class="w-full px-4 py-2.5 bg-slate-50 border border-neutral-border rounded-lg text-sm text-neutral-dark focus:outline-none focus:border-inmo-primary transition"
              />
            </div>

            <div>
              <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">
                {{ $t('settings.userPassword') }}
                <span v-if="editingUser" class="normal-case text-neutral-muted font-normal">(dejar vacío para no cambiar)</span>
              </label>
              <input
                v-model="userForm.password"
                type="password"
                :required="!editingUser"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 bg-slate-50 border border-neutral-border rounded-lg text-sm text-neutral-dark focus:outline-none focus:border-inmo-primary transition"
              />
            </div>

            <div>
              <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">
                {{ $t('settings.userRole') }}
              </label>
              <select
                v-model="userForm.role"
                class="w-full px-4 py-2.5 bg-slate-50 border border-neutral-border rounded-lg text-sm text-neutral-dark focus:outline-none focus:border-inmo-primary font-medium"
              >
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                :disabled="userFormLoading"
                class="flex-1 py-2.5 bg-inmo-primary hover:bg-inmo-brand text-white font-bold rounded-lg text-sm shadow transition duration-150 flex items-center justify-center space-x-2"
              >
                <span v-if="userFormLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ editingUser ? $t('settings.editUser') : $t('settings.createUser') }}</span>
              </button>
              <button
                type="button"
                @click="showUserModal = false"
                class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-neutral-dark font-bold rounded-lg text-sm transition duration-150"
              >
                {{ $t('properties.cancel') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>


    <teleport to="body">
      <div 
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
      >

        <div @click="showDeleteConfirm = false" class="absolute inset-0 bg-black/50"></div>
        

        <div class="relative bg-white rounded-2xl shadow-xl border border-neutral-border w-full max-w-sm p-6 z-10 text-center">
          <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-sm text-neutral-dark mb-1 font-semibold">{{ $t('settings.deleteConfirm') }}</p>
          <p class="text-xs text-neutral-muted mb-6">{{ deletingUser?.name }} ({{ deletingUser?.phone }})</p>

          <div class="flex gap-3">
            <button
              @click="showDeleteConfirm = false"
              class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-neutral-dark font-bold rounded-lg text-sm transition"
            >
              {{ $t('properties.cancel') }}
            </button>
            <button
              @click="handleDelete"
              :disabled="deleteLoading"
              class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-sm shadow transition flex items-center justify-center space-x-2"
            >
              <span v-if="deleteLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ $t('nav.logout') === 'Sair' ? 'Excluir' : 'Eliminar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>
