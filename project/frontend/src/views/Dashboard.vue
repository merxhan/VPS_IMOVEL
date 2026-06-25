<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const token = computed(() => localStorage.getItem('inmovel_token'));
const router = useRouter();

interface KPI {
  totalProperties: number;
  occupiedProperties: number;
  occupancyRate: number;
  projectedIncome: number;
  cashFlow: number;
}

interface Alert {
  id: string;
  tenantName: string;
  propertyName: string;
  propertyAddress: string;
  contractEnd: string;
  daysRemaining: number;
}

interface Property {
  id: string;
  name: string;
  address: string;
  cep: string;
  rentValue: number;
  status: string;
}

const kpis = ref<KPI>({
  totalProperties: 0,
  occupiedProperties: 0,
  occupancyRate: 0,
  projectedIncome: 0,
  cashFlow: 0,
});

const alerts = ref<Alert[]>([]);
const properties = ref<Property[]>([]);
const selectedProperty = ref<Property | null>(null);
const isLoading = ref(true);
const backendUrl = import.meta.env.VITE_API_URL || '/api';

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

async function fetchDashboardData() {
  isLoading.value = true;
  try {
    const res = await fetch(`${backendUrl}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      kpis.value = data.kpis;
      alerts.value = data.alerts;
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  } finally {
    isLoading.value = false;
  }
}

async function fetchProperties() {
  try {
    const res = await fetch(`${backendUrl}/properties`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });
    if (res.ok) {
      properties.value = await res.json();
      if (properties.value.length > 0) {
        selectedProperty.value = properties.value[0];
      }
    }
  } catch (err) {
    console.error('Error fetching properties:', err);
  }
}

function selectProperty(prop: Property) {
  selectedProperty.value = prop;
}

const googleMapUrl = computed(() => {
  if (selectedProperty.value) {
    const query = encodeURIComponent(`${selectedProperty.value.address}, Goiânia, GO, Brasil`);
    return `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }
  return `https://maps.google.com/maps?q=Goi%C3%A2nia%2C%20GO%2C%20Brasil&t=&z=12&ie=UTF8&iwloc=&output=embed`;
});

onMounted(() => {
  if (token.value) {
    fetchDashboardData();
    fetchProperties();
  }
});
</script>

<template>
  <div class="px-4 py-8 lg:px-8 max-w-[1440px] mx-auto space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-slate-100">
      <div>
        <h1 class="text-[32px] font-bold leading-[40px] tracking-[-0.02em] text-slate-900 font-sans">
          Painel de Controle Financeiro
        </h1>
        <p class="text-[14px] text-slate-500 mt-1 font-sans">
          Perspectiva de 360 graus do portfólio de imóveis
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button 
          @click="fetchDashboardData(); fetchProperties()"
          class="px-4 py-2 bg-white border border-slate-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm font-sans"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
          </svg>
          <span>Sincronizar</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-24 flex flex-col items-center justify-center space-y-4">
      <div class="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-[14px] text-slate-500 font-medium font-sans">Carregando métricas...</span>
    </div>

    <div v-else class="space-y-6">
      <!-- Bento Grid (Seção Superior) -->
      <div class="grid grid-cols-12 gap-6">
        <!-- KPI Tasa de Ocupación -->
        <div class="col-span-12 md:col-span-4 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-lg relative overflow-hidden group transition hover:border-slate-900 duration-300 shadow-sm">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 bg-slate-100 rounded-lg text-slate-700">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div class="flex items-center text-emerald-600 font-bold text-sm">
              <svg class="w-4 h-4 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>+2.4%</span>
            </div>
          </div>
          <p class="text-slate-500 text-[11px] font-semibold uppercase tracking-[0.05em] mb-1 font-sans">
            Taxa de Ocupação
          </p>
          <h3 class="text-[32px] font-bold leading-[40px] tracking-[-0.02em] text-slate-900 font-sans">
            {{ kpis.occupancyRate }}%
          </h3>
          <div class="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div class="bg-slate-900 h-full rounded-full transition-all duration-500" :style="{ width: `${kpis.occupancyRate}%` }"></div>
          </div>
        </div>

        <!-- KPI Flujo de Caixa Mensual -->
        <div class="col-span-12 md:col-span-4 lg:col-span-5 bg-white border border-slate-200 p-6 rounded-lg transition hover:border-slate-900 duration-300 shadow-sm">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 bg-slate-100 rounded-lg text-slate-700">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex items-center text-emerald-600 font-bold text-sm">
              <svg class="w-4 h-4 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>+12.8%</span>
            </div>
          </div>
          <p class="text-slate-500 text-[11px] font-semibold uppercase tracking-[0.05em] mb-1 font-sans">
            Fluxo de Caixa (Líquido)
          </p>
          <h3 class="text-[32px] font-bold leading-[40px] tracking-[-0.02em] text-slate-900 font-sans truncate" :title="formatBRL(kpis.cashFlow)">
            {{ formatBRL(kpis.cashFlow) }}
          </h3>
          <p class="mt-2 text-slate-400 text-xs italic font-sans">
            Faturado bruto estimado em BRL
          </p>
        </div>

        <!-- Alertas de Expiración (Panel Crítico) -->
        <div class="col-span-12 md:col-span-4 lg:col-span-4 bg-white border border-slate-200 p-6 rounded-lg flex flex-col justify-between transition hover:border-slate-900 duration-300 shadow-sm">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Alertas Críticos de Contratos (Vencimento &lt; 60 dias)
              </h4>
              <span class="bg-red-50 border border-red-100 text-red-600 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider font-sans">
                Crítico
              </span>
            </div>
            <div class="space-y-3 overflow-y-auto max-h-[120px] pr-1 no-scrollbar">
              <div v-if="alerts.length === 0" class="py-6 text-center text-xs text-slate-400 font-sans italic">
                Nenhum contrato vencendo nos próximos 60 dias.
              </div>
              <div 
                v-for="alert in alerts"
                :key="alert.id"
                @click="router.push({ name: 'tenants' })"
                class="p-3 bg-slate-50 border-l-4 rounded flex justify-between items-center group cursor-pointer hover:bg-slate-100 transition duration-150"
                :class="alert.daysRemaining <= 15 ? 'border-red-500' : 'border-amber-500'"
              >
                <div class="min-w-0 pr-2">
                  <p class="font-bold text-xs text-slate-900 truncate font-sans">{{ alert.tenantName }}</p>
                  <p class="text-[10px] text-slate-400 truncate font-sans">{{ alert.propertyName }}</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-xs font-bold font-sans" :class="alert.daysRemaining <= 15 ? 'text-red-600' : 'text-amber-600'">
                    {{ alert.daysRemaining }} dias
                  </p>
                  <p class="text-[9px] text-slate-400 font-sans">
                    Exp. {{ new Date(alert.contractEnd).toLocaleDateString('pt-BR') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button 
            @click="router.push({ name: 'tenants' })"
            class="mt-4 w-full pt-3 border-t border-slate-100 text-center text-xs font-bold text-blue-600 hover:text-slate-900 transition-colors font-sans"
          >
            Gerenciar Contratos de Locação →
          </button>
        </div>
      </div>

      <!-- Mapa Operativo (Seção Inferior) -->
      <div class="bg-white border border-slate-200 rounded-lg overflow-hidden min-h-[600px] flex flex-col shadow-sm">
        <div class="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
          <div>
            <h4 class="text-lg font-bold text-slate-950 font-sans">
              Distribuição de Imóveis
            </h4>
            <p class="text-xs text-slate-500 mt-0.5 font-sans">
              Localização exata de imóveis do portfólio em Goiânia, GO através do Google Maps.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 bg-slate-900/10 text-slate-950 text-xs font-bold rounded uppercase tracking-wider font-sans">
              {{ properties.length }} Imóveis Totais
            </span>
          </div>
        </div>
        
        <div class="flex-grow flex flex-col md:flex-row min-h-[500px]">
          <!-- Lista Lateral de Imóveis (1/3 Largura) -->
          <div class="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div class="p-4 border-b border-slate-200 bg-white">
              <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Selecione para localizar</h5>
            </div>
            
            <div class="flex-1 overflow-y-auto max-h-[500px] divide-y divide-slate-100 no-scrollbar">
              <div v-if="properties.length === 0" class="p-8 text-center text-xs text-slate-500 font-sans italic">
                Nenhum imóvel registrado.
              </div>
              
              <div 
                v-else
                v-for="prop in properties"
                :key="prop.id"
                @click="selectProperty(prop)"
                :class="[
                  'p-4 cursor-pointer transition duration-150 flex flex-col gap-1 text-left font-sans',
                  selectedProperty?.id === prop.id 
                    ? 'bg-blue-50/70 border-l-4 border-blue-500' 
                    : 'hover:bg-slate-50 bg-white border-l-4 border-transparent'
                ]"
              >
                <div class="flex justify-between items-start gap-2">
                  <span :class="['font-bold text-xs truncate max-w-[150px] font-sans', selectedProperty?.id === prop.id ? 'text-blue-600' : 'text-slate-900']">
                    {{ prop.name }}
                  </span>
                  <span 
                    :class="[
                      'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter shrink-0 font-sans',
                      prop.status === 'AVAILABLE' || prop.status === 'DISPONIBLE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-slate-100 text-slate-500'
                    ]"
                  >
                    {{ prop.status === 'AVAILABLE' || prop.status === 'DISPONIBLE' ? 'Disponível' : 'Alugado' }}
                  </span>
                </div>
                <p class="text-[10px] text-slate-500 truncate font-sans">{{ prop.address }}</p>
                <div class="flex justify-between items-center mt-2 text-[9px] font-medium text-slate-400 font-sans">
                  <span>CEP: {{ prop.cep || '-' }}</span>
                  <span class="font-bold text-slate-900">{{ formatBRL(Number(prop.rentValue)) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Contêiner do Google Maps (2/3 Largura) -->
          <div class="flex-1 relative min-h-[400px] md:min-h-0 bg-slate-100 flex items-stretch">
            <iframe 
              v-if="selectedProperty || properties.length === 0"
              :src="googleMapUrl"
              class="w-full h-full border-none min-h-[500px] flex-grow"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
