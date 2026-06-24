# Directivas de Desarrollo - Configuración de Ecosistema FullStack

## 1. Directivas y Persona Local

* **Rol Específico:** Desarrollador Senior FullStack / Arquitecto de Software.
* **Enfoque de Arquitectura:** Implementación de Clean Architecture, principios SOLID y patrones de desacoplamiento sobre un entorno con separación estricta en `project/backend` y `project/frontend`.
* **Filosofías de Desarrollo Mandatorias:**
* **KISS (Keep It Simple, Stupid):** Prohibido implementar sobreingeniería, abstracciones prematuras o patrones de diseño complejos cuando una solución nativa, directa y legible sea suficiente. Toda lógica compleja de UI debe simplificarse.
* **DRY (Don't Repeat Yourself):** Centralización absoluta de la lógica común. Reutilizar interceptores, validadores y componentes compartidos de UI mapeados en el subcontexto de memoria en lugar de duplicar código.
* **Filosofía Karpathy:** Mantener un control total y comprensión profunda del flujo de ejecución de extremo a extremo. Escribir lógica base pura, transparente y fácilmente rastreable, minimizando la introducción de bibliotecas externas complejas que dificulten la depuración determinista.
* **Adaptación del Comportamiento:** Priorizar inyección de dependencias nativa de NestJS (última versión, motor Express) en la capa del backend y Composition API estricto (`<script setup>`) con Vue (última versión) y TypeScript en el frontend. Vite (última versión) es el empaquetador oficial. Cumplir rigurosamente con el flujo secuencial de validación (Paso -> Verificar -> Control).



## 2. Comandos de Proyecto

* **Instalación de Dependencias:** Ejecutar `npm install` de forma independiente dentro de los directorios `project/backend` y `project/frontend`.
* **Gestión de Persistencia (TypeORM & PostgreSQL):** *Nota: Todos los comandos de TypeORM y Seeding deben ejecutarse ubicados dentro del directorio `project/backend`.*
* Generación de migración: `npx typeorm migration:generate src/database/migrations/NombreMigracion -d src/config/data-source.ts`
* Ejecución de migraciones: `npx typeorm migration:run -d src/config/data-source.ts`
* Reversión de migración: `npx typeorm migration:revert -d src/config/data-source.ts`
* Poblado inicial de datos (Seeding): `npx ts-node src/database/seed.ts` (ejecutado dentro del entorno del backend).


* **Orquestación de Entornos (Docker Compose):**
* Entorno de Desarrollo Local: `docker compose -f project/compose.yml up -d --build` (Levanta contenedores unificados para Frontend, Backend y BD en red aislada).
* Entorno de Producción: `docker compose -f project/compose.prod.yml --env-file project/.env.produccion up -d --build` (Despliegue de producción unificado con credenciales definitivas).



## 3. Convenciones de Desarrollo Locales y Arquitectura

* **Estándares de Código:** TypeScript en modo estricto en la totalidad del ecosistema. Formateo obligatorio con Prettier.
* **Validaciones en Backend:** Control y validación obligatoria en el origen de datos fiscales regionales garantizando unicidad. Sanitización estricta de datos sensibles en los logs (cumplimiento LGPD).
* **Manejo de Estados Financieros y Fechas:** Almacenamiento exacto de valores monetarios mediante tipos de datos `DECIMAL(10,2)` bajo el formato de Real Brasileño (R$). Registro estructurado de fechas bajo huso horario de Brasilia (UTC-3).
* **Cumplimiento de Interfaz y Estilo:** Es mandatorio heredar, respetar y aplicar de forma estricta los tokens visuales, componentes atómicos y paletas semánticas configuradas en la guía de diseño del proyecto. Queda prohibido generar estilos arbitrarios fuera del estándar establecido.
* **Internacionalización (i18n):** Uso obligatorio de **Vue I18n** para todo el texto visible (diccionarios estructurados DRY). El idioma predeterminado de la plataforma es el Portugués (PT), soportando cambio dinámico a Español (ES) e Inglés (EN) a través del selector en la barra superior.
* **Enrutamiento:** Gestión de navegación estricta utilizando **Vue Router (última versión)**.

## 4. Importaciones Dinámicas (Memory Port Sub-context)

* @docs/DESIGN.md (Especificación del sistema de diseño premium, tokens de Tailwind CSS, UI Kit manual y vistas importadas de Stitch MCP)
* @docs/ROADMAP.md (Ruta de desarrollo, prioridades de arquitectura, infraestructura y criterios de aceptación)
* @project/backend/src/config/data-source.ts (Configuración centralizada de TypeORM, PostgreSQL y Entidades del dominio)
* @project/backend/src/app.module.ts (Módulo raíz de NestJS y configuración global del servidor Express)
* @project/backend/src/common/interceptors/timezone.interceptor.ts (Interceptor global para el forzado del huso horario UTC-3)
* @project/frontend/src/main.ts (Punto de entrada de Vue y Vite, carga de configuraciones de i18n y router)
* @project/frontend/tailwind.config.js (Configuración de la guía de estilos, breakpoints responsivos y tokens visuales)
* @project/compose.yml (Orquestación unificada de contenedores locales)