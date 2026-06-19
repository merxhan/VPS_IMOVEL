#!/bin/bash

COMPOSE_FILE="project/compose.yml"

show_menu() {
    clear
    echo "============================================================"
    echo "                      Docker Manager                        "
    echo "============================================================"
    echo ""
    echo "Selecciona una opción:"
    echo ""
    echo "1)  Construir y publicar (docker build & up)"
    echo "2)  Subir contenedores (docker up)"
    echo "3)  Bajar contenedores (docker down)"
    echo "4)  Reiniciar contenedores (docker restart)"
    echo "5)  Refrescar contenedores (force-recreate)"
    echo "6)  Ver logs (docker logs -f)"
    echo "7)  Estado de contenedores (docker ps & stats)"
    echo "8)  Acceder al contenedor (shell)"
    echo "9)  Limpiar imágenes y caché (prune)"
    echo "------------------------------------------------------------"
    echo "0)  Salir"
    echo ""
}

read_options() {
    local choice
    read -p "Elige una opción: " choice
    echo ""
    case $choice in
        1) docker compose -f $COMPOSE_FILE up -d --build ;;
        2) docker compose -f $COMPOSE_FILE up -d ;;
        3) docker compose -f $COMPOSE_FILE down ;;
        4) docker compose -f $COMPOSE_FILE restart ;;
        5) docker compose -f $COMPOSE_FILE up -d --force-recreate ;;
        6) docker compose -f $COMPOSE_FILE logs -f ;;
        7) 
            echo "--- Estado de contenedores (docker ps) ---"
            docker compose -f $COMPOSE_FILE ps
            echo ""
            echo "--- Consumo de recursos (docker stats) ---"
            docker stats --no-stream
            ;;
        8)
            echo "Contenedores disponibles:"
            docker compose -f $COMPOSE_FILE ps --services
            read -p "Ingresa el nombre del servicio al que deseas acceder: " service_name
            docker compose -f $COMPOSE_FILE exec $service_name sh
            ;;
        9) docker system prune -a --volumes -f ;;
        0) exit 0 ;;
        *) echo "Opción inválida..." ;;
    esac
}

while true
do
    show_menu
    read_options
    echo ""
    read -p "Presiona [ENTER] para continuar..."
done
