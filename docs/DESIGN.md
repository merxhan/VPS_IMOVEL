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

---

## 5. Estructura y Desglose de Vistas

Esta sección detalla la disposición física de elementos, secciones principales y componentes clave de las vistas del sistema.

### 5.1. Estructura General de Navegación (Layout)
La interfaz principal de SICI se estructura bajo un diseño de dos paneles principales:
1.  **Barra Lateral Colapsable (`Sidebar`):**
    *   *Ancho:* `260px` expandido, `80px` colapsado (en responsive, colapsa mediante traslación fuera de pantalla con overlay táctil).
    *   *Elementos:* Logotipo institucional `SICI`, eslogan "Gestión Inmobiliaria" (en mayúsculas para móvil), enlaces de navegación vertical con estados activos destacados mediante fondo contrastado y borde izquierdo de resalte (`Dashboard`, `Inmuebles`, `Inquilinos`, `Configuraciones`), y área de perfil del administrador de sesión activa en la parte inferior.
2.  **Cabecera Superior (`Header`):**
    *   *Altura:* `64px` (`h-16`).
    *   *Elementos:* Botón de alternancia de barra lateral (hamburguesa), buscador global integrado con iconos de soporte, y acciones rápidas a la derecha (notificaciones con indicador de alerta activa, ayuda y acceso al perfil de usuario).
3.  **Lienzo de Contenido (`Main Content Canvas`):**
    *   *Disposición:* Ajuste de margen dinámico en base al estado de la barra lateral (`ml-[260px]` o `ml-[80px]`/`ml-0` en móvil), con un contenedor de ancho máximo (`1440px`), espaciados internos adaptativos (`p-4` a `p-8`) y scroll vertical independiente.

---

### 5.2. Inicio de Sesión (Login)
Disposición para el acceso seguro a la plataforma:
1.  **Estructura Centrada:**
    *   Contenedor de formulario de acceso minimalista, centrado vertical y horizontalmente en pantalla mediante flexbox de altura completa (`min-h-screen`).
2.  **Campos del Formulario:**
    *   Entradas para teléfono de contacto y contraseña con bordes sutiles y estados de foco interactivos.
    *   Mensajes de error en tiempo real bajo los inputs si las credenciales fallan o tienen formatos incorrectos.
3.  **Acciones:**
    *   Botón de acción principal en color primario para validación y envío de credenciales.
    *   Enlace de recuperación de contraseña ("Recuperar Contraseña") alineado y formateado según la jerarquía tipográfica estándar.

---

### 5.3. Panel de Control (Dashboard)
Disposición del módulo de resumen operativo y financiero en formato Bento Grid:
1.  **Encabezado del Módulo:**
    *   Título principal (`headline-lg`) con descripción de región operativa.
    *   Selector de rango de fechas y botón de exportación de informes financieros.
2.  **Bento Grid (Sección Superior):**
    *   **KPI Tasa de Ocupación:** Tarjeta que muestra el porcentaje total (94.2%) y barra de progreso de relleno dinámico.
    *   **KPI Flujo de Caja Mensual:** Panel de visualización extendido que indica la renta acumulada (R$ 145.280,00) y notas explicativas de cobros proyectados.
    *   **Alertas de Expiración (Panel Crítico):** Listado compacto con barra de scroll interno que destaca contratos con vencimientos inferiores a 60 días usando bordes semánticos de advertencia y peligro.
3.  **Mapa Operativo (Sección Inferior):**
    *   *Dimensiones:* Altura mínima de 600px.
    *   *Disposición:* Contenedor de ancho completo integrado con un mapa interactivo de Goiânia-GO en modo oscuro. Cuenta con marcadores fluorescentes con estados de ocupación (alta densidad vs. vacantes), paneles flotantes informativos de sectores activos y controles de zoom (+, -, geolocalización).

---

### 5.4. Gestión de Inmuebles
Diseño del catálogo de activos y registro técnico:
1.  **Estadísticas del Módulo (KPI Grid):**
    *   Cuatro tarjetas financieras estandarizadas: Total Inmuebles (124), Porcentaje Alquilado (79% con barra de estado), Alertas de Atención Inmediata (12) y Renta Mensual Total (R$ 485.200,00).
2.  **Filtros y Tabla de Datos:**
    *   Segmentador superior tipo chip (Todos, Disponibles, En Proceso).
    *   Buscador rápido y acciones de filtrado avanzado y descarga de reportes.
    *   Tabla responsiva con columnas para: Detalles del activo (Nombre/Dirección con icono representativo según tipo), CEP del inmueble, Valor mensual del alquiler (alineado a la derecha en formato financiero), Etiqueta de estado del contrato y fecha de última revisión.
3.  **Modal "Registrar Nuevo Inmueble":**
    *   *Diseño:* Ventana modal de doble columna optimizada para flujos de carga complejos.
    *   *Columna Izquierda (Pestañas de Navegación):* Navegación por secciones del formulario (Datos Generales, Contrato de Alquiler, Carga de Documentación) e indicador visual de progreso de carga.
    *   *Columna Derecha (Campos de Entrada):* Formulario estructurado para entrada de dirección completa, CEP obligatorio, ciudad, valor de alquiler mensual en R$, fecha de inicio de contrato y zona de arrastrar y soltar (drag & drop) para escrituras en formato PDF (límite de 5MB).

---

### 5.5. Gestión de Inquilinos
Diseño del catálogo de arrendatarios y control fiscal:
1.  **Métricas de Resumen (KPI Grid):**
    *   Cuatro tarjetas en disposición responsiva superior: Total Inquilinos (1,284 con indicador de crecimiento mensual +3%), Contratos Activos (942 con tasa de ocupación), Próximos Vencimientos (18 contratos en 60 días) y Alerta Fiscal (3 documentos pendientes de validación).
2.  **Filtros y Tabla de Datos:**
    *   Buscador integrado en cabecera y botón principal de creación ("AÑADIR INQUILINO").
    *   Tabla de inquilinos con soporte responsivo y columnas dedicadas:
        *   Inquilino: Nombre completo del arrendatario con avatar circular conteniendo sus iniciales.
        *   Email: Dirección de correo electrónico principal del contacto.
        *   Teléfono: Número telefónico bajo formato de datos monoespaciado.
        *   CPF / CNPJ: Documento de identificación fiscal (muestra el valor estructurado o la alerta "Documento Inválido" en rojo si no cumple las reglas nacionales).
        *   Estado: Indicador semántico de estado operativo ("Activo" en color de éxito, "Pendiente" en color de advertencia).
        *   Acciones: Enlaces rápidos para edición y eliminación.
    *   Barra de paginación inferior con control de registros visibles y avance de páginas.
3.  **Modal de Registro ("Añadir Nuevo Inquilino"):**
    *   Ventana modal flotante con overlay desenfocado.
    *   Formulario de dos columnas para datos personales y fiscales (Nombre, Email, Teléfono, CPF/CNPJ).
    *   Validador dinámico de longitud e interpolación de formato para CPF (11 dígitos) y CNPJ (14 dígitos), con advertencia de error visible si la entrada es inválida.
    *   Selector de Propiedad Asignada del catálogo activo.
    *   Caja de información de aviso regulatorio fiscal inferior y controles de confirmación ("CANCELAR", "GUARDAR INQUILINO").

---

### 5.6. Configuraciones
Panel de control de opciones globales y control de accesos:
1.  **Disposición Bento Grid:**
    *   **Gestión de Usuarios (Card Derecha, 2 Columnas):**
        *   Cabecera con botón de acción "NUEVO USUARIO" e icono identificador de cuentas.
        *   Tabla de usuarios registrados con columnas para:
            *   Usuario: Nombre completo, correo corporativo y avatar de identificación.
            *   Rol de Acceso: Etiquetas de visibilidad del sistema ("ADMIN" en estilo de botón de color primario oscuro, "EDITOR" en color secundario contenedor).
            *   Acciones: Botones rápidos para editar o eliminar permisos de acceso.
        *   Paginación inferior y estadísticas de cuentas registradas sobre el sistema.
2.  **Footer Global:**
    *   Registro de copyright y versión de la plataforma alineada al centro del contenedor.

