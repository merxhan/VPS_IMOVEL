# Product Roadmap — Sistema Integrado de Control Inmobiliario (SICI)

El agente de codificación marcará secuencialmente las tareas completadas modificando el estado a `- [x]` a medida que avance con éxito en el espacio de trabajo.

**Status:** Incomplete (0/23 tareas completas)
**Current Sprint:** Sprint 1: Foundation, Infrastructure & Core Domain

## Filosofía de Construcción (Build Philosophy)

1. **Entregables Operacionales Continuos:** Cada incremento de desarrollo debe asegurar un entorno completamente ejecutable y estable de forma local mediante orquestación en Docker Compose V2.
2. **Estilización Centralizada y Responsiva:** Uso de Tailwind CSS basado estrictamente en la paleta semántica regional (Azul Marista `#0A2540`, Verde Buriti `#0F5132`, Oro Ipê `#FFC107`).
3. **Validación en el Origen:** Las reglas de negocio, validación fiscal (CPF/CNPJ) y restricciones críticas (límite de 5MB en PDFs) deben resolverse estrictamente en la capa de NestJS antes de impactar PostgreSQL.
4. **Foco en el Núcleo del Negocio:** Priorizar el cálculo del flujo de caja, el control de vacancia, mapas de geolocalización por CEP y alertas a 60 días sobre cualquier integración accesoria.
5. **Principio DRY y KISS:** Centralización absoluta de la lógica común. Evitar sobreingeniería, utilizando componentes compartidos y limitando la aplicación a 4 vistas principales exclusivas.

---

## 1. Infraestructura

* [ ] **TASK-001** — Sincronización de Huso Horario Operacional
* **Files:** `backend/src/common/interceptors/timezone.interceptor.ts`, `backend/package.json`
* **Notes:** Configurar la sincronización de tiempo en el entorno de NestJS bajo el huso horario oficial de Brasília (UTC-3) para la correcta captura de marcas temporales de contratos y logs.
* **Verify:** Ejecutar el backend y comprobar mediante logs que las marcas de tiempo emitidas correspondan estrictamente a UTC-3.


* [ ] **TASK-002** — Aislamiento de Entornos Lógicos
* **Files:** `backend/.env.development`, `backend/.env.production`, `frontend/.env.development`, `frontend/.env.production`
* **Notes:** Separación lógica estricta de las variables de entorno para diferenciar la ejecución local y producción.
* **Verify:** Levantar el sistema alternando las variables de entorno y certificar que cada configuración apunte exclusivamente a sus fuentes correspondientes.



---

## 2. Base de Datos (PostgreSQL & TypeORM)

* [ ] **TASK-003** — Migración del Esquema Relacional Base
* **Files:** `backend/src/database/migrations/[timestamp]-CreateCoreTables.ts`
* **Notes:** Ejecutar scripts DDL mediante TypeORM para crear las tablas `Usuario`, `Inmueble` e `Inquilino`. Configurar el campo para el almacenamiento de la ruta física del archivo PDF del contrato.
* **Verify:** Ejecutar la migración CLI y validar mediante un cliente SQL que las estructuras se crearon correctamente usando el patrón Data Mapper.


* [ ] **TASK-004** — Restricciones de Integridad y Relaciones
* **Files:** `backend/src/entities/Usuario.entity.ts`, `backend/src/entities/Inmueble.entity.ts`, `backend/src/entities/Inquilino.entity.ts`
* **Notes:** Configurar en el ORM claves primarias autoincrementables, claves foráneas y restricciones `UNIQUE` sobre los campos de celular (Usuarios) y CPF/CNPJ (Inquilinos).
* **Verify:** Intentar insertar registros duplicados de CPF o número celular y comprobar que el motor aborte por violación de unicidad.


* [ ] **TASK-005** — Optimización e Indexación de Consultas
* **Files:** `backend/src/database/migrations/[timestamp]-AddIndexes.ts`
* **Notes:** Creación de índices específicos sobre campos de búsqueda de alta frecuencia (`cpf`, `cnpj`, y `cep` de Inmuebles) para acelerar consultas y filtrado geoespacial.
* **Verify:** Ejecutar un plan `EXPLAIN ANALYZE` comprobando la utilización de Index Scan sobre los criterios asignados.


* [ ] **TASK-006** — Script de Inicialización y Poblado (Seeding)
* **Files:** `backend/src/database/seeds/initial-seed.ts`
* **Notes:** Mecanismo de seeding automatizado para registrar la cuenta de Administrador inicial y configuraciones base desde variables de entorno.
* **Verify:** Ejecutar el seeding y validar mediante consulta SQL la inserción del usuario maestro sin contraseñas en texto plano.


* [ ] **TASK-007** — Estrategia de Respaldo Local (Backup & Restore)
* **Files:** `compose.yml`
* **Notes:** Configurar tarea programada de volcado (`pg_dump`) sobre el contenedor PostgreSQL y de los volúmenes mapeados de PDFs para mitigar pérdidas catastróficas.
* **Verify:** Forzar la eliminación del contenedor, reconfigurar y aplicar el archivo de restauración para validar la recuperación del 100% de registros y documentos.



---

## 3. UX (Experiencia de Usuario)

* [ ] **TASK-008** — Configuración del CSS Global y Paleta Corporativa
* **Files:** `frontend/src/index.css`, `frontend/tailwind.config.js`
* **Notes:** Extender Tailwind con Azul Marista (`#0A2540`), Verde Buriti (`#0F5132`) y Oro Ipê (`#FFC107`).
* **Verify:** Levantar el servidor Vite y verificar la carga de estilos base y variables CSS.


* [ ] **TASK-009** — Barra de Navegación (Sidebar) y Layout General
* **Files:** `frontend/src/App.vue`, `frontend/src/components/layout/Sidebar.vue`
* **Notes:** Componente Sidebar fijo a la izquierda usando Azul Marista. Implementar botones reactivos exclusivamente para las 4 vistas requeridas: Dashboard, Inmuebles, Inquilinos, Configuraciones.
* **Verify:** Comprobar la navegación fluida entre las 4 pantallas y la adaptabilidad móvil (menú hamburguesa) usando Vue Router.


* [ ] **TASK-010** — Diseño de Modales Reactivos
* **Files:** `frontend/src/components/shared/BaseModal.vue`, `frontend/src/components/shared/ConfirmDeleteModal.vue`
* **Notes:** Maquetación de modales de creación/edición sobrepuestos y el modal secundario obligatorio de confirmación para bajas de registros.
* **Verify:** Accionar operaciones de eliminación, corroborando la apertura limpia del modal bloqueando el fondo operativo.


* [ ] **TASK-011** — Sistema de Alertas y Toasts Semánticos
* **Files:** `frontend/src/components/shared/ToastNotification.vue`
* **Notes:** Configurar animaciones de notificaciones emergentes: verde para éxito, rojo para errores, y Oro Ipê exclusivo para alertas de vencimientos de contratos.
* **Verify:** Provocar un fallo local simulado y verificar el despliegue correcto de la alerta semántica.



---

## 4. Desarrollo (NestJS & Vue 3)

* [ ] **TASK-012** — Configuración de Arquitectura Base
* **Files:** `backend/src/app.module.ts`, `frontend/src/main.ts`
* **Notes:** Establecer estructura modular en NestJS (Controladores/Servicios/Entidades) y Vue 3 (Composition API).
* **Verify:** Compilar ambos proyectos sin dependencias circulares ni errores TypeScript.


* [ ] **TASK-013** — Autenticación Inequívoca y Emisión JWT
* **Files:** `backend/src/modules/auth/auth.controller.ts`, `backend/src/modules/auth/jwt.strategy.ts`
* **Notes:** Flujo de acceso validando el número de celular como ID. Retorno de token JWT para acceso a rutas privadas mediante Guards de NestJS.
* **Verify:** Rechazo HTTP 401 a credenciales erróneas y respuesta 200 OK en rutas protegidas usando token válido.


* [ ] **TASK-014** — Desarrollo API REST Core y Middleware PDF
* **Files:** `backend/src/modules/inmuebles/inmuebles.controller.ts`, `backend/src/modules/inquilinos/inquilinos.controller.ts`
* **Notes:** Construcción de endpoints CRUD. Integrar `FileInterceptor` en inmuebles para rechazar archivos distintos a `application/pdf` y mayores a 5MB. Implementar algoritmos de validación fiscal nativa CPF/CNPJ.
* **Verify:** Intentar registrar un Inquilino con CPF inválido o subir un archivo de 6MB, confirmando el rechazo preventivo del backend.


* [ ] **TASK-015** — Implementación de las 4 Vistas Core (Vue 3)
* **Files:** `frontend/src/views/Dashboard.vue`, `frontend/src/views/Inmuebles.vue`, `frontend/src/views/Inquilinos.vue`, `frontend/src/views/Configuraciones.vue`
* **Notes:** - **Dashboard:** Tarjetas financieras, listado de alertas de 60 días y renderizado del mapa georreferenciado basado en el CEP.
* **Inmuebles & Inquilinos:** Tablas de gestión con botones CRUD.
* **Configuraciones:** Control exclusivo de Idioma y Gestión de Usuarios.


* **Verify:** Navegar las vistas confirmando la renderización de los componentes sin errores de consola.


* [ ] **TASK-016** — Lógica de Negocio y Reglas Operacionales
* **Files:** `backend/src/modules/inmuebles/inmuebles.service.ts`, `backend/src/modules/dashboard/dashboard.service.ts`
* **Notes:** Soporte para registro de contratos con fechas pasadas (retroactivas). Formato monetario obligatorio en Reales Brasileños (`R$`) con 2 decimales. Motor matemático para Tasa de Ocupación e ingresos.
* **Verify:** Registrar un contrato en fecha pasada y verificar que el dashboard actualice el flujo de caja correctamente sin bloquear la operación.


* [ ] **TASK-017** — Autodocumentación de la API (Swagger)
* **Files:** `backend/src/main.ts`
* **Notes:** Exponer OpenAPI de NestJS para contratos técnicos de controladores y DTOs.
* **Verify:** Acceder a la ruta `/api` o `/docs` en desarrollo validando la UI interactiva.


* [ ] **TASK-018** — Estado Global e Internacionalización (Pinia & i18n)
* **Files:** `frontend/src/store/ui.store.ts`, `frontend/src/locales/*.json`
* **Notes:** Uso de Pinia para conmutar de forma instantánea la interfaz entre PT, ES, y EN desde la vista de Configuraciones sin recargar el navegador.
* **Verify:** Cambiar el idioma en Configuraciones y corroborar la mutación inmediata de las tablas y el Sidebar.



---

## 5. QA (Aseguramiento de Calidad)

* [ ] **TASK-019** — Pruebas Unitarias de Backend (Rutas Críticas)
* **Files:** `backend/src/modules/dashboard/dashboard.service.spec.ts`, `backend/src/common/validators/fiscal.validator.spec.ts`
* **Notes:** Test unitarios con Jest para asegurar fórmulas financieras, validadores CPF/CNPJ y rechazo correcto de límites de archivos PDF.
* **Verify:** Pase en verde (100% success) ejecutando `npm run test` en el directorio de NestJS.


* [ ] **TASK-020** — Pruebas Unitarias de Frontend (Componentes Reactivos)
* **Files:** `frontend/src/components/shared/BaseModal.spec.ts`, `frontend/src/store/ui.store.spec.ts`
* **Notes:** Configurar Vitest para certificar visibilidad de modales, mutación correcta del idioma i18n y emisión de eventos.
* **Verify:** Pase en verde ejecutando `npm run test:unit` en el directorio de Vue.



---

## 6. CI/CD & Orquestación

* [ ] **TASK-021** — Dockerización de Servicios
* **Files:** `backend/Dockerfile`, `frontend/Dockerfile`
* **Notes:** Construcción multi-stage de imágenes independientes y optimizadas para NestJS y Vue/Nginx.
* **Verify:** Validar la compilación aislada sin archivos fuente residuales.


* [ ] **TASK-022** — Orquestación Centralizada con Docker Compose V2
* **Files:** `compose.yml`
* **Notes:** Definición estricta y única de servicios (Frontend, Backend, PostgreSQL). Creación de redes internas y volúmenes permanentes para la base de datos y la carpeta de custodia PDF.
* **Verify:** Ejecutar `docker compose up -d --build` y asegurar la comunicación exitosa entre los contenedores.


* [ ] **TASK-023** — Flujo de Validación Estática (Linters)
* **Files:** `backend/package.json`, `frontend/package.json`
* **Notes:** Ejecución automatizada de ESLint y Prettier. Abortar despliegues si existen errores TypeScript o de formateo.
* **Verify:** Inducir un error de sintaxis y confirmar la interrupción del flujo local de pre-commit o compilación.