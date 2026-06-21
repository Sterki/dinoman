# ── Stage: base ──────────────────────────────────────────────────────────────
FROM php:8.4-fpm-alpine AS base

# Dependencias del sistema necesarias para las extensiones PHP
RUN apk add --no-cache \
    libpq-dev \
    icu-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    autoconf \
    g++ \
    make

# Extensiones PHP
RUN docker-php-ext-install \
    pdo_pgsql \
    intl \
    opcache \
    zip

# APCu (caché en memoria)
RUN pecl channel-update pecl.php.net && pecl install apcu && docker-php-ext-enable apcu

# Pasar variables de entorno del contenedor a los scripts PHP
RUN echo "clear_env = no" >> /usr/local/etc/php-fpm.d/www.conf

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# ── Stage: dev ───────────────────────────────────────────────────────────────
FROM base AS dev

# linux-headers es requerido por Xdebug para compilar en Alpine
RUN apk add --no-cache linux-headers

# Xdebug solo en desarrollo
RUN pecl channel-update pecl.php.net && pecl install xdebug && docker-php-ext-enable xdebug
RUN printf "xdebug.mode=debug\nxdebug.start_with_request=yes\nxdebug.client_port=9003\nxdebug.log_level=0\n" \
    > /usr/local/etc/php/conf.d/xdebug.ini

# Script de inicio: instala Composer deps si no existen, luego arranca php-fpm
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]

# ── Stage: prod ──────────────────────────────────────────────────────────────
FROM base AS prod

# OPcache optimizado para producción
RUN printf "opcache.enable=1\nopcache.memory_consumption=256\nopcache.max_accelerated_files=20000\nopcache.validate_timestamps=0\n" \
    > /usr/local/etc/php/conf.d/opcache-prod.ini

# Copiar código fuente
COPY . .

# Instalar solo dependencias de producción
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

RUN chmod +x bin/console

EXPOSE 9000
CMD ["php-fpm"]
