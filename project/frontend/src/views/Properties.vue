<script setup lang="ts">
import { computed } from 'vue';
const token = computed(() => localStorage.getItem('inmovel_token'));
const user = computed(() => JSON.parse(localStorage.getItem('inmovel_user') || '{}'));

import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t: $t, locale: i18nLocale } = useI18n();

import { ref, onMounted } from 'vue';



interface Documento {
  id: string;
  name: string;
  filePath: string;
  fileSize: number;
}

interface Tenant {
  id: string;
  name: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  rentValue: number;
  status: string;
  cep: string;
  tenants: Tenant[];
  documents: Documento[];
}

const properties = ref<Property[]>([]);
const search = ref('');
const statusFilter = ref('');
const isLoading = ref(true);

const backendUrl = import.meta.env.VITE_API_URL || '/api';

// Modal and Form States
const showFormModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const formName = ref('');
const formAddress = ref('');
const formRentValue = ref(0);
const formStatus = ref('DISPONIBLE');
const formCep = ref('');
const formError = ref('');

// Drawer States for Documents
const showDocDrawer = ref(false);
const selectedProperty = ref<Property | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const docError = ref('');
const docUploading = ref(false);

// Format currency helper
function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Fetch properties
async function fetchProperties() {
  isLoading.value = true;
  try {
    const params = new URLSearchParams();
    if (search.value) params.append('search', search.value);
    if (statusFilter.value) params.append('status', statusFilter.value);

    const res = await fetch(`${backendUrl}/properties?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (res.ok) {
      properties.value = await res.json();
    }
  } catch (err) {
    console.error('Error fetching properties:', err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  if (token.value) {
    fetchProperties();
  }
});

// Create or Update
async function handleSubmit() {
  if (!formName.value || !formAddress.value || formRentValue.value <= 0 || !formCep.value) {
    formError.value = 'Todos los campos (incluyendo CEP) son obligatorios y el arriendo debe ser mayor que 0.';
    return;
  }

  formError.value = '';
  const url = isEditing.value ? `${backendUrl}/properties/${editingId.value}` : `${backendUrl}/properties`;
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
        address: formAddress.value,
        rentValue: formRentValue.value,
        status: formStatus.value,
        cep: formCep.value,
      }),
    });

    if (res.ok) {
      showFormModal.value = false;
      resetForm();
      fetchProperties();
    } else {
      const data = await res.json();
      formError.value = data.error || 'Error al guardar la propiedad.';
    }
  } catch (err) {
    formError.value = 'Error al conectar con el servidor.';
  }
}

// Edit Action
function editProperty(prop: Property) {
  isEditing.value = true;
  editingId.value = prop.id;
  formName.value = prop.name;
  formAddress.value = prop.address;
  formRentValue.value = prop.rentValue;
  formStatus.value = prop.status;
  formCep.value = prop.cep || '';
  formError.value = '';
  showFormModal.value = true;
}

// Delete Action
async function deleteProperty(id: string) {
  if (!confirm('¿Está seguro de que desea eliminar este inmueble?')) return;

  try {
    const res = await fetch(`${backendUrl}/properties/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (res.ok) {
      fetchProperties();
    } else {
      alert('No se pudo eliminar el inmueble. Verifique si está alquilado por un inquilino activo.');
    }
  } catch (err) {
    console.error('Error deleting property:', err);
  }
}

// Open Documents Drawer
function openDocsDrawer(prop: Property) {
  selectedProperty.value = prop;
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
    const res = await fetch(`${backendUrl}/properties/${selectedProperty.value?.id}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      // Add document to list
      selectedProperty.value?.documents.push(data);
      // Clean input
      if (fileInput.value) fileInput.value.value = '';
      fetchProperties(); // Refresh properties list count
    } else {
      docError.value = data.error || 'Error al cargar el archivo.';
    }
  } catch (err) {
    docError.value = 'Error al subir el archivo al servidor.';
  } finally {
    docUploading.value = false;
  }
}

// Download/View Helper
function getDocDownloadUrl(filePath: string) {
  return `${backendUrl}/documents/download/${filePath}`;
}

function resetForm() {
  isEditing.value = false;
  editingId.value = null;
  formName.value = '';
  formAddress.value = '';
  formRentValue.value = 0;
  formStatus.value = 'DISPONIBLE';
  formCep.value = '';
  formError.value = '';
}
</script>

<template>
  <div class="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8 relative">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-border pb-6">
      <div>
        <h1 class="text-3xl font-black text-inmo-brand tracking-tight">
          {{ $t('properties.title') }}
        </h1>
        <p class="text-sm text-neutral-muted mt-1">
          {{ $t('properties.subtitle') }}
        </p>
      </div>
      <button 
        @click="resetForm(); showFormModal = true"
        class="mt-4 sm:mt-0 bg-inmo-primary hover:bg-inmo-brand text-white font-bold px-4 py-2.5 rounded-lg text-sm shadow transition duration-150 flex items-center space-x-2"
      >
        <span>+</span>
        <span>{{ $t('properties.addBtn') }}</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white border border-neutral-border p-4 rounded-xl flex flex-col md:flex-row gap-4">
      <div class="flex-grow">
        <input 
          v-model="search"
          @input="fetchProperties"
          type="text" 
          placeholder="Buscar inmueble por nombre o dirección..."
          class="w-full px-4 py-2 bg-slate-50 border border-neutral-border rounded-lg text-sm text-neutral-dark focus:outline-none focus:border-inmo-primary"
        />
      </div>
      <div class="w-full md:w-48">
        <select 
          v-model="statusFilter"
          @change="fetchProperties"
          class="w-full px-4 py-2 bg-slate-50 border border-neutral-border rounded-lg text-sm text-neutral-dark focus:outline-none focus:border-inmo-primary font-medium"
        >
          <option value="">Todos los estados</option>
          <option value="DISPONIBLE">{{ $t('properties.available') }}</option>
          <option value="ALQUILADO">{{ $t('properties.rented') }}</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-20 flex flex-col items-center justify-center space-y-4">
      <div class="w-12 h-12 border-4 border-inmo-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm text-neutral-muted">Buscando inmuebles en Goiânia...</span>
    </div>

    <!-- Grid Layout -->
    <div v-else-if="properties.length === 0" class="py-16 text-center text-neutral-muted border border-dashed border-neutral-border rounded-2xl bg-white">
      Ningún inmueble registrado.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="prop in properties" 
        :key="prop.id"
        class="bg-white border border-neutral-border rounded-2xl p-6 shadow-sm flex flex-col justify-between"
      >
        <div>
          <!-- Status Badge -->
          <div class="flex justify-between items-start">
            <span 
              :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded',
                prop.status === 'DISPONIBLE' 
                  ? 'bg-emerald-100 text-goiania-accent' 
                  : 'bg-blue-100 text-inmo-primary'
              ]"
            >
              {{ prop.status === 'DISPONIBLE' ? $t('properties.available') : $t('properties.rented') }}
            </span>
            <div class="flex space-x-2">
              <button 
                @click="editProperty(prop)"
                class="text-neutral-muted hover:text-inmo-primary p-1 rounded hover:bg-slate-100"
                title="Editar"
              >
                <!-- Edit Icon -->
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                @click="deleteProperty(prop.id)"
                class="text-neutral-muted hover:text-red-600 p-1 rounded hover:bg-slate-100"
                title="Eliminar"
              >
                <!-- Trash Icon -->
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <h3 class="text-lg font-bold text-inmo-brand mt-4 line-clamp-1">{{ prop.name }}</h3>
          <p class="text-xs text-neutral-muted mt-1 min-h-[32px] line-clamp-2">{{ prop.address }}</p>
          <p v-if="prop.cep" class="text-xs font-mono text-neutral-dark mt-1">CEP: {{ prop.cep }}</p>

          <div class="mt-4 border-t border-neutral-border pt-4">
            <span class="text-xs text-neutral-muted block">VALOR ARRIENDO MENSAL</span>
            <span class="text-xl font-extrabold text-inmo-brand">{{ formatBRL(prop.rentValue) }}</span>
          </div>

          <div v-if="prop.tenants && prop.tenants.length > 0" class="mt-3 text-xs">
            <span class="text-neutral-muted">Inquilino activo: </span>
            <span class="font-bold text-neutral-dark">{{ prop.tenants[0].name }}</span>
          </div>
        </div>

        <button 
          @click="openDocsDrawer(prop)"
          class="mt-6 w-full flex items-center justify-center space-x-2 py-2 border border-neutral-border hover:bg-slate-50 rounded-lg text-xs font-semibold text-neutral-dark transition"
        >
          <!-- Document Icon -->
          <svg class="w-4 h-4 text-neutral-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Expediente PDF ({{ prop.documents.length }})</span>
        </button>
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
            {{ isEditing ? 'Editar Inmueble' : $t('properties.addBtn') }}
          </h2>
          <button @click="showFormModal = false" class="text-neutral-muted hover:text-neutral-dark font-bold">✕</button>
        </div>

        <div v-if="formError" class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {{ formError }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">{{ $t('properties.name') }}</label>
            <input 
              v-model="formName"
              type="text" 
              placeholder="Ej: Edifício Marista - Sala 101"
              class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary"
            />
          </div>

          <div>
            <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">{{ $t('properties.address') }}</label>
            <input 
              v-model="formAddress"
              type="text" 
              placeholder="Dirección completa..."
              class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary"
            />
          </div>

          <div>
            <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">CEP</label>
            <input 
              v-model="formCep"
              type="text" 
              placeholder="Ej: 74000-000"
              class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">{{ $t('properties.value') }}</label>
              <input 
                v-model.number="formRentValue"
                type="number" 
                step="0.01"
                class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary font-bold"
              />
            </div>
            <div>
              <label class="block text-xs uppercase font-semibold text-neutral-muted mb-1">{{ $t('properties.status') }}</label>
              <select 
                v-model="formStatus"
                class="w-full px-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:border-inmo-primary font-medium"
              >
                <option value="DISPONIBLE">{{ $t('properties.available') }}</option>
                <option value="ALQUILADO">{{ $t('properties.rented') }}</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end space-x-3 border-t border-neutral-border pt-4">
            <button 
              type="button"
              @click="showFormModal = false"
              class="px-4 py-2 border border-neutral-border text-neutral-muted rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
            >
              {{ $t('properties.cancel') }}
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-inmo-primary hover:bg-inmo-brand text-white rounded-lg text-xs font-semibold shadow transition"
            >
              {{ $t('properties.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Documents Drawer (Slide from right) -->
    <div 
      v-if="showDocDrawer"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end"
      @click.self="showDocDrawer = false"
    >
      <div class="bg-white border-l border-neutral-border w-full max-w-md h-full p-6 shadow-xl flex flex-col justify-between animate-slide-in">
        <div>
          <div class="flex justify-between items-center border-b border-neutral-border pb-4 mb-6">
            <div>
              <h2 class="text-base font-bold text-inmo-brand">Repositorio Documental</h2>
              <span class="text-xs text-neutral-muted block line-clamp-1">{{ selectedProperty?.name }}</span>
            </div>
            <button @click="showDocDrawer = false" class="text-neutral-muted hover:text-neutral-dark font-bold">✕</button>
          </div>

          <!-- Document Upload -->
          <div class="p-4 bg-slate-50 border border-neutral-border rounded-xl space-y-3 mb-6">
            <label class="block text-xs font-bold text-neutral-dark uppercase tracking-wider">Cargar Contrato o Plano PDF</label>
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
            <h3 class="text-xs uppercase font-bold text-neutral-muted tracking-wider">Expediente del Activo</h3>
            <div v-if="selectedProperty?.documents.length === 0" class="text-xs text-neutral-muted py-6 text-center">
              Sin documentos PDF cargados en este inmueble.
            </div>
            <div 
              v-for="doc in selectedProperty?.documents"
              :key="doc.id"
              class="p-3 border border-neutral-border rounded-lg flex items-center justify-between hover:bg-slate-50 transition"
            >
              <div class="flex items-center space-x-3 overflow-hidden">
                <!-- PDF Icon -->
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
