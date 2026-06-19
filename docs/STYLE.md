## 1. Identidad Visual y Concepto de Diseño

El concepto estético se basa en la **confianza, modernidad y frescura**. Goiânia es una ciudad de contrastes armónicos: grandes e imponentes rascacielos residenciales (como los de los sectores Marista y Bueno) rodeados de parques frondosos y los icónicos árboles Ipê. 

Por lo tanto, la interfaz huye de los grises planos y adopta una estética premium que transmite solidez corporativa sin perder la calidez y la luz características de la región Centro-Oeste.

---

## 2. Paleta de Colores (Configuración de Tailwind)

Para aplicar estos colores en el proyecto, reemplace o extienda la sección `theme.extend.colors` en el archivo `frontend/tailwind.config.js`:

```javascript
// frontend/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        inmo: {
          // Azul Marista: Representa los rascacielos, la solidez corporativa y jurídica
          brand: '#0A2540',      // Azul Ultra Profundo (Sidebar, Textos Principales)
          primary: '#1E3A8A',    // Azul Real Corporativo (Botones principales, Enlaces)
          light: '#F4F6F9',      // Fondo de la aplicación (Limpio, descansado para la vista)
        },
        goiania: {
          // Verde Buriti: Inspirado en los parques de la ciudad (Flamboyant, Vaca Brava) y el éxito financiero
          green: '#0F5132',      // Verde Esmeralda Oscuro (KPIs positivos, Tasas de ocupación)
          accent: '#198754',     // Verde Activo (Éxito, badges activos)
          
          // Dorado Ipê: Inspirado en la floración de los Ipês amarillos de Goiânia
          ipe: '#FFC107',        // Oro Ipê (Alertas críticas, contratos a 60 días de vencer)
          ipeHover: '#E0A800',
        },
        neutral: {
          dark: '#212529',       // Texto principal (Alta legibilidad)
          muted: '#6C757D',      // Subtítulos y etiquetas secundarias
          border: '#DEE2E6',     // Líneas de tablas y divisiones limpias
        }
      }
    }
  }
}

```

### Tabla de Aplicación Semántica

| Color | Código HEX | Rol en la Interfaz | Significado / Contexto Local |
| --- | --- | --- | --- |
| **Azul Marista** | `#0A2540` | Fondos de navegación principal, Sidebar, títulos de secciones. | Inspirado en el distrito financiero y residencial de alta gama de Goiânia. |
| **Verde Buriti** | `#0F5132` | Valores numéricos positivos, gráficas de ingresos, tasas de ocupación altas. | El verde de la capital ecológica de Brasil; denota crecimiento y salud financiera. |
| **Oro Ipê** | `#FFC107` | Alertas de contratos por vencer (< 60 días), notificaciones de atención, estados pendientes. | El color más icónico de la flora goiana; destaca de forma inmediata sobre el fondo claro. |
| **Gris Neutro** | `#F4F6F9` | Fondo general de todas las vistas del dashboard. | Minimiza la fatiga visual del gestor inmobiliario que opera el sistema durante horas. |

---

## 3. Tipografía y Jerarquía Visual

Para garantizar consistencia y legibilidad estricta en datos numéricos y contratos, se utiliza la fuente **Inter** o **Plus Jakarta Sans** (estilo limpio, geométrico y corporativo).

* **Títulos Principales (`h1`):** `24pt` | Semibold | Color: `inmo.brand`. Usado en las cabeceras de cada vista (ej: "Gestión de Inmuebles").
* **Subtítulos de Sección (`h2`):** `16pt` | Medium | Color: `neutral.dark` con borde izquierdo de `4px` en `goiania.green` para destacar el bloque.
* **Títulos de Tarjetas (`h3` / KPIs):** `12pt` | Regular | Color: `neutral.muted` (en mayúsculas para etiquetas de métricas).
* **Texto de Cuerpo / Datos:** `10.5pt` | Regular | Color: `neutral.dark`.
* **Datos Numéricos Financiados:** `11pt` | Bold (Monospace parcial opcional si son tablas financieras) | Color: `inmo.brand` o `goiania.green`.

---

## 4. Componentes de Interfaz Estándar (UI Kit Manual)

Bajo la filosofía **KISS**, se evitan efectos de desenfoque pesados o sombras degradadas complejas. Se prioriza el diseño plano con bordes definidos.

### A. Tarjetas de Métricas (KPI Cards)

Estructuras limpias con un sutil borde gris para separar los datos.

* **Estructura HTML/Tailwind sugerida:**
```html
<div class="bg-white border border-neutral-border p-5 rounded-lg shadow-sm">
  <div class="text-xs uppercase font-medium text-neutral-muted tracking-wider">Tasa de Ocupación</div>
  <div class="mt-2 text-3xl font-bold text-goiania-green">94.2 %</div>
</div>

```

### B. Botones Accionables

* **Botón Primario (Guardar, Crear, Confirmar):** Fondo `inmo.primary` con texto blanco. Efecto hover suave a un tono más oscuro.
* **Botón Secundario (Cancelar, Volver):** Fondo transparente, borde `neutral.border`, texto `neutral.muted`.
* **Botón de Alerta Máxima:** Fondo `goiania.ipe`, texto `inmo.brand` (alto contraste).

### C. Tablas de Datos (Inmuebles e Inquilinos)

* **Cabecera de Tabla:** Fondo `inmo.brand`, texto blanco, alineación a la izquierda.
* **Filas:** Fondo blanco puro. Alternancia de filas (*zebra striping*) con fondo `inmo.light` en filas impares opcional.
* **Bordes:** Línea inferior de `1px` en `#DEE2E6` entre filas.

### D. Badges de Estado (Etiquetas)

* **Estado Disponible (Vacante):** Fondo verde claro suave, texto `goiania.accent`.
* **Estado Alquilado:** Fondo azul claro suave, texto `inmo.primary`.
* **Contrato en Alerta:** Fondo amarillo claro suave, texto `#977004` (derivado del Oro Ipê para legibilidad).

---

## 5. Directivas UX y Accesibilidad Financiera

1. **Formateo del Real Brasileño (BRL):** Nunca renderizar un valor financiero como un número plano. Se debe usar el prefijo `R$ ` seguido del espacio reglamentario, separador de miles por punto `.` y decimales por coma `,` (Ej: `R$ 4.500,00`).
2. **Uso Exclusivo del Oro Ipê:** El color amarillo/dorado está estrictamente reservado para la alerta de vencimiento de contratos a 60 días y errores de validación de documentos (CPF/CNPJ). No debe usarse como decoración estética para no diluir su valor de advertencia.
3. **Internacionalización Sin Desajustes de Layout:** Al cambiar entre Portugués, Español e Inglés, las etiquetas de los botones pueden variar en longitud. Los contenedores de los formularios deben prever márgenes amplios (`padding` y `gap` estables en lugar de anchos fijos en píxeles) para evitar el desbordamiento del texto (*overflow*).

A continuación, presento todo el código y contenido del archivo `ESTILO.md` enfocado exclusivamente al diseño visual, la experiencia de usuario (UX) y la identidad regional para tu proyecto:

# Guía de Estilo Visual y Diseño UI/UX — SICI

Este documento define el sistema de diseño, la paleta de colores y los lineamientos de interfaz para el **Sistema Integrado de Control Inmobiliario (SICI)**. El diseño combina la sobriedad del sector financiero-inmobiliario de alta gama con la identidad de **Goiânia-GO**, conocida como la "Capital Verde" de Brasil y un polo de expansión arquitectónica moderna y agronegocio.

---

## 1. Identidad Visual y Concepto de Diseño

El concepto estético se basa en la **confianza, modernidad y frescura**. Goiânia es una ciudad de contrastes armónicos: grandes e imponentes rascacielos residenciales (como los de los sectores Marista y Bueno) rodeados de parques frondosos y los icónicos árboles Ipê. 

Por lo tanto, la interfaz huye de los grises planos y adopta una estética premium que transmite solidez corporativa sin perder la calidez y la luz características de la región Centro-Oeste.

---

## 2. Paleta de Colores (Configuración de Tailwind)

Para aplicar estos colores en el proyecto, reemplace o extienda la sección `theme.extend.colors` en el archivo `frontend/tailwind.config.js`:

```javascript
// frontend/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        inmo: {
          // Azul Marista: Representa los rascacielos, la solidez corporativa y jurídica
          brand: '#0A2540',      // Azul Ultra Profundo (Sidebar, Textos Principales)
          primary: '#1E3A8A',    // Azul Real Corporativo (Botones principales, Enlaces)
          light: '#F4F6F9',      // Fondo de la aplicación (Limpio, descansado para la vista)
        },
        goiania: {
          // Verde Buriti: Inspirado en los parques de la ciudad (Flamboyant, Vaca Brava) y el éxito financiero
          green: '#0F5132',      // Verde Esmeralda Oscuro (KPIs positivos, Tasas de ocupación)
          accent: '#198754',     // Verde Activo (Éxito, badges activos)
          
          // Dorado Ipê: Inspirado en la floración de los Ipês amarillos de Goiânia
          ipe: '#FFC107',        // Oro Ipê (Alertas críticas, contratos a 60 días de vencer)
          ipeHover: '#E0A800',
        },
        neutral: {
          dark: '#212529',       // Texto principal (Alta legibilidad)
          muted: '#6C757D',      // Subtítulos y etiquetas secundarias
          border: '#DEE2E6',     // Líneas de tablas y divisiones limpias
        }
      }
    }
  }
}

```

### Tabla de Aplicación Semántica

| Color | Código HEX | Rol en la Interfaz | Significado / Contexto Local |
| --- | --- | --- | --- |
| **Azul Marista** | `#0A2540` | Fondos de navegación principal, Sidebar, títulos de secciones. | Inspirado en el distrito financiero y residencial de alta gama de Goiânia. |
| **Verde Buriti** | `#0F5132` | Valores numéricos positivos, gráficas de ingresos, tasas de ocupación altas. | El verde de la capital ecológica de Brasil; denota crecimiento y salud financiera. |
| **Oro Ipê** | `#FFC107` | Alertas de contratos por vencer (< 60 días), notificaciones de atención, estados pendientes. | El color más icónico de la flora goiana; destaca de forma inmediata sobre el fondo claro. |
| **Gris Neutro** | `#F4F6F9` | Fondo general de todas las vistas del dashboard. | Minimiza la fatiga visual del gestor inmobiliario que opera el sistema durante horas. |

---

## 3. Tipografía y Jerarquía Visual

Para garantizar consistencia y legibilidad estricta en datos numéricos y contratos, se utiliza la fuente **Inter** o **Plus Jakarta Sans** (estilo limpio, geométrico y corporativo).

* **Títulos Principales (`h1`):** `24pt` | Semibold | Color: `inmo.brand`. Usado en las cabeceras de cada vista (ej: "Gestión de Inmuebles").
* **Subtítulos de Sección (`h2`):** `16pt` | Medium | Color: `neutral.dark` con borde izquierdo de `4px` en `goiania.green` para destacar el bloque.
* **Títulos de Tarjetas (`h3` / KPIs):** `12pt` | Regular | Color: `neutral.muted` (en mayúsculas para etiquetas de métricas).
* **Texto de Cuerpo / Datos:** `10.5pt` | Regular | Color: `neutral.dark`.
* **Datos Numéricos Financiados:** `11pt` | Bold | Color: `inmo.brand` o `goiania.green`.

---

## 4. Componentes de Interfaz Estándar (UI Kit Manual)

Bajo la filosofía **KISS**, se evitan efectos de desenfoque pesados o sombras degradadas complejas. Se prioriza el diseño plano con bordes definidos.

### A. Tarjetas de Métricas (KPI Cards)

Estructuras limpias con un sutil borde gris para separar los datos.

* **Estructura HTML/Tailwind sugerida:**
```html
<div class="bg-white border border-neutral-border p-5 rounded-lg shadow-sm">
  <div class="text-xs uppercase font-medium text-neutral-muted tracking-wider">Tasa de Ocupación</div>
  <div class="mt-2 text-3xl font-bold text-goiania-green">94.2 %</div>
</div>

```

### B. Botones Accionables

* **Botón Primario (Guardar, Crear, Confirmar):** Fondo `inmo.primary` con texto blanco. Efecto hover suave a un tono más oscuro.
* **Botón Secundario (Cancelar, Volver):** Fondo transparente, borde `neutral.border`, texto `neutral.muted`.
* **Botón de Alerta Máxima:** Fondo `goiania.ipe`, texto `inmo.brand` (alto contraste).

### C. Tablas de Datos (Inmuebles e Inquilinos)

* **Cabecera de Tabla:** Fondo `inmo.brand`, texto blanco, alineación a la izquierda.
* **Filas:** Fondo blanco puro. Alternancia de filas (*zebra striping*) con fondo `inmo.light` en filas impares opcional.
* **Bordes:** Línea inferior de `1px` en `#DEE2E6` entre filas.

### D. Badges de Estado (Etiquetas)

* **Estado Disponible (Vacante):** Fondo verde claro suave, texto `goiania.accent`.
* **Estado Alquilado:** Fondo azul claro suave, texto `inmo.primary`.
* **Contrato en Alerta:** Fondo amarillo claro suave, texto `#977004` (derivado del Oro Ipê para legibilidad).

---

## 5. Directivas UX y Accesibilidad Financiera

1. **Formateo del Real Brasileño (BRL):** Nunca renderizar un valor financiero como un número plano. Se debe usar el prefijo `R$ ` seguido del espacio reglamentario, separador de miles por punto `.` y decimales por coma `,` (Ej: `R$ 4.500,00`).
2. **Uso Exclusivo del Oro Ipê:** El color amarillo/dorado está estrictamente reservado para la alerta de vencimiento de contratos a 60 días y errores de validación de documentos (CPF/CNPJ). No debe usarse como decoración estética para no diluir su valor de advertencia.
3. **Internacionalización Sin Desajustes de Layout:** Al cambiar entre Portugués, Español e Inglés, las etiquetas de los botones pueden variar en longitud. Los contenedores de los formularios deben prever márgenes amplios (`padding` y `gap` estables en lugar de anchos fijos en píxeles) para evitar el desbordamiento del texto (*overflow*).