<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
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


let map: any = null;
let markersGroup: any = null;
const markersMap: Record<string, any> = {};
const geocodedCoordinates = ref<Record<string, [number, number]>>({});

function loadLeafletCSS() {
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
}

function loadLeafletJS(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).L) {
      resolve((window as any).L);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve((window as any).L);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function getDeterministicCoordinate(id: string, _index: number): [number, number] {
  const baseLat = -16.6869;
  const baseLon = -49.2648;
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((hash % 1000) / 1000 - 0.5) * 0.04;
  const lonOffset = (((hash >> 10) % 1000) / 1000 - 0.5) * 0.04;
  return [baseLat + latOffset, baseLon + lonOffset];
}

async function getCoordinates(prop: Property, index: number): Promise<[number, number]> {
  const cacheKey = `inmovel_geo_cache_${prop.id}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length === 2) {
        return parsed as [number, number];
      }
    } catch (_) {}
  }

  try {
    await new Promise(resolve => setTimeout(resolve, index * 100));
    const query = encodeURIComponent(`${prop.address}, Goiânia, GO, Brasil`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
      headers: {
        'User-Agent': 'InmovelDashboard/1.0'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        localStorage.setItem(cacheKey, JSON.stringify(coords));
        return coords;
      }
    }
  } catch (err) {
    console.error(`Error geocoding property ${prop.name}:`, err);
  }

  return getDeterministicCoordinate(prop.id, index);
}

function getMarkerHtml(status: string) {
  const isAvailable = status === 'AVAILABLE' || status === 'DISPONIBLE';
  const bgColor = isAvailable ? 'bg-emerald-600' : 'bg-slate-900';
  const pinColor = isAvailable ? 'bg-emerald-600' : 'bg-slate-900';
  return `
    <div class="relative flex flex-col items-center justify-center">
      <div class="w-8 h-8 rounded-full ${bgColor} border-2 border-white flex items-center justify-center shadow-lg transform hover:scale-110 transition duration-150">
        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <div class="absolute -bottom-1 w-2 h-2 ${pinColor} rotate-45 border-r border-b border-white"></div>
    </div>
  `;
}

async function updateMapMarkers(L: any) {
  if (!map || !markersGroup) return;
  markersGroup.clearLayers();
  for (const key in markersMap) {
    delete markersMap[key];
  }
  if (properties.value.length === 0) return;

  const bounds = L.latLngBounds();
  const promises = properties.value.map(async (prop, index) => {
    const coords = await getCoordinates(prop, index);
    geocodedCoordinates.value[prop.id] = coords;

    const isAvailable = prop.status === 'AVAILABLE' || prop.status === 'DISPONIBLE';
    const markerHtml = getMarkerHtml(prop.status);

    const customIcon = L.divIcon({
      html: markerHtml,
      className: 'custom-leaflet-marker',
      iconSize: [32, 36],
      iconAnchor: [16, 36],
      popupAnchor: [0, -36]
    });

    const popupContent = `
      <div class="p-2 font-sans">
        <h4 class="font-bold text-sm text-slate-900 mb-1">${prop.name}</h4>
        <p class="text-xs text-slate-500 mb-2">${prop.address}</p>
        <div class="flex justify-between items-center gap-4 border-t border-slate-100 pt-2">
          <span class="text-xs font-semibold text-slate-900">${formatBRL(prop.rentValue)}</span>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
            isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'
          }">
            ${isAvailable ? 'Disponível' : 'Alugado'}
          </span>
        </div>
      </div>
    `;

    const marker = L.marker(coords, { icon: customIcon })
      .bindPopup(popupContent)
      .addTo(markersGroup);

    markersMap[prop.id] = marker;

    marker.on('click', () => {
      selectedProperty.value = prop;
    });

    bounds.extend(coords);
  });

  await Promise.all(promises);

  if (properties.value.length > 0) {
    map.fitBounds(bounds, { padding: [40, 40] });
  }
}

async function initializeMap() {
  loadLeafletCSS();
  try {
    const L = await loadLeafletJS();
    if (map) {
      map.remove();
    }
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer) return;

    map = L.map('leaflet-map').setView([-16.6869, -49.2648], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    markersGroup = L.featureGroup().addTo(map);
    await updateMapMarkers(L);
  } catch (err) {
    console.error('Error initializing Leaflet map:', err);
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
      setTimeout(() => {
        initializeMap();
      }, 50);
    }
  } catch (err) {
    console.error('Error fetching properties:', err);
  }
}

function selectProperty(prop: Property) {
  selectedProperty.value = prop;
  const coords = geocodedCoordinates.value[prop.id];
  if (coords && map) {
    map.setView(coords, 16);
    const marker = markersMap[prop.id];
    if (marker) {
      marker.openPopup();
    }
  }
}

onMounted(() => {
  if (token.value) {
    fetchDashboardData();
    fetchProperties();
  }
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<template>
  <div class="px-4 py-8 lg:px-8 max-w-[1440px] mx-auto space-y-6 animate-fade-in">
    
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

    
    <div v-if="isLoading" class="py-24 flex flex-col items-center justify-center space-y-4">
      <div class="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-[14px] text-slate-500 font-medium font-sans">Carregando métricas...</span>
    </div>

    <div v-else class="space-y-6">
      
      <div class="grid grid-cols-12 gap-6">
        
        <div class="col-span-12 md:col-span-4 lg:col-span-3 bg-[#0A2540] border border-slate-800 p-6 rounded-xl relative overflow-hidden group transition hover:border-[#FFC107] duration-300 shadow-md flex flex-col justify-between min-h-[190px]">
          <div>
            <div class="flex justify-between items-start mb-4">
              <div class="p-2.5 bg-white/10 rounded-lg text-white/90">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div class="flex items-center text-[#10b981] font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <svg class="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+2.4%</span>
              </div>
            </div>
            <p class="text-white/60 text-[10px] font-semibold uppercase tracking-[0.08em] mb-1 font-sans">
              Taxa de Ocupação
            </p>
            <h3 class="text-[34px] font-bold leading-[38px] tracking-[-0.03em] text-white font-sans">
              {{ kpis.occupancyRate }}%
            </h3>
          </div>
          <div class="mt-4">
            <div class="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div class="bg-[#10b981] h-full rounded-full transition-all duration-500" :style="{ width: `${kpis.occupancyRate}%` }"></div>
            </div>
          </div>
        </div>

        
        <div class="col-span-12 md:col-span-4 lg:col-span-5 bg-gradient-to-br from-white to-slate-50/70 border border-slate-200 p-6 rounded-xl transition hover:border-[#0A2540] duration-300 shadow-sm flex flex-col justify-between min-h-[190px]">
          <div>
            <div class="flex justify-between items-start mb-4">
              <div class="p-2.5 bg-[#0F5132]/10 rounded-lg text-[#0F5132]">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex items-center text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
                <svg class="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+12.8%</span>
              </div>
            </div>
            <p class="text-slate-500 text-[10px] font-semibold uppercase tracking-[0.08em] mb-1 font-sans">
              Fluxo de Caixa (Líquido)
            </p>
            <h3 class="text-[34px] font-bold leading-[38px] tracking-[-0.03em] text-[#0A2540] font-sans truncate" :title="formatBRL(kpis.cashFlow)">
              {{ formatBRL(kpis.cashFlow) }}
            </h3>
          </div>
          <p class="mt-2 text-slate-400 text-[10px] italic font-sans">
            Faturado bruto estimado em BRL
          </p>
        </div>

        
        <div class="col-span-12 md:col-span-4 lg:col-span-4 bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between transition hover:border-[#ef4444] duration-300 shadow-sm min-h-[190px]">
          <div>
            <div class="flex items-center justify-between mb-3.5">
              <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                <svg class="w-4 h-4 text-[#FFC107] shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Alertas Críticos de Contratos
              </h4>
              <span class="bg-red-50 border border-red-100 text-red-600 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-sans">
                {{ alerts.length }} pendentes
              </span>
            </div>
            <div class="space-y-2.5 overflow-y-auto max-h-[110px] pr-1 no-scrollbar">
              <div v-if="alerts.length === 0" class="py-6 text-center text-xs text-slate-400 font-sans italic">
                Nenhum contrato vencendo nos próximos 60 dias.
              </div>
              <div 
                v-for="alert in alerts"
                :key="alert.id"
                @click="router.push({ name: 'tenants' })"
                class="p-2.5 bg-slate-50/70 border-l-4 rounded flex justify-between items-center group cursor-pointer hover:bg-slate-100 transition duration-150 shadow-sm"
                :class="alert.daysRemaining <= 15 ? 'border-red-500' : 'border-[#FFC107]'"
              >
                <div class="min-w-0 pr-2">
                  <p class="font-bold text-[11px] text-slate-900 truncate font-sans group-hover:text-blue-600 transition-colors">{{ alert.tenantName }}</p>
                  <p class="text-[9px] text-slate-400 truncate font-sans">{{ alert.propertyName }}</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-[11px] font-bold font-sans" :class="alert.daysRemaining <= 15 ? 'text-red-600' : 'text-[#FFC107]'">
                    {{ alert.daysRemaining }} dias
                  </p>
                  <p class="text-[8px] text-slate-400 font-sans">
                    Exp. {{ new Date(alert.contractEnd).toLocaleDateString('pt-BR') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button 
            @click="router.push({ name: 'tenants' })"
            class="mt-3.5 w-full pt-2 border-t border-slate-100 text-center text-[10px] font-bold text-[#0A2540] hover:text-blue-600 transition-colors font-sans flex items-center justify-center gap-1"
          >
            <span>Gerenciar Contratos de Locação</span>
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      
      <div class="bg-white border border-slate-200 rounded-lg overflow-hidden min-h-[600px] flex flex-col shadow-sm">
        <div class="flex-grow flex flex-col md:flex-row min-h-[500px]">
          
          <div class="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div class="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
              <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Selecione para localizar</h5>
              <span class="px-2 py-0.5 bg-slate-900/10 text-slate-950 text-[10px] font-bold rounded uppercase tracking-wider font-sans">
                {{ properties.length }} Imóveis
              </span>
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
          
          
          <div class="flex-1 relative min-h-[400px] md:min-h-0 bg-slate-100 flex items-stretch">
            <div id="leaflet-map" class="w-full h-full min-h-[500px] flex-grow z-10"></div>
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

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border: 1px solid rgb(226 232 240);
  padding: 0;
}
:deep(.leaflet-popup-content) {
  margin: 0;
}
:deep(.leaflet-popup-tip) {
  border: 1px solid rgb(226 232 240);
}
</style>
