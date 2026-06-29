#!/bin/bash

COMPOSE_FILE="project/compose.yml"
ENV_FILE="project/backend/.env"
DOCKER_COMPOSE="docker compose --env-file $ENV_FILE -f $COMPOSE_FILE"
DATA_SOURCE="src/config/data-source.ts"

# Wrapper para delegar la ejecución al contenedor
exec_in_backend() {
    $DOCKER_COMPOSE exec backend "$@"
}

# --- SUBMENU DOCKER COMPOSE ---
docker_menu() {
    while true; do
        clear
        echo "============================================================"
        echo "                      Docker Manager                        "
        echo "============================================================"
        echo ""
        echo "1)  Construir y publicar (docker build & up)"
        echo "2)  Subir contenedores (docker up)"
        echo "3)  Bajar contenedores (docker down)"
        echo "4)  Reiniciar contenedores (docker restart)"
        echo "5)  Refrescar contenedores (force-recreate)"
        echo "6)  Ver logs (docker logs -f)"
        echo "7)  Estado de contenedores (docker ps & stats)"
        echo "8)  Acceder al contenedor (shell)"
        echo "9)  Limpiar imágenes y caché (prune absoluto)"
        echo "------------------------------------------------------------"
        echo "0)  Volver al Menú Principal"
        echo ""
        
        read -p "Elige una opción: " choice
        echo ""
        case $choice in
            1) $DOCKER_COMPOSE up -d --build ;;
            2) $DOCKER_COMPOSE up -d ;;
            3) $DOCKER_COMPOSE down ;;
            4) $DOCKER_COMPOSE restart ;;
            5) $DOCKER_COMPOSE up -d --force-recreate ;;
            6) $DOCKER_COMPOSE logs -f ;;
            7) 
                echo "--- Estado de contenedores (docker ps) ---"
                $DOCKER_COMPOSE ps
                echo ""
                echo "--- Consumo de recursos (docker stats) ---"
                docker stats --no-stream
                ;;
            8)
                echo "Contenedores disponibles:"
                $DOCKER_COMPOSE ps --services
                read -p "Ingresa el nombre del servicio al que deseas acceder: " service_name
                $DOCKER_COMPOSE exec "$service_name" sh
                ;;
            9) 
                echo "--- Deteniendo y eliminando infraestructura del proyecto ---"
                $DOCKER_COMPOSE down --volumes --rmi all
                echo ""
                echo "--- Eliminando caché de construcción (BuildKit) ---"
                docker builder prune -a -f
                echo ""
                echo "--- Ejecutando limpieza profunda del sistema ---"
                docker system prune -a --volumes -f
                ;;
            0) break ;;
            *) echo "Opción inválida..." ;;
        esac
        echo ""
        read -p "Presiona [ENTER] para continuar..."
    done
}

# --- SUBMENU BASE DE DATOS ---
db_menu() {
    while true; do
        clear
        echo "============================================================"
        echo "                    Database Manager                        "
        echo "============================================================"
        echo ""
        echo "1)  Ejecutar migraciones pendientes (migration:run)"
        echo "2)  Generar nueva migración (migration:generate)"
        echo "3)  Revertir última migración (migration:revert)"
        echo "4)  Poblar base de datos (seeding - seed.ts)"
        echo "5)  Mostrar estado de las migraciones (migration:show)"
        echo "6)  Crear migración manual vacía (migration:create)"
        echo "------------------------------------------------------------"
        echo "0)  Volver al Menú Principal"
        echo ""
        
        read -p "Elige una opción: " choice
        echo ""
        case $choice in
            1) 
                echo "--- Ejecutando migraciones pendientes ---"
                exec_in_backend npx typeorm-ts-node-commonjs migration:run -d "$DATA_SOURCE"
                ;;
            2) 
                read -p "Ingresa el nombre descriptivo para la migración (ej. AddUserRole): " mig_name
                if [ -z "$mig_name" ]; then
                    echo "Error: El nombre de la migración no puede estar vacío."
                else
                    echo "--- Generando nueva migración ---"
                    exec_in_backend npx typeorm-ts-node-commonjs migration:generate "src/migrations/$mig_name" -d "$DATA_SOURCE"
                fi
                ;;
            3) 
                echo "--- Revirtiendo última migración ---"
                exec_in_backend npx typeorm-ts-node-commonjs migration:revert -d "$DATA_SOURCE"
                ;;
            4) 
                echo "--- Poblando base de datos con datos de prueba (Seed) ---"
                exec_in_backend npx ts-node src/database/seed.ts
                ;;
            5) 
                echo "--- Estado de migraciones (Show) ---"
                exec_in_backend npx typeorm-ts-node-commonjs migration:show -d "$DATA_SOURCE"
                ;;
            6) 
                read -p "Ingresa el nombre descriptivo para la migración vacía: " mig_name
                if [ -z "$mig_name" ]; then
                    echo "Error: El nombre de la migración no puede estar vacío."
                else
                    echo "--- Creando migración vacía ---"
                    exec_in_backend npx typeorm-ts-node-commonjs migration:create "src/migrations/$mig_name"
                fi
                ;;
            0) break ;;
            *) echo "Opción inválida..." ;;
        esac
        echo ""
        read -p "Presiona [ENTER] para continuar..."
    done
}

# --- MENU PRINCIPAL ---
while true; do
    clear
    echo "============================================================"
    echo "                      System Manager                        "
    echo "============================================================"
    echo ""
    echo "Selecciona un área de gestión:"
    echo ""
    echo "1)  Gestión de Contenedores (Docker Compose)"
    echo "2)  Gestión de Base de Datos (Migrations & Seed)"
    echo "------------------------------------------------------------"
    echo "0)  Salir"
    echo ""
    
    read -p "Elige una opción: " main_choice
    echo ""
    case $main_choice in
        1) docker_menu ;;
        2) db_menu ;;
        0) clear; exit 0 ;;
        *) 
            echo "Opción inválida..." 
            echo ""
            read -p "Presiona [ENTER] para continuar..."
            ;;
    esac
done