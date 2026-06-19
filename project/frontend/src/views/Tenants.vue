<script setup lang="ts">
import { computed } from 'vue';
const token = computed(() => localStorage.getItem('inmovel_token'));
const user = computed(() => JSON.parse(localStorage.getItem('inmovel_user') || '{}'));

import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t: $t, locale: i18nLocale } = useI18n();

import { ref, onMounted } from 'vue';


import { isValidCPF, isValidCNPJ } from '../utils/validators';

interface Documento {
  id: string;
  name: string;
  filePath: string;
  fileSize: number;
}

interface Property {
  id: string;
  name: string;
  address: string;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentValue: string;
  contractStart: string | null;
  contractEnd: string | null;
  propertyId: string | null;
  property: Property | null;
  documents: Documento[];
}

const tenants = ref<Tenant[]>([]);
const properties = ref<Property[]>([]);
const search = ref('');
const isLoading = ref(true);

const backendUrl = import.meta.env.VITE_API_URL || '/api';

// Modal and Form States
const showFormModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const formName = ref('');
const formEmail = ref('');
const formPhone = ref('');
const formDocType = ref('CPF');
const formDocValue = ref('');
const formContractStart = ref('');
const formContractEnd = ref('');
const formPropertyId = ref('');
const formError = ref('');

// Drawer States for Documents
const showDocDrawer = ref(false);
const selectedTenant = ref<Tenant | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const docError = ref('');
const docUploading = ref(false);

// Format date helper
function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// Format document helper
function formatDocument(type: string, value: string) {
  const clean = value.replace(/\D/g, '');
  if (type === 'CPF' && clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (type === 'CNPJ' && clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
}

// Fetch tenants
async function fetchTenants() {
  isLoading.value = true;
  try {
    const params = new URLSearchParams();
    if (search.value) params.append('search', search.value);

    const res = await fetch(`${backendUrl}/tenants?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (res.ok) {
      tenants.value = await res.json();
    }
  } catch (err) {
    console.error('Error fetching tenants:', err);
  } finally {
    isLoading.value = false;
  }
}

// Fetch properties for assignment
async function fetchProperties() {
  try {
    const res = await fetch(`${backendUrl}/properties`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });
    if (res.ok) {
      properties.value = await res.json();
    }
  } catch (err) {
    console.error('Error fetching properties:', err);
  }
}

onMounted(() => {
  if (token.value) {
    fetchTenants();
    fetchProperties();
  }
});

// Create or Update
async function handleSubmit() {
  if (!formName.value || !formEmail.value || !formPhone.value || !formDocType.value || !formDocValue.value) {
    formError.value = 'Por favor complete todos los campos obligatorios.';
    return;
  }

  // Validate CPF/CNPJ client-side
  const cleanDoc = formDocValue.value.replace(/\D/g, '');
  const isValid = formDocType.value === 'CPF' ? isValidCPF(cleanDoc) : isValidCNPJ(cleanDoc);
  if (!isValid) {
    formError.value = `El número de ${formDocType.value} ingresado no es válido mathematically.`;
    return;
  }

  // format correctly
  const formattedDoc = formatDocument(formDocType.value, cleanDoc);

  formError.value = '';
  const url = isEditing.value ? `${backendUrl}/tenants/${editingId.value}` : `${backendUrl}/tenants`;
  const method = isEditing.value ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        name: formName.value,
        email: formEmail.value,
        phone: formPhone.value,
        documentType: formDocType.value,
        documentValue: formattedDoc,
        contractStart: formContractStart.value || null,
        contractEnd: formContractEnd.value || null,
        propertyId: formPropertyId.value || null,
      }),
    });

    if (res.ok) {
      showFormModal.value = false;
      resetForm();
      fetchTenants();
      fetchProperties(); // Refresh properties availability status
    } else {
      const data = await res.json();
      formError.value = data.error || 'Error al guardar el inquilino.';
    }
  } catch (err) {
    formError.value = 'Error de red al conectar al servidor.';
  }
}

// Edit Action
function editTenant(tenant: Tenant) {
  isEditing.value = true;
  editingId.value = tenant.id;
  formName.value = tenant.name;
  formEmail.value = tenant.email;
  formPhone.value = tenant.phone;
  formDocType.value = tenant.documentType;
  formDocValue.value = tenant.documentValue;
  formContractStart.value = tenant.contractStart ? tenant.contractStart.split('T')[0] : '';
  formContractEnd.value = tenant.contractEnd ? tenant.contractEnd.split('T')[0] : '';
  formPropertyId.value = tenant.propertyId || '';
  formError.value = '';
  showFormModal.value = true;
}

// Delete Action
async function deleteTenant(id: string) {
  if (!confirm('¿Está seguro de que desea eliminar este inquilino?')) return;

  try {
    const res = await fetch(`${backendUrl}/tenants/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (res.ok) {
      fetchTenants();
      fetchProperties();
    }
  } catch (err) {
    console.error('Error deleting tenant:', err);
  }
}

// Open Documents Drawer
function openDocsDrawer(tenant: Tenant) {
  selectedTenant.value = tenant;
  docError.value = '';
  showDocDrawer.value = true;
}

// Handle PDF Document Upload
async function handleDocUpload() {
  const file = fileInput.value?.files?.[0];
  if (!file) {
    docError.value = 'Por favor, seleccione un archivo.';
    return;
  }

  // Client side validation
  if (file.type !== 'application/pdf') {
    docError.value = 'Formato inválido. Solo se admiten archivos PDF.';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    docError.value = 'El archivo excede el límite máximo permitido de 5MB.';
    return;
  }

  docError.value = '';
  docUploading.value = true;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${backendUrl}/tenants/${selectedTenant.value?.id}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      selectedTenant.value?.documents.push(data);
      if (fileInput.value) fileInput.value.value = '';
      fetchTenants();
    } else {
      docError.value = data.error || 'Error al cargar el archivo.';
    }
  } catch (err) {
    docError.value = 'Error al subir el archivo al servidor.';
  } finally {
    docUploading.value = false;
  }
}

function getDocDownloadUrl(filePath: string) {
  return `${backendUrl}/documents/download/${filePath}`;
}

function resetForm() {
  isEditing.value = false;
  editingId.value = null;
  formName.value = '';
  formEmail.value = '';
  formPhone.value = '';
  formDocType.value = 'CPF';
  formDocValue.value = '';
  formContractStart.value = '';
  formContractEnd.value = '';
  formPropertyId.value = '';
  formError.value = '';
}
</script>

<template>
  <div class="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8 relative">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-border pb-6">
      <div>
        <h1 class="text-3xl font-black text-inmo-brand tracking-tight">
          {{ $t('tenants.title') }}
        </h1>
        <p class="text-sm text-neutral-muted mt-1">
          {{ $t('tenants.subtitle') }}
        </p>
      </div>
      <button 
        @click="resetForm(); showFormModal = true"
        class="mt-4 sm:mt-0 bg-inmo-primary hover:bg-inmo-brand text-white font-bold px-4 py-2.5 rounded-lg text-sm shadow transition duration-150 flex items-center space-x-2"
      >
        <span>+</span>
        <span>{{ $t('tenants.addBtn') }}</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white border border-neutral-border p-4 rounded-xl flex">
      <input 
        v-model="search"
        @input="fetchTenants"
        type="text" 
        placeholder="Buscar inquilino por nombre, email o CPF/CNPJ..."
        class="w-full px-4 py-2 bg-slate-50 border border-neutral-border rounded-lg text-sm text-neutral-dark focus:outline-none focus:border-inmo-primary"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-20 flex flex-col items-center justify-center space-y-4">
      <div class="w-12 h-12 border-4 border-inmo-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm text-neutral-muted">Buscando inquilinos...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="tenants.length === 0" class="py-16 text-center text-neutral-muted border border-dashed border-neutral-border rounded-2xl bg-white">
      Ningún inquilino registrado.
    </div>

    <!-- Table List -->
    <div v-else class="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-inmo-brand text-white text-xs font-semibold uppercase tracking-wider text-left border-b border-neutral-border">
              <th class="py-4 px-6">{{ $t('tenants.name') }}</th>
              <th class="py-4 px-6">{{ $t('tenants.docValue') }}</th>
              <th class="py-4 px-6">{{ $t('tenants.property') }}</th>
              <th class="py-4 px-6">{{ $t('tenants.contractStart') }}</th>
              <th class="py-4 px-6">{{ $t('tenants.contractEnd') }}</th>
              <th class="py-4 px-6 text-center">{{ $t('properties.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-border text-sm">
            <tr 
              v-for="tenant in tenants" 
              :key="tenant.id"
              class="hover:bg-slate-50/50 transition"
            >
              <td class="py-4 px-6">
                <div class="font-bold text-neutral-dark">{{ tenant.name }}</div>
                <div class="text-xs text-neutral-muted flex flex-col sm:flex-row sm:space-x-3">
                  <span>{{ tenant.email }}</span>
                  <span class="hidden sm:inline">•</span>
                  <span>{{ tenant.phone }}</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 mr-2">
                  {{ tenant.documentType }}
                </span>
                <span class="font-mono text-xs font-semibold">{{ tenant.documentValue }}</span>
              </td>
              <td class="py-4 px-6">
                <div v-if="tenant.property" class="max-w-[200px]">
                  <div class="font-semibold text-neutral-dark truncate" :title="tenant.property.name">
                    {{ tenant.property.name }}
                  </div>
                  <div class="text-[10px] text-neutral-muted truncate">{{ tenant.property.address }}</div>
                </div>
                <span v-else class="text-neutral-muted text-xs italic">Sin vinculación</span>
              </td>
              <td class="py-4 px-6 font-medium text-xs">{{ formatDate(tenant.contractStart) }}</td>
              <td class="py-4 px-6 font-medium text-xs">{{ formatDate(tenant.contractEnd) }}</td>
              <td class="py-4 px-6">
                <div class="flex justify-center items-center space-x-3">
                  <button 
                    @click="openDocsDrawer(tenant)"
                    class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-neutral-dark rounded border border-neutral-border text-xs flex items-center space-x-1 font-semibold"
                  >
                    <svg class="w-3.5 h-3.5 text-neutral-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>PDF ({{ tenant.documents.length }})</span>
                  </button>
                  <button 
                    @click="editTenant(tenant)"
                    class="text-neutral-muted hover:text-inmo-primary p-1 rounded hover:bg-slate-100"
                    title="Editar"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    @click="deleteTenant(tenant.id)"
                    class="text-neutral-muted hover:text-red-600 p-1 rounded hover:bg-slate-100"
                    title="Eliminar"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form Modal -->
    <div 
      v-if="showFormModal"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white border border-neutral-border rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-6">
        <div class="flex justify-between items-center border-b border-neutral-border pb-3">
          <h2 class="text-lg font-bold text-inmo-brand">
            {{ isEditing ? 'Editar Inquilino' : $t('tenants.addBtn') }}
          </h2>
          <button @click="showFormModal = false" class="text-neutral-muted hover:text-neutral-dark font-bold">✕</button>
        </div>

        <div v-if="formError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {{ formError }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">{{ $t('tenants.name') }}</label>
            <input 
              v-model="formName"
              type="text" 
              placeholder="Nombre Completo..."
              class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">{{ $t('tenants.email') }}</label>
              <input 
                v-model="formEmail"
                type="email" 
                placeholder="email@example.com"
                class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary"
              />
            </div>
            <div>
              <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">{{ $t('tenants.phone') }}</label>
              <input 
                v-model="formPhone"
                type="text" 
                placeholder="Ej: 62988887777"
                class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">{{ $t('tenants.docType') }}</label>
              <select 
                v-model="formDocType"
                class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary font-medium"
              >
                <option value="CPF">CPF (Física)</option>
                <option value="CNPJ">CNPJ (Jurídica)</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">{{ $t('tenants.docValue') }}</label>
              <input 
                v-model="formDocValue"
                type="text" 
                placeholder="CPF o CNPJ..."
                class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary font-mono"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">{{ $t('tenants.contractStart') }}</label>
              <input 
                v-model="formContractStart"
                type="date" 
                class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary"
              />
            </div>
            <div>
              <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">{{ $t('tenants.contractEnd') }}</label>
              <input 
                v-model="formContractEnd"
                type="date" 
                class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">{{ $t('tenants.property') }}</label>
            <select 
              v-model="formPropertyId"
              class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary font-medium"
            >
              <option value="">{{ $t('tenants.none') }}</option>
              <option 
                v-for="prop in properties" 
                :key="prop.id" 
                :value="prop.id"
              >
                {{ prop.name }} ({{ prop.address }})
              </option>
            </select>
          </div>

          <div class="flex justify-end space-x-3 border-t border-neutral-border pt-4">
            <button 
              type="button"
              @click="showFormModal = false"
              class="px-4 py-2 border border-neutral-border text-neutral-muted rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
            >
              {{ $t('tenants.cancel') }}
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-inmo-primary hover:bg-inmo-brand text-white rounded-lg text-xs font-semibold shadow transition"
            >
              {{ $t('tenants.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Documents Drawer -->
    <div 
      v-if="showDocDrawer"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end"
      @click.self="showDocDrawer = false"
    >
      <div class="bg-white border-l border-neutral-border w-full max-w-md h-full p-6 shadow-xl flex flex-col justify-between animate-slide-in">
        <div>
          <div class="flex justify-between items-center border-b border-neutral-border pb-4 mb-6">
            <div>
              <h2 class="text-base font-bold text-inmo-brand">Garantías y Contrato firmado</h2>
              <span class="text-xs text-neutral-muted block line-clamp-1">{{ selectedTenant?.name }}</span>
            </div>
            <button @click="showDocDrawer = false" class="text-neutral-muted hover:text-neutral-dark font-bold">✕</button>
          </div>

          <!-- Document Upload -->
          <div class="p-4 bg-slate-50 border border-neutral-border rounded-xl space-y-3 mb-6">
            <label class="block text-xs font-bold text-neutral-dark uppercase tracking-wider">Cargar Contrato o Identificación PDF</label>
            <input 
              ref="fileInput"
              type="file" 
              accept="application/pdf"
              class="w-full text-xs text-neutral-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
            />
            <div class="flex justify-between items-center pt-2">
              <span class="text-[10px] text-neutral-muted">PDF solamente, límite 5MB</span>
              <button 
                @click="handleDocUpload"
                :disabled="docUploading"
                class="px-3 py-1.5 bg-goiania-green hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow transition flex items-center space-x-1"
              >
                <span v-if="docUploading" class="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Subir</span>
              </button>
            </div>
            <div v-if="docError" class="text-[10px] text-red-600 font-semibold">{{ docError }}</div>
          </div>

          <!-- Document List -->
          <div class="space-y-3">
            <h3 class="text-xs uppercase font-bold text-neutral-muted tracking-wider">Documentación Registrada</h3>
            <div v-if="selectedTenant?.documents.length === 0" class="text-xs text-neutral-muted py-6 text-center">
              Sin documentos cargados.
            </div>
            <div 
              v-for="doc in selectedTenant?.documents"
              :key="doc.id"
              class="p-3 border border-neutral-border rounded-lg flex items-center justify-between hover:bg-slate-50 transition"
            >
              <div class="flex items-center space-x-3 overflow-hidden">
                <svg class="w-6 h-6 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div class="overflow-hidden">
                  <div class="text-xs font-semibold text-neutral-dark truncate" :title="doc.name">{{ doc.name }}</div>
                  <div class="text-[9px] text-neutral-muted">{{ Math.round((doc.fileSize / 1024) * 10) / 10 }} KB</div>
                </div>
              </div>
              <a 
                :href="getDocDownloadUrl(doc.filePath)"
                target="_blank"
                class="px-2.5 py-1 border border-inmo-primary text-inmo-primary hover:bg-inmo-primary hover:text-white rounded text-[10px] font-bold transition"
              >
                Abrir PDF
              </a>
            </div>
          </div>
        </div>

        <button 
          @click="showDocDrawer = false"
          class="w-full py-2.5 border border-neutral-border text-neutral-muted hover:bg-slate-50 rounded-lg text-xs font-semibold transition mt-6"
        >
          Cerrar Panel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.animate-slide-in {
  animation: slide-in 0.2s ease-out;
}
</style>
