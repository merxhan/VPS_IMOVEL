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


const showFormModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const formName = ref('');
const formAddress = ref('');
const formRentValue = ref(0);
const formStatus = ref('DISPONIBLE');
const formCep = ref('');
const formError = ref('');


const activeModalTab = ref<'general' | 'contract' | 'docs'>('general');


const modalFileInput = ref<HTMLInputElement | null>(null);
const docError = ref('');
const docUploading = ref(false);
const editingProperty = computed(() => properties.value.find(p => p.id === editingId.value));


const showDeleteConfirm = ref(false);
const propertyToDelete = ref<Property | null>(null);
const deleteLoading = ref(false);

const showRentalWarning = ref(false);
const warningMessage = ref('');


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


function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}


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


async function handleDocUpload() {
  const file = modalFileInput.value?.files?.[0];
  const targetId = editingId.value;

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
      const found = properties.value.find(p => p.id === editingId.value);
      if (found) found.documents.push(data);
      if (modalFileInput.value) modalFileInput.value.value = '';
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

function triggerFileInput() {
  modalFileInput.value?.click();
}
</script>

<template>
  <div class="p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-8 relative">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900 font-sans">
          Gestão de Imóveis
        </h1>
        <p class="text-sm text-slate-500 mt-1 font-sans">
          Cadastro técnico e controle do inventário físico.
        </p>
      </div>
      <button 
        @click="resetForm(); showFormModal = true"
        class="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition font-sans shadow-sm flex items-center gap-2"
      >
        <span>+ ADICIONAR IMÓVEL</span>
      </button>
    </div>

    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <div class="bg-white p-6 border border-slate-200 rounded-[8px] shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">TOTAL DE IMÓVEIS</span>
          <h3 class="text-3xl font-bold text-slate-900 mt-2 font-sans">{{ totalPropertiesCount }}</h3>
        </div>
        <p class="text-slate-500 text-xs mt-4 font-medium font-sans">Imóveis cadastrados</p>
      </div>

      
      <div class="bg-white p-6 border border-slate-200 rounded-[8px] shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">IMÓVEIS ALUGADOS</span>
          <h3 class="text-3xl font-bold text-slate-900 mt-2 font-sans">{{ rentedPropertiesCount }}</h3>
        </div>
        <div>
          <div class="w-full bg-slate-100 mt-3 h-1.5 rounded-full overflow-hidden">
            <div class="bg-emerald-600 h-full transition-all duration-500" :style="{ width: `${occupancyRate}%` }"></div>
          </div>
          <p class="text-slate-500 text-xs mt-2 font-medium font-sans">
            Taxa de ocupação de {{ occupancyRate }}%
          </p>
        </div>
      </div>

      
      <div class="bg-white p-6 border border-slate-200 rounded-[8px] shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">PRÓXIMOS VENCIMENTOS</span>
          <h3 class="text-3xl font-bold mt-2 font-sans" :class="nearExpirationsCount > 0 ? 'text-amber-600' : 'text-slate-900'">{{ nearExpirationsCount }}</h3>
        </div>
        <p class="text-slate-500 text-xs mt-4 font-medium font-sans">Contratos vencendo nos próximos 60 dias</p>
      </div>

      
      <div class="bg-white p-6 border border-slate-200 rounded-[8px] shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">FATURAMENTO MENSAL</span>
          <h3 class="text-2xl font-bold text-slate-900 mt-2 font-sans truncate" :title="formatBRL(totalMonthlyRent)">
            {{ formatBRL(totalMonthlyRent) }}
          </h3>
        </div>
        <p class="text-slate-500 text-xs mt-4 font-medium font-sans">Renda total projetada</p>
      </div>
    </div>

    
    <div class="bg-white border border-slate-200 rounded-[8px] shadow-sm overflow-hidden">
      
      <div class="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
        <div class="flex gap-2">
          <button 
            @click="statusFilter = ''; fetchProperties()"
            class="px-4 py-1.5 text-xs font-bold rounded-full transition-all"
            :class="statusFilter === '' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200'"
          >
            Todos
          </button>
          <button 
            @click="statusFilter = 'DISPONIBLE'; fetchProperties()"
            class="px-4 py-1.5 text-xs font-bold rounded-full transition-all"
            :class="statusFilter === 'DISPONIBLE' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200'"
          >
            Disponíveis
          </button>
          <button 
            @click="statusFilter = 'ALQUILADO'; fetchProperties()"
            class="px-4 py-1.5 text-xs font-bold rounded-full transition-all"
            :class="statusFilter === 'ALQUILADO' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200'"
          >
            Alugados
          </button>
        </div>
        <div class="flex gap-3 w-full md:w-auto">
          <div class="relative flex-grow md:flex-grow-0">
            <input 
              v-model="search"
              @input="fetchProperties"
              type="text" 
              placeholder="Buscar imóvel por nome ou endereço..."
              class="w-full md:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-900 transition font-sans"
            />
            <div class="absolute left-3 top-2.5 text-slate-400">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      
      <div v-if="isLoading" class="py-20 flex flex-col items-center justify-center space-y-4">
        <div class="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm font-semibold text-slate-500 font-sans">Buscando imóveis...</span>
      </div>

      
      <div v-else-if="properties.length === 0" class="py-16 text-center text-slate-500 border-t border-slate-200 font-sans italic">
        Nenhum imóvel registrado.
      </div>

      
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
      
      
      <div class="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
        <p class="text-xs font-semibold text-slate-500 font-sans">
          Mostrando 1-{{ totalPropertiesCount }} de {{ totalPropertiesCount }} imóveis
        </p>
        <div class="flex gap-2">
          <button 
            disabled 
            class="p-1.5 border border-slate-200 rounded bg-white text-slate-400 cursor-not-allowed text-xs transition"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            disabled 
            class="p-1.5 border border-slate-200 rounded bg-white text-slate-400 cursor-not-allowed text-xs transition"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    
    <div 
      v-if="showFormModal"
      class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="showFormModal = false"
    >
      <div class="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300">
        
        <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 class="text-[20px] font-bold leading-[28px] text-slate-900 font-sans">
              {{ isEditing ? 'Editar Imóvel' : 'Adicionar Imóvel' }}
            </h3>
            <p class="text-xs text-slate-500 mt-1 font-sans">
              Preencha a ficha técnica e anexe a documentação legal necessária.
            </p>
          </div>
          <button @click="showFormModal = false" class="text-slate-400 hover:text-red-500 font-bold p-1 rounded hover:bg-slate-100 transition">✕</button>
        </div>

        
        <div class="flex-grow overflow-y-auto p-6">
          <div v-if="formError" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="font-sans font-medium">{{ formError }}</span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div class="space-y-4">
              <nav class="flex flex-col gap-1">
                <button 
                  type="button"
                  @click="activeModalTab = 'general'"
                  class="w-full text-left px-4 py-3 rounded-lg font-semibold text-xs flex items-center gap-3 transition-colors font-sans"
                  :class="activeModalTab === 'general' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'"
                >
                  Dados Gerais
                </button>
                <button 
                  type="button"
                  @click="activeModalTab = 'contract'"
                  class="w-full text-left px-4 py-3 rounded-lg font-semibold text-xs flex items-center gap-3 transition-colors font-sans"
                  :class="activeModalTab === 'contract' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'"
                >
                  Contrato e Valor
                </button>
                <button 
                  type="button"
                  @click="activeModalTab = 'docs'"
                  :disabled="!isEditing"
                  class="w-full text-left px-4 py-3 rounded-lg font-semibold text-xs flex items-center gap-3 transition-colors disabled:opacity-40 font-sans"
                  :class="[
                    activeModalTab === 'docs' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100',
                  ]"
                  :title="!isEditing ? 'Salve o imóvel primeiro para enviar arquivos' : ''"
                >
                  Documentação (PDF)
                </button>
              </nav>

              
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h5 class="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2 font-sans">Resumo da Ficha</h5>
                <ul class="space-y-2 text-[11px] font-sans">
                  <li class="flex items-center gap-2 font-semibold" :class="formName && formAddress && formCep ? 'text-emerald-600' : 'text-slate-400'">
                    <span>Ficha básica</span>
                  </li>
                  <li class="flex items-center gap-2 font-semibold" :class="formRentValue > 0 ? 'text-emerald-600' : 'text-slate-400'">
                    <span>Valor do aluguel</span>
                  </li>
                  <li v-if="isEditing" class="flex items-center gap-2 text-emerald-600 font-semibold">
                    <span>Imóvel Salvo</span>
                  </li>
                </ul>
              </div>
            </div>

            
            <form @submit.prevent="handleSubmit" class="md:col-span-2 space-y-6">
              
              <div v-if="activeModalTab === 'general'" class="space-y-4">
                <h4 class="font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm uppercase tracking-wide font-sans">
                  Dados Gerais do Imóvel
                </h4>
                <div class="space-y-4">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Nome Comercial *</label>
                    <input 
                      v-model="formName"
                      type="text" 
                      placeholder="Ex: Edifício Corporate Plaza"
                      class="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-0 text-sm text-slate-900 transition font-sans"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Endereço Completo *</label>
                    <input 
                      v-model="formAddress"
                      type="text" 
                      placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
                      class="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-0 text-sm text-slate-900 transition font-sans"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">CEP (Obrigatorório) *</label>
                    <input 
                      v-model="formCep"
                      type="text" 
                      placeholder="00000-000"
                      class="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-0 text-sm text-slate-900 transition font-mono"
                    />
                  </div>
                </div>
              </div>

              
              <div v-else-if="activeModalTab === 'contract'" class="space-y-4">
                <h4 class="font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm uppercase tracking-wide font-sans">
                  Dados Financeiros & Contrato
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Valor do Aluguel (R$) *</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold opacity-50 font-sans">R$</span>
                      <input 
                        v-model.number="formRentValue"
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        class="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-0 text-sm text-slate-900 transition font-mono font-semibold"
                      />
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Estado Operacional</label>
                    <select 
                      v-model="formStatus"
                      class="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-0 text-sm text-slate-900 font-semibold transition font-sans appearance-none"
                    >
                      <option value="DISPONIBLE">DISPONÍVEL</option>
                      <option value="ALQUILADO">ALUGADO</option>
                    </select>
                  </div>
                </div>
              </div>

              
              <div v-else-if="activeModalTab === 'docs' && isEditing" class="space-y-4">
                <h4 class="font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm uppercase tracking-wide font-sans">
                  Documentação do Imóvel (PDF)
                </h4>
                
                
                <div 
                  @click="triggerFileInput()"
                  class="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                >
                  <svg class="w-10 h-10 text-slate-400 mx-auto mb-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p class="text-sm font-semibold text-slate-900 font-sans">Clique para enviar ou arraste seus arquivos</p>
                  <p class="text-xs text-slate-400 mt-1 font-sans">Apenas formatos PDF (Máx. 5MB por arquivo)</p>
                  <input 
                    ref="modalFileInput" 
                    type="file" 
                    accept="application/pdf" 
                    class="hidden" 
                    @change="handleDocUpload()"
                  />
                </div>

                <div v-if="docError" class="text-xs text-red-600 font-semibold font-sans mt-1">{{ docError }}</div>
                <div v-if="docUploading" class="text-xs text-blue-600 flex items-center gap-2 font-sans mt-1">
                  <span class="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                  <span>Enviando arquivo...</span>
                </div>

                
                <div class="space-y-2">
                  <h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Arquivos Anexados</h5>
                  <div v-if="!editingProperty?.documents.length" class="text-xs text-slate-500 italic py-2 font-sans">
                    Nenhum documento anexado ainda.
                  </div>
                  <div 
                    v-for="doc in editingProperty?.documents" 
                    :key="doc.id"
                    class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100/50 transition-colors"
                  >
                    <div class="flex items-center gap-3 overflow-hidden">
                      <svg class="w-6 h-6 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span class="text-xs font-semibold text-slate-900 truncate font-sans" :title="doc.name">{{ doc.name }}</span>
                    </div>
                    <div class="flex items-center gap-4 shrink-0">
                      <span class="text-[10px] text-slate-500 font-mono">{{ Math.round(doc.fileSize / 1024) }} KB</span>
                      <a :href="getDocDownloadUrl(doc.filePath)" target="_blank" class="px-2.5 py-1.5 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded text-xs font-semibold transition font-sans">Ver</a>
                    </div>
                  </div>
                </div>
              </div>

              
              <div class="flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button 
                  type="button" 
                  @click="showFormModal = false"
                  class="px-5 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded text-sm font-semibold transition font-sans"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  class="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-sm font-semibold transition font-sans shadow-sm"
                >
                  {{ isEditing ? 'Salvar Alterações' : 'Salvar Imóvel' }}
                </button>
              </div>
            </form>
          </div>
        </div>
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
