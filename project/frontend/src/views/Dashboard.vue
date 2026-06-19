<script setup lang="ts">
import { computed } from 'vue';
const token = computed(() => localStorage.getItem('inmovel_token'));
const user = computed(() => JSON.parse(localStorage.getItem('inmovel_user') || '{}'));

import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t: $t, locale: i18nLocale } = useI18n();

import { ref, onMounted, computed } from 'vue';

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

interface FinHistory {
  month: string;
  ingresos: number;
  gastos: number;
}

const kpis = ref<KPI>({
  totalProperties: 0,
  occupiedProperties: 0,
  occupancyRate: 0,
  projectedIncome: 0,
  cashFlow: 0,
});

const alerts = ref<Alert[]>([]);
const financialHistory = ref<FinHistory[]>([]);
const isLoading = ref(true);

const backendUrl = import.meta.env.VITE_API_URL || '/api';

// Format currency helper
function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Fetch dashboard data
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
      financialHistory.value = data.financialHistory;
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  if (token.value) {
    fetchDashboardData();
  }
});

// Custom interactive SVG graph helper calculations
const maxVal = computed(() => {
  if (financialHistory.value.length === 0) return 10000;
  const vals = financialHistory.value.flatMap(h => [h.ingresos, h.gastos]);
  return Math.max(...vals, 1000) * 1.1; // 10% padding on top
});

const activeBarIndex = ref<number | null>(null);
</script>

<template>
  <div class="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-border pb-6">
      <div>
        <h1 class="text-3xl font-black text-inmo-brand tracking-tight">
          {{ $t('dashboard.title') }}
        </h1>
        <p class="text-sm text-neutral-muted mt-1">
          {{ $t('dashboard.subtitle') }}
        </p>
      </div>
      <button 
        @click="fetchDashboardData"
        class="mt-4 md:mt-0 flex items-center justify-center space-x-2 bg-white border border-neutral-border px-4 py-2 rounded-lg text-sm text-neutral-dark hover:bg-slate-50 transition shadow-sm font-semibold"
      >
        <!-- Refresh Icon -->
        <svg class="w-4 h-4 text-neutral-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
        </svg>
        <span>Sincronizar</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-20 flex flex-col items-center justify-center space-y-4">
      <div class="w-12 h-12 border-4 border-inmo-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm text-neutral-muted font-medium">Cargando métricas de Goiânia-GO...</span>
    </div>

    <div v-else class="space-y-8">
      <!-- KPI Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <!-- KPI 1: Occupancy -->
        <div class="bg-white border border-neutral-border p-6 rounded-2xl shadow-sm">
          <div class="flex justify-between items-start">
            <div class="text-xs uppercase font-bold text-neutral-muted tracking-wider">
              {{ $t('dashboard.occupancy') }}
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-goiania-accent">
              Activo
            </span>
          </div>
          <div class="mt-4 flex items-baseline space-x-2">
            <span class="text-4xl font-extrabold text-goiania-green">
              {{ kpis.occupancyRate }}%
            </span>
            <span class="text-xs text-neutral-muted">
              ({{ kpis.occupiedProperties }} de {{ kpis.totalProperties }} inmuebles)
            </span>
          </div>
        </div>

        <!-- KPI 2: Projected Monthly Income -->
        <div class="bg-white border border-neutral-border p-6 rounded-2xl shadow-sm">
          <div class="text-xs uppercase font-bold text-neutral-muted tracking-wider">
            {{ $t('dashboard.projectedIncome') }}
          </div>
          <div class="mt-4 text-3xl font-extrabold text-inmo-brand">
            {{ formatBRL(kpis.projectedIncome) }}
          </div>
          <p class="text-[10px] text-neutral-muted mt-2">Facturado bruto estimado en BRL</p>
        </div>

        <!-- KPI 3: Cash Flow -->
        <div class="bg-white border border-neutral-border p-6 rounded-2xl shadow-sm">
          <div class="text-xs uppercase font-bold text-neutral-muted tracking-wider">
            {{ $t('dashboard.cashFlow') }}
          </div>
          <div class="mt-4 text-3xl font-extrabold text-goiania-green">
            {{ formatBRL(kpis.cashFlow) }}
          </div>
          <p class="text-[10px] text-neutral-muted mt-2">Ingresos netos deducidos administrativos (-8%)</p>
        </div>
      </div>

      <!-- Critical Warnings (Oro Ipê) & Graphs Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Alerts Panel -->
        <div class="lg:col-span-1 bg-white border border-neutral-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center space-x-2 border-b border-neutral-border pb-4 mb-4">
              <svg class="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 class="text-base font-bold text-inmo-brand">
                {{ $t('dashboard.alerts') }}
              </h2>
            </div>

            <!-- Warning List -->
            <div class="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              <div v-if="alerts.length === 0" class="py-8 text-center text-sm text-neutral-muted">
                {{ $t('dashboard.noAlerts') }}
              </div>
              <div 
                v-for="alert in alerts"
                :key="alert.id"
                class="p-4 bg-amber-50 border border-goiania-ipe/40 rounded-xl flex justify-between items-start space-x-3 transition hover:shadow-sm"
              >
                <div class="overflow-hidden">
                  <div class="text-xs font-bold text-[#977004] truncate">{{ alert.tenantName }}</div>
                  <div class="text-[11px] text-neutral-dark font-medium mt-1 truncate">{{ alert.propertyName }}</div>
                  <div class="text-[9.5px] text-neutral-muted mt-0.5 truncate">{{ alert.propertyAddress }}</div>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-xs font-black text-red-600 bg-red-100/50 px-2 py-0.5 rounded border border-red-200">
                    {{ alert.daysRemaining }}d
                  </div>
                  <div class="text-[8px] text-neutral-muted mt-1 uppercase font-semibold">
                    {{ $t('dashboard.alertExpires') }} {{ new Date(alert.contractEnd).toLocaleDateString('pt-BR') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 border-t border-neutral-border pt-4 text-center">
            <button 
              @click="router.push({ name: 'tenants' })"
              class="text-xs font-semibold text-inmo-primary hover:underline hover:text-inmo-brand"
            >
              Gestionar Contratos de Arrendamiento →
            </button>
          </div>
        </div>

        <!-- Premium Custom SVG Chart -->
        <div class="lg:col-span-2 bg-white border border-neutral-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between border-b border-neutral-border pb-4 mb-6">
            <h2 class="text-base font-bold text-inmo-brand">
              {{ $t('dashboard.chartTitle') }}
            </h2>
            <div class="flex items-center space-x-4 text-xs font-semibold">
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-3 bg-goiania-green rounded-sm"></span>
                <span class="text-neutral-dark">Ingresos</span>
              </span>
              <span class="flex items-center space-x-1.5">
                <span class="w-3 h-3 bg-red-600 rounded-sm"></span>
                <span class="text-neutral-dark">Gastos</span>
              </span>
            </div>
          </div>

          <!-- Interactive SVG rendering -->
          <div class="w-full flex justify-center items-center h-72">
            <svg 
              v-if="financialHistory.length > 0"
              class="w-full h-full"
              viewBox="0 0 600 240"
            >
              <!-- Background grid lines -->
              <line x1="50" y1="30" x2="560" y2="30" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3,3" />
              <line x1="50" y1="90" x2="560" y2="90" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3,3" />
              <line x1="50" y1="150" x2="560" y2="150" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3,3" />
              <line x1="50" y1="210" x2="560" y2="210" stroke="#DEE2E6" stroke-width="1.5" />

              <!-- Left Y-Axis labels -->
              <text x="40" y="34" fill="#6C757D" font-size="9" text-anchor="end">{{ formatBRL(maxVal) }}</text>
              <text x="40" y="94" fill="#6C757D" font-size="9" text-anchor="end">{{ formatBRL(maxVal * 0.66) }}</text>
              <text x="40" y="154" fill="#6C757D" font-size="9" text-anchor="end">{{ formatBRL(maxVal * 0.33) }}</text>
              <text x="40" y="214" fill="#6C757D" font-size="9" text-anchor="end">R$ 0</text>

              <!-- Monthly entries -->
              <g v-for="(hist, idx) in financialHistory" :key="hist.month">
                <!-- X-axis coordinates: index * 85 + 85 -->
                <!-- Bars height calculation relative to maxVal -->
                <!-- Ingresos Bar -->
                <rect 
                  :x="idx * 85 + 75"
                  :y="210 - (hist.ingresos / maxVal) * 180"
                  width="18"
                  :height="(hist.ingresos / maxVal) * 180"
                  fill="#0F5132"
                  rx="3"
                  class="transition-all duration-300 hover:opacity-90 cursor-pointer"
                  @mouseenter="activeBarIndex = idx"
                  @mouseleave="activeBarIndex = null"
                />
                
                <!-- Gastos Bar -->
                <rect 
                  :x="idx * 85 + 98"
                  :y="210 - (hist.gastos / maxVal) * 180"
                  width="18"
                  :height="(hist.gastos / maxVal) * 180"
                  fill="#DC2626"
                  rx="3"
                  class="transition-all duration-300 hover:opacity-90 cursor-pointer"
                  @mouseenter="activeBarIndex = idx"
                  @mouseleave="activeBarIndex = null"
                />

                <!-- X-Axis text -->
                <text 
                  :x="idx * 85 + 95" 
                  y="228" 
                  fill="#212529" 
                  font-weight="bold" 
                  font-size="10.5" 
                  text-anchor="middle"
                >
                  {{ hist.month }}
                </text>

                <!-- Tooltip values shown above bars on hover -->
                <g v-if="activeBarIndex === idx" class="pointer-events-none">
                  <rect 
                    :x="idx * 85 + 40" 
                    y="10" 
                    width="110" 
                    height="32" 
                    fill="#0A2540" 
                    rx="6" 
                    opacity="0.95"
                  />
                  <text :x="idx * 85 + 95" y="22" fill="#FFFFFF" font-size="8.5" font-weight="bold" text-anchor="middle">
                    Ing: {{ formatBRL(hist.ingresos) }}
                  </text>
                  <text :x="idx * 85 + 95" y="34" fill="#FFC107" font-size="8.5" font-weight="bold" text-anchor="middle">
                    Gasto: {{ formatBRL(hist.gastos) }}
                  </text>
                </g>
              </g>
            </svg>
            <div v-else class="text-slate-400 text-sm">Sin datos históricos financieros.</div>
          </div>

          <div class="mt-4 border-t border-neutral-border pt-4 text-center">
            <button 
              @click="router.push({ name: 'properties' })"
              class="text-xs font-semibold text-inmo-primary hover:underline hover:text-inmo-brand"
            >
              Consultar Ingresos por Propiedad →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
