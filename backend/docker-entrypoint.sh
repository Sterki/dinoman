#!/bin/sh
set -e

# Sincroniza dependencias. Update regenera el lock file si composer.json fue modificado.
echo "→ Sincronizando dependencias de Composer..."
composer update --no-interaction --prefer-dist --no-scripts
echo "→ Dependencias sincronizadas."

# Limpia la caché de Symfony (puede tener archivos viejos con permisos de root).
echo "→ Limpiando caché..."
rm -rf /app/var/cache/*

# Crea directorios necesarios y da permisos totales al proceso PHP-FPM (www-data).
mkdir -p /app/var/cache /app/var/log /app/var/sessions
chmod -R 777 /app/var

# Precalienta la caché ya con los permisos correctos.
echo "→ Precalentando caché de Symfony..."
php bin/console cache:warmup --no-interaction 2>/dev/null || true
chmod -R 777 /app/var

# Ejecuta migraciones pendientes.
echo "→ Ejecutando migraciones..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration || true

exec "$@"
