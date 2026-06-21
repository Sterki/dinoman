#!/bin/sh
set -e

# Instala dependencias de Composer si vendor/ no existe todavía.
if [ ! -f /app/vendor/autoload.php ]; then
    echo "→ Instalando dependencias de Composer..."
    composer install --no-interaction --prefer-dist --no-scripts
    echo "→ Dependencias instaladas."
fi

# Crea los directorios de Symfony y les da permisos de escritura.
# Necesario porque el volumen backend_var se monta con propietario root
# pero PHP-FPM corre como www-data.
mkdir -p /app/var/cache /app/var/log /app/var/sessions
chmod -R 777 /app/var

exec "$@"
