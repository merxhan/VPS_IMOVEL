<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '../utils/useToast';

const token = computed(() => localStorage.getItem('inmovel_token'));
const router = useRouter();
const toast = useToast();

interface Documento {
  id: string;
  name: string;
  filePath: string;
  fileSize: number;
}

interface Tenant {
  id: string;
  name: string;
  contractEnd?: string;
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

// Modal Active Tab
const activeModalTab = ref<'general' | 'contract' | 'docs'>('general');

// Drawer States for Documents
const showDocDrawer = ref(false);
const selectedProperty = ref<Property | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const modalFileInput = ref<HTMLInputElement | null>(null);
const docError = ref('');
const docUploading = ref(false);

// Custom Delete Modals and Alert States
const showDeleteConfirm = ref(false);
const propertyToDelete = ref<Property | null>(null);
const deleteLoading = ref(false);

const showRentalWarning = ref(false);
const warningMessage = ref('');

// Stats
const totalPropertiesCount = computed(() => properties.value.length);
const rentedPropertiesCount = computed(() => properties.value.filter(p => p.status === 'ALQUILADO').length);
const occupancyRate = computed(() => {
  return totalPropertiesCount.value ? Math.round((rentedPropertiesCount.value / totalPropertiesCount.value) * 100) : 0;
});
const totalMonthlyRent = computed(() => {
  return properties.value.reduce((acc, p) => acc + Number(p.rentValue), 0);
});
const nearExpirationsCount = computed(() => {
  return properties.value.filter(p => {
    if (p.status !== 'ALQUILADO' || !p.tenants || p.tenants.length === 0) return false;
    const tenant = p.tenants[0];
    if (!tenant.contractEnd) return false;
    const diffTime = new Date(tenant.contractEnd).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 60;
  }).length;
});

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
    formError.value = 'Todos os campos (incluindo CEP) são obrigatórios e o aluguel deve ser maior que 0.';
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
      const savedProperty = await res.json();
      const isNew = !isEditing.value;
      if (isNew) {
        editingId.value = savedProperty.id;
        isEditing.value = true;
      }
      fetchProperties();
      showFormModal.value = false;
      resetForm();
      if (isNew) {
        toast.success('Imóvel cadastrado com sucesso!');
      } else {
        toast.info('Imóvel atualizado com sucesso!');
      }
    } else {
      const data = await res.json();
      formError.value = data.error || 'Erro ao salvar o imóvel.';
      toast.error(formError.value);
    }
  } catch (err) {
    formError.value = 'Erro ao conectar com o servidor.';
    toast.error(formError.value);
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
  activeModalTab.value = 'general';
  showFormModal.value = true;
}

// Delete Action
function openDeleteConfirm(prop: Property) {
  propertyToDelete.value = prop;
  showDeleteConfirm.value = true;
}

async function handleDelete() {
  if (!propertyToDelete.value) return;
  deleteLoading.value = true;

  try {
    const res = await fetch(`${backendUrl}/properties/${propertyToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (res.ok) {
      toast.error('Imóvel excluído com sucesso!');
      showDeleteConfirm.value = false;
      fetchProperties();
    } else {
      showDeleteConfirm.value = false;
      warningMessage.value = 'Não foi possível excluir o imóvel. Verifique se está alugado por um inquilino ativo.';
      showRentalWarning.value = true;
    }
  } catch (err) {
    console.error('Error deleting property:', err);
    toast.error('Erro de rede ao conectar ao servidor.');
  } finally {
    deleteLoading.value = false;
    propertyToDelete.value = null;
  }
}

// Open Documents Drawer
function openDocsDrawer(prop: Property) {
  selectedProperty.value = prop;
  docError.value = '';
  showDocDrawer.value = true;
}

// Handle PDF Document Upload
async function handleDocUpload(source: 'drawer' | 'modal') {
  const input = source === 'drawer' ? fileInput.value : modalFileInput.value;
  const file = input?.files?.[0];
  const targetId = source === 'drawer' ? selectedProperty.value?.id : editingId.value;

  if (!file) {
    docError.value = 'Por favor, selecione um arquivo.';
    return;
  }

  if (file.type !== 'application/pdf') {
    docError.value = 'Formato inválido. Apenas arquivos PDF são aceitos.';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    docError.value = 'O arquivo excede o limite máximo permitido de 5MB.';
    return;
  }

  docError.value = '';
  docUploading.value = true;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${backendUrl}/properties/${targetId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      if (source === 'drawer' && selectedProperty.value) {
        selectedProperty.value.documents.push(data);
      } else if (source === 'modal') {
        const found = properties.value.find(p => p.id === editingId.value);
        if (found) found.documents.push(data);
      }
      if (input) input.value = '';
      fetchProperties();
      toast.success('Documento carregado com sucesso!');
    } else {
      docError.value = data.error || 'Erro ao carregar o arquivo.';
      toast.error(docError.value);
    }
  } catch (err) {
    docError.value = 'Erro ao enviar o arquivo ao servidor.';
    toast.error(docError.value);
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
  formAddress.value = '';
  formRentValue.value = 0;
  formStatus.value = 'DISPONIBLE';
  formCep.value = '';
  formError.value = '';
  activeModalTab.value = 'general';
}

function triggerFileInput(source: 'drawer' | 'modal') {
  if (source === 'drawer') {
    fileInput.value?.click();
  } else {
    modalFileInput.value?.click();
  }
}
</script>

<template>
  <div class="px-4 py-8 lg:px-8 max-w-[1440px] mx-auto space-y-6 relative animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h2 class="font-headline-lg text-headline-lg text-sici-primary font-bold">
          Gestão de Imóveis
        </h2>
        <p class="text-sici-secondary font-body-md">
          Cadastro técnico e controle do inventário físico
        </p>
      </div>
      <button 
        @click="resetForm(); showFormModal = true"
        class="bg-sici-primary text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
      >
        <span class="material-symbols-outlined">add</span>
        Adicionar Imóvel
      </button>
    </div>

    <!-- Bento Stats / Quick Filters -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- Total Imóveis -->
      <div class="bg-white p-5 border border-sici-border rounded-xl">
        <div class="flex justify-between items-start mb-4">
          <span class="p-2 bg-sici-secondary/10 rounded-lg text-sici-secondary">
            <span class="material-symbols-outlined">apartment</span>
          </span>
          <span class="text-sici-success font-semibold flex items-center text-xs">
            +3.2% <span class="material-symbols-outlined text-xs ml-0.5">trending_up</span>
          </span>
        </div>
        <h4 class="text-sici-secondary text-[12px] font-semibold uppercase tracking-wider">
          Total de Imóveis
        </h4>
        <p class="text-3xl font-bold mt-1 text-sici-primary">{{ totalPropertiesCount }}</p>
      </div>

      <!-- Alugados -->
      <div class="bg-white p-5 border border-sici-border rounded-xl">
        <div class="flex justify-between items-start mb-4">
          <span class="p-2 bg-emerald-50 text-sici-success rounded-lg">
            <span class="material-symbols-outlined">check_circle</span>
          </span>
        </div>
        <h4 class="text-sici-secondary text-[12px] font-semibold uppercase tracking-wider">
          Alugados
        </h4>
        <p class="text-3xl font-bold mt-1 text-sici-primary">{{ rentedPropertiesCount }}</p>
        <div class="w-full bg-slate-100 mt-3 h-1.5 rounded-full overflow-hidden">
          <div class="bg-sici-success h-full transition-all duration-500" :style="{ width: `${occupancyRate}%` }"></div>
        </div>
      </div>

      <!-- Vencimentos (60 dias) -->
      <div class="bg-white p-5 border border-sici-border rounded-xl">
        <div class="flex justify-between items-start mb-4">
          <span class="p-2 bg-sici-warning/10 text-sici-warning rounded-lg">
            <span class="material-symbols-outlined">pending_actions</span>
          </span>
        </div>
        <h4 class="text-sici-secondary text-[12px] font-semibold uppercase tracking-wider">
          Vencimentos (60 dias)
        </h4>
        <p class="text-3xl font-bold mt-1 text-sici-warning">{{ nearExpirationsCount }}</p>
        <p class="text-xs text-sici-secondary mt-2 italic">Requerem atenção imediata</p>
      </div>

      <!-- Aluguel Mensal Total -->
      <div class="bg-white p-5 border border-sici-border rounded-xl">
        <div class="flex justify-between items-start mb-4">
          <span class="p-2 bg-sici-primary/5 text-sici-primary rounded-lg">
            <span class="material-symbols-outlined">payments</span>
          </span>
        </div>
        <h4 class="text-sici-secondary text-[12px] font-semibold uppercase tracking-wider">
          Aluguel Mensal Total
        </h4>
        <p class="text-2xl font-bold mt-1 text-sici-primary truncate" :title="formatBRL(totalMonthlyRent)">
          {{ formatBRL(totalMonthlyRent) }}
        </p>
      </div>
    </div>

    <!-- Data Table Section -->
    <div class="bg-white border border-sici-border rounded-xl overflow-hidden shadow-sm">
      <!-- Filter Bar -->
      <div class="p-4 border-b border-sici-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
        <div class="flex flex-wrap gap-2">
          <button 
            @click="statusFilter = ''; fetchProperties()"
            class="px-4 py-1.5 text-xs font-bold rounded-full transition-all"
            :class="statusFilter === '' ? 'bg-sici-primary text-white' : 'text-sici-secondary hover:bg-slate-200'"
          >
            Todos
          </button>
          <button 
            @click="statusFilter = 'DISPONIBLE'; fetchProperties()"
            class="px-4 py-1.5 text-xs font-bold rounded-full transition-all"
            :class="statusFilter === 'DISPONIBLE' ? 'bg-sici-primary text-white' : 'text-sici-secondary hover:bg-slate-200'"
          >
            Disponíveis
          </button>
          <button 
            @click="statusFilter = 'ALQUILADO'; fetchProperties()"
            class="px-4 py-1.5 text-xs font-bold rounded-full transition-all"
            :class="statusFilter === 'ALQUILADO' ? 'bg-sici-primary text-white' : 'text-sici-secondary hover:bg-slate-200'"
          >
            Alugados
          </button>
        </div>
        <div class="flex gap-3 w-full sm:w-auto">
          <div class="relative flex-grow sm:flex-grow-0">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input 
              v-model="search"
              @input="fetchProperties"
              type="text" 
              placeholder="Buscar imóvel por nome ou endereço..."
              class="w-full sm:w-64 pl-9 pr-4 py-1.5 bg-white border border-sici-border rounded-lg text-xs text-sici-primary focus:outline-none focus:border-sici-primary"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="py-20 flex flex-col items-center justify-center space-y-4">
        <div class="w-12 h-12 border-4 border-sici-accent border-t-transparent rounded-full animate-spin"></div>
        <span class="text-[14px] text-sici-secondary">Buscando imóveis...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="properties.length === 0" class="py-16 text-center text-sici-secondary border-t border-sici-border">
        Nenhum imóvel registrado.
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Nome do Imóvel / Descrição</th>
              <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans">CEP</th>
              <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Estado</th>
              <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Inquilino ativo</th>
              <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans text-right">Valor do Aluguel (BRL)</th>
              <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans text-center">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="prop in properties" 
              :key="prop.id"
              class="hover:bg-slate-50/50 transition-colors"
            >
              <td class="p-4">
                <div class="max-w-[250px]">
                  <div class="font-semibold text-sm text-slate-900 truncate" :title="prop.name">
                    {{ prop.name }}
                  </div>
                  <div class="text-[11px] text-slate-500 truncate" :title="prop.address">
                    {{ prop.address }}
                  </div>
                </div>
              </td>
              <td class="p-4 font-mono text-sm text-slate-500">
                {{ prop.cep || '—' }}
              </td>
              <td class="p-4">
                <span 
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-sans uppercase border',
                    prop.status === 'DISPONIBLE' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  ]"
                >
                  {{ prop.status === 'DISPONIBLE' ? 'DISPONÍVEL' : 'ALUGADO' }}
                </span>
              </td>
              <td class="p-4 text-sm text-slate-500 font-sans">
                {{ prop.tenants && prop.tenants.length > 0 ? prop.tenants[0].name : '—' }}
              </td>
              <td class="p-4 text-right font-mono font-semibold text-slate-900">
                {{ formatBRL(prop.rentValue) }}
              </td>
              <td class="p-4">
                <div class="flex justify-center items-center gap-2">
                  <button 
                    @click="openDocsDrawer(prop)"
                    class="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-200 text-xs flex items-center gap-1 font-semibold transition"
                    title="Documentos PDF"
                  >
                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>PDF ({{ prop.documents.length }})</span>
                  </button>
                  <button 
                    @click="editProperty(prop)"
                    class="text-slate-500 hover:text-slate-900 p-1.5 rounded hover:bg-slate-100 transition"
                    title="Editar"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    @click="openDeleteConfirm(prop)"
                    class="text-slate-500 hover:text-red-600 p-1.5 rounded hover:bg-slate-100 transition"
                    title="Excluir"
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
      
      <!-- Table Footer / Pagination simulation -->
      <div class="p-4 border-t border-sici-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-sici-secondary bg-slate-50">
        <p>Mostrando 1-{{ totalPropertiesCount }} de {{ totalPropertiesCount }} imóveis</p>
        <div class="flex gap-2">
          <button class="p-2 border border-sici-border rounded-lg bg-white opacity-40 cursor-not-allowed" disabled>
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button class="px-3 py-1 bg-sici-primary text-white rounded-lg">1</button>
          <button class="p-2 border border-sici-border rounded-lg bg-white opacity-40 cursor-not-allowed" disabled>
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Double Column Modal: Add/Edit Property -->
    <div 
      v-if="showFormModal"
      class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="showFormModal = false"
    >
      <div class="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300">
        <!-- Modal Header -->
        <div class="p-6 border-b border-sici-border flex justify-between items-center bg-slate-50">
          <div>
            <h3 class="text-[20px] font-semibold leading-[28px] text-sici-primary">
              {{ isEditing ? 'Editar Imóvel' : 'Adicionar Imóvel' }}
            </h3>
            <p class="text-xs text-sici-secondary mt-0.5">
              Preencha a ficha técnica e anexe a documentação legal necessária.
            </p>
          </div>
          <button @click="showFormModal = false" class="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Modal Body (Two columns) -->
        <div class="flex-grow overflow-y-auto p-6">
          <div v-if="formError" class="mb-4 p-3 bg-sici-error/10 border border-sici-error/20 text-sici-error text-[13px] rounded-lg">
            {{ formError }}
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Left Navigation Tabs -->
            <div class="space-y-4">
              <nav class="flex flex-col gap-1">
                <button 
                  type="button"
                  @click="activeModalTab = 'general'"
                  class="w-full text-left px-4 py-3 rounded-lg font-semibold text-xs flex items-center gap-3 transition-colors"
                  :class="activeModalTab === 'general' ? 'bg-sici-primary text-white' : 'text-sici-secondary hover:bg-slate-100'"
                >
                  Dados Gerais
                </button>
                <button 
                  type="button"
                  @click="activeModalTab = 'contract'"
                  class="w-full text-left px-4 py-3 rounded-lg font-semibold text-xs flex items-center gap-3 transition-colors"
                  :class="activeModalTab === 'contract' ? 'bg-sici-primary text-white' : 'text-sici-secondary hover:bg-slate-100'"
                >
                  Contrato e Valor
                </button>
                <button 
                  type="button"
                  @click="activeModalTab = 'docs'"
                  :disabled="!isEditing"
                  class="w-full text-left px-4 py-3 rounded-lg font-semibold text-xs flex items-center gap-3 transition-colors disabled:opacity-40"
                  :class="[
                    activeModalTab === 'docs' ? 'bg-sici-primary text-white' : 'text-sici-secondary hover:bg-slate-100',
                  ]"
                  :title="!isEditing ? 'Salve o imóvel primeiro para enviar arquivos' : ''"
                >
                  Documentação (PDF)
                </button>
              </nav>

              <!-- Progress box -->
              <div class="p-4 bg-slate-50 rounded-xl border border-sici-border">
                <h5 class="text-[10px] font-bold uppercase text-sici-secondary tracking-wider mb-2">Resumo da Ficha</h5>
                <ul class="space-y-2 text-[11px]">
                  <li class="flex items-center gap-2" :class="formName && formAddress && formCep ? 'text-sici-success' : 'text-sici-secondary'">
                    <span>Ficha básica</span>
                  </li>
                  <li class="flex items-center gap-2" :class="formRentValue > 0 ? 'text-sici-success' : 'text-sici-secondary'">
                    <span>Valor do aluguel</span>
                  </li>
                  <li v-if="isEditing" class="flex items-center gap-2 text-sici-success">
                    <span>Imóvel Salvo</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Right Column fields -->
            <form @submit.prevent="handleSubmit" class="md:col-span-2 space-y-6">
              <!-- General Info tab -->
              <div v-if="activeModalTab === 'general'" class="space-y-4">
                <h4 class="font-bold text-sici-primary border-b border-sici-border pb-2 text-sm uppercase tracking-wide">
                  Dados Gerais do Imóvel
                </h4>
                <div class="space-y-4">
                  <div>
                    <label class="block text-[10px] font-bold text-sici-secondary uppercase mb-1">Nome Comercial *</label>
                    <input 
                      v-model="formName"
                      type="text" 
                      placeholder="Ex: Edifício Corporate Plaza"
                      class="w-full px-4 py-2 border border-sici-border rounded-lg text-sm text-sici-primary focus:outline-none focus:border-sici-primary focus:ring-1 focus:ring-sici-primary"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-sici-secondary uppercase mb-1">Endereço Completo *</label>
                    <input 
                      v-model="formAddress"
                      type="text" 
                      placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
                      class="w-full px-4 py-2 border border-sici-border rounded-lg text-sm text-sici-primary focus:outline-none focus:border-sici-primary focus:ring-1 focus:ring-sici-primary"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-sici-secondary uppercase mb-1">CEP (Obrigatorório) *</label>
                    <input 
                      v-model="formCep"
                      type="text" 
                      placeholder="00000-000"
                      class="w-full px-4 py-2 border border-sici-border rounded-lg text-sm text-sici-primary focus:outline-none focus:border-sici-primary focus:ring-1 focus:ring-sici-primary font-mono"
                    />
                  </div>
                </div>
              </div>

              <!-- Contract & Rent tab -->
              <div v-else-if="activeModalTab === 'contract'" class="space-y-4">
                <h4 class="font-bold text-sici-primary border-b border-sici-border pb-2 text-sm uppercase tracking-wide">
                  Dados Financeiros & Contrato
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold text-sici-secondary uppercase mb-1">Valor do Aluguel (R$) *</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold opacity-50">R$</span>
                      <input 
                        v-model.number="formRentValue"
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        class="w-full pl-10 pr-4 py-2 border border-sici-border rounded-lg text-sm text-sici-primary focus:outline-none focus:border-sici-primary focus:ring-1 focus:ring-sici-primary font-mono font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-sici-secondary uppercase mb-1">Estado Operacional</label>
                    <select 
                      v-model="formStatus"
                      class="w-full px-4 py-2 border border-sici-border bg-white rounded-lg text-sm text-sici-primary focus:outline-none focus:border-sici-primary font-medium"
                    >
                      <option value="DISPONIBLE">DISPONÍVEL</option>
                      <option value="ALQUILADO">ALUGADO</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Documents tab (Available only when editing) -->
              <div v-else-if="activeModalTab === 'docs' && isEditing" class="space-y-4">
                <h4 class="font-bold text-sici-primary border-b border-sici-border pb-2 text-sm uppercase tracking-wide">
                  Documentação do Imóvel (PDF)
                </h4>
                
                <!-- Drag and drop simulated file upload zone -->
                <div 
                  @click="triggerFileInput('modal')"
                  class="border-2 border-dashed border-sici-border rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                >
                  <span class="material-symbols-outlined text-4xl text-sici-secondary mb-3 group-hover:scale-110 transition-transform">cloud_upload</span>
                  <p class="text-sm font-semibold text-sici-primary">Clique para enviar ou arraste seus arquivos</p>
                  <p class="text-xs text-sici-secondary mt-1">Apenas formatos PDF (Máx. 5MB por arquivo)</p>
                  <input 
                    ref="modalFileInput" 
                    type="file" 
                    accept="application/pdf" 
                    class="hidden" 
                    @change="handleDocUpload('modal')"
                  />
                </div>

                <div v-if="docError" class="text-xs text-sici-error font-semibold">{{ docError }}</div>
                <div v-if="docUploading" class="text-xs text-sici-accent flex items-center gap-2">
                  <span class="w-3.5 h-3.5 border-2 border-sici-accent border-t-transparent rounded-full animate-spin"></span>
                  Enviando arquivo...
                </div>

                <!-- Attached documents list -->
                <div class="space-y-2">
                  <h5 class="text-[10px] font-bold text-sici-secondary uppercase tracking-wide">Arquivos Anexados</h5>
                  <div v-if="!properties.find(p => p.id === editingId)?.documents.length" class="text-xs text-sici-secondary italic py-2">
                    Nenhum documento anexado ainda.
                  </div>
                  <div 
                    v-for="doc in properties.find(p => p.id === editingId)?.documents" 
                    :key="doc.id"
                    class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-sici-border"
                  >
                    <div class="flex items-center gap-3 overflow-hidden">
                      <span class="material-symbols-outlined text-sici-error shrink-0">picture_as_pdf</span>
                      <span class="text-xs font-medium text-sici-primary truncate" :title="doc.name">{{ doc.name }}</span>
                    </div>
                    <div class="flex items-center gap-4 shrink-0">
                      <span class="text-[10px] text-sici-secondary">{{ Math.round(doc.fileSize / 1024) }} KB</span>
                      <a :href="getDocDownloadUrl(doc.filePath)" target="_blank" class="text-sici-accent text-xs font-bold hover:underline">Ver</a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action buttons inside form -->
              <div class="p-6 border-t border-sici-border bg-slate-50 -mx-6 -mb-6 flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  @click="showFormModal = false"
                  class="px-6 py-2.5 text-xs font-bold text-sici-secondary hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  class="bg-sici-primary text-white px-8 py-2.5 text-xs font-bold rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  {{ isEditing ? 'Salvar Alterações' : 'Salvar Imóvel' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Documents Drawer -->
    <div 
      v-if="showDocDrawer"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end"
      @click.self="showDocDrawer = false"
    >
      <div class="bg-white border-l border-sici-border w-full max-w-md h-full p-6 shadow-xl flex flex-col justify-between animate-slide-in">
        <div>
          <div class="flex justify-between items-center border-b border-sici-border pb-4 mb-6">
            <div>
              <h2 class="text-[16px] font-semibold text-sici-primary">Repositório Documental</h2>
              <span class="text-[12px] text-sici-secondary block line-clamp-1 font-medium">{{ selectedProperty?.name }}</span>
            </div>
            <button @click="showDocDrawer = false" class="text-sici-secondary hover:text-sici-primary font-bold">
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          <!-- Document Upload -->
          <div class="p-4 bg-slate-50 border border-sici-border rounded-xl space-y-3 mb-6">
            <label class="block text-[11px] font-bold text-sici-primary uppercase tracking-[0.05em]">Carregar Contrato ou Planta PDF</label>
            <input 
              ref="fileInput"
              type="file" 
              accept="application/pdf"
              class="w-full text-xs text-sici-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 transition-colors"
            />
            <div class="flex justify-between items-center pt-2">
              <span class="text-[10px] text-sici-secondary">Somente PDF, limite 5MB</span>
              <button 
                @click="handleDocUpload('drawer')"
                :disabled="docUploading"
                class="px-3 py-1.5 bg-sici-success hover:opacity-90 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1"
              >
                <span v-if="docUploading" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Enviar</span>
              </button>
            </div>
            <div v-if="docError" class="text-[11px] text-sici-error font-semibold mt-1">{{ docError }}</div>
          </div>

          <!-- Document List -->
          <div class="space-y-3">
            <h3 class="text-[11px] uppercase font-bold text-sici-secondary tracking-wider">Expediente do Ativo</h3>
            <div v-if="selectedProperty?.documents.length === 0" class="text-[13px] text-sici-secondary py-6 text-center italic">
              Sem documentos PDF carregados neste imóvel.
            </div>
            <div 
              v-for="doc in selectedProperty?.documents"
              :key="doc.id"
              class="p-3 border border-sici-border rounded-xl flex items-center justify-between hover:bg-slate-50 transition"
            >
              <div class="flex items-center gap-3 overflow-hidden">
                <span class="material-symbols-outlined text-sici-error shrink-0">picture_as_pdf</span>
                <div class="overflow-hidden">
                  <div class="text-xs font-bold text-sici-primary truncate" :title="doc.name">{{ doc.name }}</div>
                  <div class="text-[10px] text-sici-secondary font-mono">{{ Math.round((doc.fileSize / 1024) * 10) / 10 }} KB</div>
                </div>
              </div>
              <a 
                :href="getDocDownloadUrl(doc.filePath)"
                target="_blank"
                class="px-2.5 py-1 border border-sici-accent text-sici-accent hover:bg-sici-accent hover:text-white rounded-lg text-[10px] font-semibold transition shrink-0"
              >
                Abrir PDF
              </a>
            </div>
          </div>
        </div>

        <button 
          @click="showDocDrawer = false"
          class="w-full py-2.5 bg-white border border-sici-border text-sici-secondary hover:bg-slate-50 rounded-lg text-xs font-bold transition mt-6"
        >
          Fechar Painel
        </button>
      </div>
    </div>

    <!-- Custom Delete Confirmation Modal -->
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
        <p class="text-xs text-slate-500 font-sans mb-6 font-medium">{{ propertyToDelete?.name }}</p>

        <div class="flex gap-3 w-full">
          <button
            @click="showDeleteConfirm = false; propertyToDelete = null"
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

    <!-- Custom Rental Warning Alert Modal -->
    <div 
      v-if="showRentalWarning"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div class="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 z-10 text-center animate-in fade-in zoom-in duration-200 flex flex-col items-center">
        <div class="w-12 h-12 mb-4 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-500">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h4 class="text-sm font-bold text-slate-950 font-sans mb-2">Não é possível excluir</h4>
        <p class="text-xs text-slate-500 font-sans mb-6 leading-relaxed">{{ warningMessage }}</p>

        <button
          @click="showRentalWarning = false; warningMessage = ''"
          class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded text-sm shadow transition font-sans"
        >
          Entendido
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
.animate-fade-in {
  animation: fadeIn 0.35s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
