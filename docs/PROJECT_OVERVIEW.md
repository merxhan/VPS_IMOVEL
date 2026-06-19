Project Overview — Sistema Integrado de Control Inmobiliario (SICI)

1. Propósito del Sistema
Plataforma administrativa para la gestión de activos inmobiliarios y contratos de arrendamiento localizada en Goiânia-GO, Brasil. Resuelve el control operativo y financiero de propiedades consolidando el estado de vacancia, validación fiscal de inquilinos, cálculo de flujo de caja y custodia documental segura.


2. Estructura Funcional y CRUDs Core

* **Panel de Control Financiero (Dashboard):** Interfaz gerencial que consolida tarjetas de métricas financieras, gráficos de rendimiento y un listado dinámico de alertas de vencimiento contractual a 60 días. Muestra un mapa interactivo georreferenciado basado en el CEP de los inmuebles para proporcionar una visión general de la distribución de los activos en el terreno.


* **Gestión de Inmuebles (CRUD):** Catálogo interactivo para registro, edición y baja de propiedades, capturando ficha técnica, dirección, valor de arriendo y estado operacional. Incluye una interfaz de carga documental restrictiva por formato y peso. Permite el registro de contratos de arrendamiento estableciendo fechas de inicio anteriores a la fecha actual.


* **Gestión de Inquilinos (CRUD):** Módulo de registro de arrendatarios que captura nombre, correo electrónico, teléfono y documento de identidad fiscal. Bloquea de forma reactiva el almacenamiento y alerta en la interfaz ante datos inválidos.


* **Configuraciones:** Módulo administrativo restringido exclusivamente a dos operaciones: el control del idioma de la interfaz (conmutación instantánea entre Portugués, Español e Inglés sin recarga de página) y la gestión de usuarios con acceso a la plataforma.



3. Reglas de Negocio y Operación Local

* **Validación Fiscal Brasileña:** Verificación estructural obligatoria de los dígitos verificadores para documentos locales CPF y CNPJ antes de autorizar el almacenamiento.


* **Formato Monetario Regional:** Expresión obligatoria de flujos económicos en Reales Brasileños (R$) con redondeo estricto a dos decimales fijos.


* **Localización Temporal y Zona Horaria:** Sincronización de operaciones, contratos y cómputos de alertas bajo el huso horario de Brasília (UTC-3).


* **Flexibilidad y Retroactividad de Contratos:** Autorización operativa para registrar contratos de arrendamiento con fechas de vigencia retroactivas (fechas pasadas), permitiendo regularizar propiedades previamente ocupadas sin alterar el cómputo financiero actual.
* **Georreferenciación Obligatoria:** Exigencia de captura del Código de Endereçamento Postal (CEP) válido para ubicar la propiedad en el mapa gerencial.
* **Indicadores Financieros en Tiempo Real:** Cálculo matemático de la tasa de ocupación (inmuebles ocupados sobre inmuebles totales) y consolidación del flujo de caja y proyecciones de ingresos.


* **Filtro de Alertas Tempranas:** Algoritmo temporal que identifica de forma automática y resalta visualmente los contratos de arrendamiento que expiren en un plazo igual o inferior a 60 días.


* **Custodia Documental Restrictiva:** Límite estricto e inquebrantable para la carga de contratos de arrendamiento, permitiendo únicamente el formato PDF con un tamaño máximo de 5MB para proteger la infraestructura física.