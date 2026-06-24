# Sistema de Diseño - Sistema Integrado de Control Inmobiliario (SICI)

Este documento define las especificaciones del sistema de diseño para la plataforma SICI, configurado y optimizado para Tailwind CSS, estructurado bajo directivas de UX financiera y diseño premium.

---

## 1. Tokens de Color (Paleta de Colores)

Los colores están mapeados directamente para ser agregados a la configuración de `tailwind.config.js`.

### Colores Base e Institucionales
| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `primary` | `#0f172a` | Fondos de navegación, encabezados y acciones primarias de autoridad. |
| `secondary` | `#505f76` | Texto de apoyo, iconos secundarios y estados inactivos. |
| `accent` | `#3b82f6` | Enlaces, elementos interactivos de navegación y estados activos. |
| `background` | `#f7f9fb` | Fondo general de la aplicación. |
| `surface` | `#ffffff` | Fondo de tarjetas (cards), modales y contenedores de datos. |
| `border-subtle` | `#e2e8f0` | Bordes finos de separación de UI y tablas. |

### Colores de Estado (Semánticos)
| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `success` | `#10b981` | Flujos de caja positivos, contratos activos e ingresos confirmados. |
| `warning` | `#f59e0b` | Alertas de vencimiento de contratos (60 días). |
| `error` | `#ef4444` | Fallos de validación (CPF/CNPJ), errores críticos y campos inválidos. |

---

## 2. Jerarquía Tipográfica

La tipografía base del sistema es **Inter**. Se debe mantener una escala de legibilidad estricta con los siguientes estilos:

*   **Display / Título Principal (`headline-lg`)**
    *   *Clases:* `font-sans text-[32px] font-bold leading-[40px] tracking-[-0.02em]`
    *   *Uso:* Títulos de página y grandes indicadores numéricos.
*   **Título de Sección (`headline-md`)**
    *   *Clases:* `font-sans text-[24px] font-semibold leading-[32px]`
    *   *Uso:* Encabezados de módulos principales.
*   **Subtítulo (`headline-sm`)**
    *   *Clases:* `font-sans text-[20px] font-semibold leading-[28px]`
    *   *Uso:* Encabezados de tarjetas y secciones secundarias.
*   **Cuerpo Destacado (`body-lg`)**
    *   *Clases:* `font-sans text-[16px] font-normal leading-[24px]`
    *   *Uso:* Descripciones detalladas e información legal de contratos.
*   **Cuerpo Estándar (`body-md`)**
    *   *Clases:* `font-sans text-[14px] font-normal leading-[20px]`
    *   *Uso:* Texto general, campos de formulario y etiquetas secundarias.
*   **Etiquetas y Headers de Tabla (`label-md`)**
    *   *Clases:* `font-sans text-[12px] font-semibold leading-[16px] tracking-[0.05em] uppercase`
    *   *Uso:* Encabezados de tablas, metadatos y etiquetas de chips.
*   **Datos Numéricos y Financieros (`data-mono`)**
    *   *Clases:* `font-sans text-[14px] font-medium leading-[20px] tracking-[-0.01em]`
    *   *Uso:* Valores monetarios (R$), CPF, CNPJ e identificadores numéricos.

---

## 3. Componentes Estándar (Clases Tailwind CSS)

### Botones (Buttons)
*   **Botón Primario (Acción Principal)**
    *   *Clases:* `px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-[4px] hover:bg-slate-800 transition duration-150 ease-in-out shadow-sm`
*   **Botón Secundario (Acción de Apoyo)**
    *   *Clases:* `px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-[4px] hover:bg-slate-50 transition duration-150 ease-in-out`
*   **Botón Peligro (Acción Destructiva)**
    *   *Clases:* `px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-[4px] hover:bg-red-700 transition duration-150 ease-in-out`

### Tarjetas de Métricas Financieras (KPI Cards)
Contenedor modular utilizado para presentar flujos de caja y estados de arrendamiento de propiedades.
*   *Estructura y Clases:*
    ```html
    <div class="p-6 bg-white border border-slate-200 rounded-[8px] flex flex-col justify-between">
      <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flujo de Caja Mensual</span>
      <div class="flex items-baseline justify-between mt-2">
        <span class="font-sans text-2xl font-bold tracking-tight text-slate-900">R$ 45.230,00</span>
        <span class="flex items-center text-sm font-medium text-emerald-600">
          <svg class="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          12%
        </span>
      </div>
    </div>
    ```

### Tablas de Datos (Data Tables)
Presentación de contratos, inquilinos e inmuebles con soporte de desplazamiento horizontal.
*   *Estructura y Clases:*
    ```html
    <div class="overflow-x-auto bg-white border border-slate-200 rounded-[8px]">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Inquilino</th>
            <th class="px-6 py-3 text-left text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Contrato</th>
            <th class="px-6 py-3 text-right text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Valor Mensual</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-100">
          <tr class="hover:bg-slate-50/50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">Moacir Silva</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">CON-2026-092</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-900 tracking-tight">R$ 3.500,00</td>
          </tr>
        </tbody>
      </table>
    </div>
    ```

---

## 4. Directivas de UX Financiera y Validación

1.  **Formato de Valores Monetarios:**
    *   Todos los valores deben expresarse en Real Brasileño, usando el prefijo `R$` alineados a la derecha.
    *   Ejemplo de formateo: `R$ 1.250,00`.
2.  **Validación de Documentos Fiscales (CPF/CNPJ):**
    *   Si la entrada es inválida, el borde del input debe cambiar a `border-red-500` (`#ef4444`) inmediatamente tras el evento de pérdida de foco (`blur`) o validación en tiempo real.
    *   El mensaje de error debe acompañar al campo en tipografía `body-md` con color `text-red-500`.
3.  **Alertas de Expiración Prematura (60 días):**
    *   Los contratos a vencer dentro de los próximos 60 días deben marcarse con etiquetas de estado `bg-amber-50 text-amber-700 border-amber-200` y mostrar un icono de advertencia.
