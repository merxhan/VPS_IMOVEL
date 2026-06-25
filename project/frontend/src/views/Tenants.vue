<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { isValidCPF, isValidCNPJ } from '../utils/validators';
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
  properties: Property[];
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
const formPropertyIds = ref<string[]>([]);
const formError = ref('');
const docFieldError = ref('');
const phoneFieldError = ref('');

// Modal Active Tab and Files
const activeModalTab = ref<'general' | 'contract' | 'docs'>('general');
const modalFileInput = ref<HTMLInputElement | null>(null);
const docError = ref('');
const docUploading = ref(false);
const editingTenant = computed(() => tenants.value.find(t => t.id === editingId.value));

// Custom Delete Modals and Alert States
const showDeleteConfirm = ref(false);
const tenantToDelete = ref<Tenant | null>(null);
const deleteLoading = ref(false);

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

// Check if contract is expiring within 60 days
function getDaysRemaining(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const end = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function isExpiringSoon(dateStr: string | null): boolean {
  const days = getDaysRemaining(dateStr);
  return days !== null && days >= 0 && days <= 60;
}

// Get tenant initials for avatar
function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Validation on Input
function validateFiscalOnInput() {
  if (!formDocValue.value) {
    docFieldError.value = '';
    return;
  }
  const clean = formDocValue.value.replace(/\D/g, '');
  if (clean.length > 0 && clean.length !== 11 && clean.length !== 14) {
    docFieldError.value = 'O número de ' + formDocType.value + ' inserido não é válido.';
  } else {
    const isValid = formDocType.value === 'CPF' ? isValidCPF(clean) : isValidCNPJ(clean);
    docFieldError.value = isValid ? '' : 'O número de ' + formDocType.value + ' inserido não é válido.';
  }
}

// Handle format and validation on writing document
function handleDocInput(e: Event) {
  const target = e.target as HTMLInputElement;
  let val = target.value.replace(/\D/g, '');
  if (val.length > 14) {
    val = val.substring(0, 14);
  }
  
  if (val.length <= 11) {
    formDocValue.value = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    formDocValue.value = val.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  validateFiscalOnInput();
}

// Format phone helper for Brazilian numbers
function formatPhoneValue(value: string): string {
  let val = value.replace(/\D/g, '');
  if (val.length > 11) {
    val = val.substring(0, 11);
  }
  if (val.length === 0) {
    return '';
  } else if (val.length <= 2) {
    return `(${val}`;
  } else if (val.length <= 6) {
    return `(${val.substring(0, 2)}) ${val.substring(2)}`;
  } else if (val.length <= 10) {
    return `(${val.substring(0, 2)}) ${val.substring(2, 6)}-${val.substring(6)}`;
  } else {
    return `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
  }
}

// Validation on Input for Phone
function validatePhoneOnInput() {
  if (!formPhone.value) {
    phoneFieldError.value = '';
    return;
  }
  const clean = formPhone.value.replace(/\D/g, '');
  if (clean.length > 0 && clean.length !== 10 && clean.length !== 11) {
    phoneFieldError.value = 'O telefone deve ter 10 ou 11 dígitos.';
  } else {
    phoneFieldError.value = '';
  }
}

// Handle format and validation on writing phone
function handlePhoneInput(e: Event) {
  const target = e.target as HTMLInputElement;
  formPhone.value = formatPhoneValue(target.value);
  validatePhoneOnInput();
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
    formError.value = 'Por favor, preencha todos os campos obrigatórios.';
    return;
  }

  // Validate Phone client-side
  const cleanPhone = formPhone.value.replace(/\D/g, '');
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
    phoneFieldError.value = 'O telefone deve ter 10 ou 11 dígitos.';
    formError.value = 'O telefone de contato inserido não é válido.';
    return;
  }

  // Validate CPF/CNPJ client-side
  const cleanDoc = formDocValue.value.replace(/\D/g, '');
  const isValid = formDocType.value === 'CPF' ? isValidCPF(cleanDoc) : isValidCNPJ(cleanDoc);
  if (!isValid) {
    formError.value = 'O número de ' + formDocType.value + ' inserido não é válido.';
    return;
  }

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
        propertyIds: formPropertyIds.value,
      }),
    });

    if (res.ok) {
      const isNew = !isEditing.value;
      showFormModal.value = false;
      resetForm();
      fetchTenants();
      fetchProperties();
      if (isNew) {
        toast.success('Inquilino cadastrado com sucesso!');
      } else {
        toast.info('Inquilino atualizado com sucesso!');
      }
    } else {
      const data = await res.json();
      formError.value = data.error || 'Erro ao salvar o inquilino.';
      toast.error(formError.value);
    }
  } catch (err) {
    formError.value = 'Erro de rede ao conectar ao servidor.';
    toast.error(formError.value);
  }
}

// Edit Action
function editTenant(tenant: Tenant) {
  isEditing.value = true;
  editingId.value = tenant.id;
  formName.value = tenant.name;
  formEmail.value = tenant.email;
  formPhone.value = formatPhoneValue(tenant.phone);
  formDocType.value = tenant.documentType;
  formDocValue.value = tenant.documentValue;
  formContractStart.value = tenant.contractStart ? tenant.contractStart.split('T')[0] : '';
  formContractEnd.value = tenant.contractEnd ? tenant.contractEnd.split('T')[0] : '';
  formPropertyIds.value = tenant.properties ? tenant.properties.map(p => p.id) : [];
  formError.value = '';
  docFieldError.value = '';
  phoneFieldError.value = '';
  showFormModal.value = true;
}

// Delete Action
function openDeleteConfirm(tenant: Tenant) {
  tenantToDelete.value = tenant;
  showDeleteConfirm.value = true;
}

async function handleDelete() {
  if (!tenantToDelete.value) return;
  deleteLoading.value = true;

  try {
    const res = await fetch(`${backendUrl}/tenants/${tenantToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (res.ok) {
      toast.error('Inquilino excluído com sucesso!');
      showDeleteConfirm.value = false;
      fetchTenants();
      fetchProperties();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Erro ao excluir o inquilino.');
    }
  } catch (err) {
    console.error('Error deleting tenant:', err);
    toast.error('Erro de rede ao conectar ao servidor.');
  } finally {
    deleteLoading.value = false;
    tenantToDelete.value = null;
  }
}

// Handle PDF Document Upload
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
    const res = await fetch(`${backendUrl}/tenants/${targetId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      const found = tenants.value.find(t => t.id === editingId.value);
      if (found) found.documents.push(data);
      if (modalFileInput.value) modalFileInput.value.value = '';
      fetchTenants();
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

function triggerFileInput() {
  modalFileInput.value?.click();
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
  formPropertyIds.value = [];
  formError.value = '';
  docFieldError.value = '';
  phoneFieldError.value = '';
  activeModalTab.value = 'general';
}

// Computed Bento Metrics
const totalTenants = computed(() => tenants.value.length);
const activeContracts = computed(() => tenants.value.filter(t => t.properties && t.properties.length > 0).length);
const upcomingExpirations = computed(() => tenants.value.filter(t => t.contractEnd && isExpiringSoon(t.contractEnd)).length);
const fiscalAlerts = computed(() => {
  return tenants.value.filter(t => {
    const clean = t.documentValue.replace(/\D/g, '');
    return t.documentType === 'CPF' ? !isValidCPF(clean) : !isValidCNPJ(clean);
  }).length;
});
</script>

<template>
  <div class="p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-8 relative">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900 font-sans">
          Registro de Inquilinos
        </h1>
        <p class="text-sm text-slate-500 mt-1 font-sans">
          Gestão de arrendatários e segurança contratual
        </p>
      </div>
      <button 
        @click="resetForm(); showFormModal = true"
        class="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-sm font-sans"
      >
        <!-- Material Symbol Outlined: person_add -->
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <span>Adicionar Inquilino</span>
      </button>
    </div>

    <!-- Bento Grid Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Total Tenants -->
      <div class="bg-white p-6 border border-slate-200 rounded-[8px] shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">TOTAL DE INQUILINOS</span>
          <h3 class="text-3xl font-bold text-slate-900 mt-2 font-sans">{{ totalTenants }}</h3>
        </div>
        <p class="text-emerald-600 text-xs mt-4 flex items-center gap-1 font-bold font-sans">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>+3% vs mês anterior</span>
        </p>
      </div>

      <!-- Card 2: Active Contracts -->
      <div class="bg-white p-6 border border-slate-200 rounded-[8px] shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">CONTRATOS ATIVOS</span>
          <h3 class="text-3xl font-bold text-slate-900 mt-2 font-sans">{{ activeContracts }}</h3>
        </div>
        <p class="text-slate-500 text-xs mt-4 font-medium font-sans">
          Ocupação de {{ totalTenants > 0 ? ((activeContracts / totalTenants) * 100).toFixed(1) : '0' }}%
        </p>
      </div>

      <!-- Card 3: Upcoming Expirations -->
      <div class="bg-white p-6 border border-slate-200 rounded-[8px] shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">PRÓXIMOS VENCIMENTOS</span>
          <h3 class="text-3xl font-bold text-amber-600 mt-2 font-sans">{{ upcomingExpirations }}</h3>
        </div>
        <p class="text-slate-500 text-xs mt-4 font-medium font-sans">Próximos 60 dias</p>
      </div>

      <!-- Card 4: Fiscal Alerts -->
      <div class="bg-white p-6 border border-slate-200 rounded-[8px] shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div>
          <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-sans">ALERTA FISCAL</span>
          <h3 class="text-3xl font-bold text-red-600 mt-2 font-sans">{{ fiscalAlerts }}</h3>
        </div>
        <p class="text-slate-500 text-xs mt-4 font-medium font-sans">Documentos pendentes ou inválidos</p>
      </div>
    </div>

    <!-- Filters and Table Controls -->
    <div class="bg-white border border-slate-200 p-4 rounded-[8px] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="relative w-full max-w-md">
        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          v-model="search"
          @input="fetchTenants"
          type="text" 
          placeholder="Buscar inquilino por nome, e-mail ou CPF/CNPJ..."
          class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-[6px] text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
        />
      </div>
      <div class="flex items-center gap-2 self-end md:self-auto">
        <span class="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded font-sans uppercase">
          Todos: {{ totalTenants }}
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-20 flex flex-col items-center justify-center space-y-4">
      <div class="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm text-slate-500 font-sans">Buscando inquilinos...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="tenants.length === 0" class="py-16 text-center text-slate-500 border border-dashed border-slate-200 rounded-[8px] bg-white font-sans">
      Nenhum inquilino registrado.
    </div>

    <!-- Tenants Data Table -->
    <div v-else class="overflow-x-auto bg-white border border-slate-200 rounded-[8px] shadow-sm">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Nome Completo</th>
            <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans">E-mail</th>
            <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Telefone</th>
            <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Número do Documento (CPF/CNPJ)</th>
            <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Imóvel Vinculado</th>
            <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans">Vencimento</th>
            <th class="p-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider font-sans text-center">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr 
            v-for="tenant in tenants" 
            :key="tenant.id"
            class="hover:bg-slate-50/50 transition-colors"
          >
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 font-sans border border-slate-200">
                  {{ getInitials(tenant.name) }}
                </div>
                <span class="font-semibold text-slate-900 text-sm font-sans block max-w-[200px] truncate" :title="tenant.name">
                  {{ tenant.name }}
                </span>
              </div>
            </td>
            <td class="p-4 text-sm text-slate-500 font-sans max-w-[180px] truncate" :title="tenant.email">
              {{ tenant.email }}
            </td>
            <td class="p-4 text-sm text-slate-500 font-mono">
              {{ tenant.phone }}
            </td>
            <td class="p-4">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-400">{{ tenant.documentType }}</span>
                <span 
                  v-if="tenant.documentType === 'CPF' ? isValidCPF(tenant.documentValue.replace(/\D/g, '')) : isValidCNPJ(tenant.documentValue.replace(/\D/g, ''))"
                  class="font-mono text-slate-900 text-sm font-medium"
                >
                  {{ tenant.documentValue }}
                </span>
                <span v-else class="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 self-start mt-0.5">
                  Documento Inválido
                </span>
              </div>
            </td>
            <td class="p-4">
              <div v-if="tenant.properties && tenant.properties.length > 0" class="max-w-[200px] space-y-1.5">
                <div v-for="prop in tenant.properties" :key="prop.id" class="border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                  <div class="font-semibold text-xs text-slate-900 truncate" :title="prop.name">
                    {{ prop.name }}
                  </div>
                  <div class="text-[10px] text-slate-500 truncate" :title="prop.address">
                    {{ prop.address }}
                  </div>
                </div>
              </div>
              <span v-else class="text-slate-400 text-xs italic font-sans">Sem vinculação</span>
            </td>
            <td class="p-4">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-slate-900 font-sans">
                  {{ formatDate(tenant.contractEnd) }}
                </span>
                <span 
                  v-if="isExpiringSoon(tenant.contractEnd)"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 font-sans"
                >
                  Vence em {{ getDaysRemaining(tenant.contractEnd) }} dias
                </span>
              </div>
            </td>
            <td class="p-4">
              <div class="flex justify-center items-center gap-2">
                <button 
                  @click="editTenant(tenant)"
                  class="text-slate-500 hover:text-slate-900 p-1.5 rounded hover:bg-slate-100 transition"
                  title="Editar"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button 
                  @click="openDeleteConfirm(tenant)"
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

      <!-- Table Pagination Footer -->
      <div class="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
        <p class="text-xs font-semibold text-slate-500 font-sans">
          Mostrando 1-{{ tenants.length }} de {{ totalTenants }} inquilinos
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

    <!-- Double Column Modal: Add/Edit Tenant -->
    <div 
      v-if="showFormModal"
      class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="showFormModal = false"
    >
      <div class="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300">
        <!-- Modal Header -->
        <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 class="text-[20px] font-bold leading-[28px] text-slate-900 font-sans">
              {{ isEditing ? 'Editar Inquilino' : 'Adicionar Inquilino' }}
            </h3>
            <p class="text-xs text-slate-500 mt-1 font-sans">
              Preencha o formulário e anexe a documentação contratual necessária.
            </p>
          </div>
          <button @click="showFormModal = false" class="text-slate-400 hover:text-red-500 font-bold p-1 rounded hover:bg-slate-100 transition">✕</button>
        </div>

        <!-- Modal Body (Two columns) -->
        <div class="flex-grow overflow-y-auto p-6">
          <div v-if="formError" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="font-sans font-medium">{{ formError }}</span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Left Navigation Tabs -->
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
                  Contrato e Imóvel
                </button>
                <button 
                  type="button"
                  @click="activeModalTab = 'docs'"
                  :disabled="!isEditing"
                  class="w-full text-left px-4 py-3 rounded-lg font-semibold text-xs flex items-center gap-3 transition-colors disabled:opacity-40 font-sans"
                  :class="[
                    activeModalTab === 'docs' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100',
                  ]"
                  :title="!isEditing ? 'Salve o inquilino primeiro para enviar arquivos' : ''"
                >
                  Garantias e Contrato (PDF)
                </button>
              </nav>

              <!-- Progress box -->
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h5 class="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2 font-sans">Resumo da Ficha</h5>
                <ul class="space-y-2 text-[11px] font-sans">
                  <li class="flex items-center gap-2 font-semibold" :class="formName && formEmail && formPhone && formDocValue && !docFieldError && !phoneFieldError ? 'text-emerald-600' : 'text-slate-400'">
                    <span>Ficha básica</span>
                  </li>
                  <li class="flex items-center gap-2 font-semibold" :class="formPropertyIds.length > 0 ? 'text-emerald-600' : 'text-slate-400'">
                    <span>Imóvel vinculado</span>
                  </li>
                  <li v-if="isEditing" class="flex items-center gap-2 text-emerald-600 font-semibold">
                    <span>Inquilino Salvo</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Right Column fields -->
            <form @submit.prevent="handleSubmit" class="md:col-span-2 space-y-6">
              <!-- General Info tab -->
              <div v-if="activeModalTab === 'general'" class="space-y-4">
                <h4 class="font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm uppercase tracking-wide font-sans">
                  Dados Gerais do Inquilino
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Name Field -->
                  <div class="sm:col-span-2 space-y-1.5">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Nome Completo / Razão Social *</label>
                    <input 
                      v-model="formName"
                      type="text" 
                      required
                      class="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-0 text-sm text-slate-900 transition font-sans"
                    />
                  </div>

                  <!-- Email Field -->
                  <div class="sm:col-span-2 space-y-1.5">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">E-mail Principal *</label>
                    <input 
                      v-model="formEmail"
                      type="email" 
                      required
                      placeholder="email@example.com"
                      class="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-0 text-sm text-slate-900 transition font-sans"
                    />
                  </div>

                  <!-- Phone Field -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Telefone de Contato *</label>
                    <input 
                      :value="formPhone"
                      @input="handlePhoneInput"
                      type="text" 
                      required
                      placeholder="(00) 00000-0000"
                      :class="[
                        'w-full p-3 bg-slate-50 rounded-lg border focus:bg-white focus:ring-0 text-sm transition font-mono',
                        phoneFieldError 
                          ? 'border-red-500 text-red-600 focus:border-red-500' 
                          : 'border-slate-200 text-slate-900 focus:border-slate-900'
                      ]"
                    />
                    <div v-if="phoneFieldError" class="flex items-center gap-1 text-red-600 text-[10px] font-bold mt-1">
                      <svg class="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>FORMATO INVÁLIDO (DIGITE 10 OU 11 DÍGITOS)</span>
                    </div>
                  </div>

                  <!-- Document Field -->
                  <div class="space-y-1.5">
                    <div class="flex justify-between items-center">
                      <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Documento Fiscal *</label>
                      <div class="flex gap-2">
                        <button 
                          type="button" 
                          @click="formDocType = 'CPF'; validateFiscalOnInput()"
                          :class="['text-[10px] font-bold px-1.5 py-0.5 rounded border transition', formDocType === 'CPF' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200']"
                        >CPF</button>
                        <button 
                          type="button" 
                          @click="formDocType = 'CNPJ'; validateFiscalOnInput()"
                          :class="['text-[10px] font-bold px-1.5 py-0.5 rounded border transition', formDocType === 'CNPJ' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200']"
                        >CNPJ</button>
                      </div>
                    </div>
                    <input 
                      :value="formDocValue"
                      @input="handleDocInput"
                      type="text" 
                      required
                      placeholder="000.000.000-00"
                      :class="[
                        'w-full p-3 bg-slate-50 rounded-lg border focus:bg-white focus:ring-0 text-sm transition font-mono',
                        docFieldError 
                          ? 'border-red-500 text-red-600 focus:border-red-500' 
                          : 'border-slate-200 text-slate-900 focus:border-slate-900'
                      ]"
                    />
                    <div v-if="docFieldError" class="flex items-center gap-1 text-red-600 text-[10px] font-bold mt-1">
                      <svg class="w-3.5 h-3.5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>FORMATO INVÁLIDO (USE CPF OU CNPJ BRASILEIRO)</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contract & Property Selection tab -->
              <div v-else-if="activeModalTab === 'contract'" class="space-y-4">
                <h4 class="font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm uppercase tracking-wide font-sans">
                  Dados de Contrato & Imóvel
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Contract Start Date -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Início do Contrato</label>
                    <input 
                      v-model="formContractStart"
                      type="date" 
                      class="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-0 text-sm text-slate-900 transition font-sans"
                    />
                  </div>

                  <!-- Contract End Date -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Fim do Contrato</label>
                    <input 
                      v-model="formContractEnd"
                      type="date" 
                      class="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-0 text-sm text-slate-900 transition font-sans"
                    />
                  </div>

                  <!-- Property Selection -->
                  <div class="sm:col-span-2 space-y-1.5">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Imóveis Vinculados</label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-3 bg-slate-50 rounded-lg border border-slate-200 no-scrollbar">
                      <label 
                        v-for="prop in properties" 
                        :key="prop.id" 
                        class="flex items-start gap-2.5 p-2 hover:bg-slate-100/80 rounded-md cursor-pointer transition select-none"
                      >
                        <input 
                          type="checkbox" 
                          :value="prop.id" 
                          v-model="formPropertyIds"
                          class="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4 mt-0.5"
                        />
                        <div class="min-w-0 leading-tight">
                          <p class="text-xs font-bold text-slate-900 truncate">{{ prop.name }}</p>
                          <p class="text-[10px] text-slate-500 truncate mt-0.5">{{ prop.address }}</p>
                        </div>
                      </label>
                      <div v-if="properties.length === 0" class="sm:col-span-2 text-center py-4 text-xs text-slate-400 font-sans italic">
                        Nenhum imóvel disponível no portfólio.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Documents tab (Available only when editing) -->
              <div v-else-if="activeModalTab === 'docs' && isEditing" class="space-y-4">
                <h4 class="font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm uppercase tracking-wide font-sans">
                  Garantias e Contrato Assinado (PDF)
                </h4>
                
                <!-- Drag and drop simulated file upload zone -->
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

                <!-- Attached documents list -->
                <div class="space-y-2">
                  <h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Arquivos Anexados</h5>
                  <div v-if="!editingTenant?.documents.length" class="text-xs text-slate-500 italic py-2 font-sans">
                    Nenhum documento anexado ainda.
                  </div>
                  <div 
                    v-for="doc in editingTenant?.documents" 
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

              <!-- Action buttons inside form -->
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
                  {{ isEditing ? 'Salvar Alterações' : 'Salvar Inquilino' }}
                </button>
              </div>
            </form>
          </div>
        </div>
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
        <p class="text-xs text-slate-500 font-sans mb-6 font-medium">{{ tenantToDelete?.name }}</p>

        <div class="flex gap-3 w-full">
          <button
            @click="showDeleteConfirm = false; tenantToDelete = null"
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

<style scoped>
@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.animate-slide-in {
  animation: slide-in 0.2s ease-out;
}
</style>
