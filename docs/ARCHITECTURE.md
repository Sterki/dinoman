# Arquitectura del proyecto

## Estructura del repositorio

```
diabetes/
├── frontend/                    ← SPA React + Vite + TypeScript
│   ├── Dockerfile               ← multi-stage: dev / build / prod
│   ├── public/
│   └── src/
│       ├── assets/              ← imágenes, fuentes, iconos estáticos
│       ├── components/          ← componentes UI reutilizables (Button, Modal…)
│       ├── features/            ← módulos por funcionalidad de negocio
│       │   └── glucose/
│       │       ├── components/
│       │       ├── hooks/
│       │       ├── api/
│       │       └── types/
│       ├── hooks/               ← hooks globales (useDebounce, useLocalStorage…)
│       ├── lib/                 ← cliente HTTP, formateadores, utilidades
│       ├── pages/               ← componentes de nivel de ruta
│       ├── router/              ← configuración de React Router
│       ├── store/               ← estado global UI (Zustand)
│       ├── styles/              ← CSS global y configuración de Tailwind
│       └── types/               ← tipos TypeScript compartidos entre features
│
├── backend/                     ← API REST Symfony 7 + PHP 8.4
│   ├── Dockerfile               ← multi-stage: dev / prod
│   ├── bin/console
│   ├── config/
│   │   ├── packages/            ← configuración de bundles Symfony
│   │   └── routes/
│   ├── migrations/              ← migraciones de Doctrine
│   ├── public/index.php
│   ├── src/
│   │   ├── Controller/          ← capa HTTP: recibe request, devuelve response
│   │   ├── Application/         ← casos de uso (Commands y Queries)
│   │   │   ├── Command/
│   │   │   └── Query/
│   │   ├── Domain/              ← lógica de negocio pura (sin Symfony, sin Doctrine)
│   │   │   ├── Entity/
│   │   │   ├── ValueObject/
│   │   │   ├── Repository/      ← interfaces (contratos)
│   │   │   └── Exception/
│   │   ├── Infrastructure/      ← implementaciones concretas
│   │   │   ├── Persistence/     ← repositorios Doctrine
│   │   │   └── Http/            ← clientes HTTP externos
│   │   └── Shared/              ← utilidades transversales
│   │       ├── Bus/
│   │       └── Exception/
│   ├── tests/
│   │   ├── Unit/                ← Domain + Application (sin BD, sin servidor)
│   │   ├── Integration/         ← Infrastructure (con BD real)
│   │   └── Functional/          ← endpoints HTTP completos
│   └── var/                     ← caché y logs (gitignored)
│
├── docker/
│   └── nginx/
│       ├── nginx.dev.conf       ← proxy dev: /api → php-fpm, /* → Vite HMR
│       └── nginx.prod.conf      ← producción: HTTPS, SPA fallback, cache headers
│
├── .github/
│   └── workflows/
│       ├── ci.yml               ← lint + tests + docker build en cada PR
│       ├── deploy-staging.yml   ← deploy automático al mergear a develop
│       └── deploy-prod.yml      ← deploy con aprobación al mergear a main
│
├── docs/
│   ├── ARCHITECTURE.md          ← este archivo
│   ├── vps-staging-docker-compose.yml   ← template para /opt/diabetes/staging/
│   ├── vps-production-docker-compose.yml← template para /opt/diabetes/production/
│   └── vps-env-example.env      ← ejemplo de .env del VPS
│
├── docker-compose.yml           ← desarrollo local únicamente
├── .env                         ← valores por defecto (sin secretos, commiteable)
├── .gitignore
├── .editorconfig
└── README.md
```

---

## Estructura del VPS

El servidor tiene una separación clara entre el código y los environments:

```
/opt/diabetes/
├── repo/                        ← git clone del repositorio
│   └── (todo el contenido del repo: Dockerfiles, código fuente, nginx confs…)
│
├── staging/
│   ├── .env                     ← secretos de staging (NUNCA en git)
│   └── docker-compose.yml       ← define los servicios para staging
│
└── production/
    ├── .env                     ← secretos de producción (NUNCA en git)
    └── docker-compose.yml       ← define los servicios para producción
```

Los `docker-compose.yml` del VPS referencian los Dockerfiles que están en `repo/`:

```yaml
# /opt/diabetes/staging/docker-compose.yml
services:
  backend:
    build:
      context: /opt/diabetes/repo/backend   ← usa el Dockerfile del repo
      target: prod
```

Así el código viaja a través de `git pull` en `repo/`, y los compose files del VPS
son estables — solo cambian cuando quieres modificar la infraestructura, no en cada deploy.

---

## Flujo de trabajo

### Desarrollo diario

```
Desarrollador
    ↓
git checkout -b feature/nueva-funcionalidad
... código ...
git push → PR a develop
    ↓
GitHub Actions ejecuta ci.yml:
  - lint + typecheck (frontend)
  - phpstan + phpunit (backend)
  - docker build (valida que las imágenes compilan)
    ↓
PR aprobado → merge a develop
```

### Deploy a staging (automático)

```
merge a develop
    ↓
deploy-staging.yml
    ↓ SSH al VPS
cd /opt/diabetes/repo && git pull origin develop
cd /opt/diabetes/staging
docker compose up -d --build
docker compose exec backend php bin/console doctrine:migrations:migrate
curl /api/health  ← health check final
```

### Deploy a producción (con aprobación manual)

```
PR develop → main
    ↓
ci.yml pasa
    ↓
merge a main
    ↓
deploy-prod.yml
    ↓ PAUSA — espera aprobación de un revisor en GitHub
    ↓ Aprobado
cd /opt/diabetes/repo && git pull origin main
cd /opt/diabetes/production
docker compose up -d --build
docker compose exec backend php bin/console doctrine:migrations:migrate
curl /api/health
```

---

## Cómo fluye una petición HTTP

### En desarrollo

```
Browser
  → http://localhost          (Nginx puerto 80)
       ├── /api/*  → FastCGI → backend:9000 (PHP-FPM) → PostgreSQL
       └── /*      → proxy   → frontend:5173 (Vite HMR con WebSocket)
```

### En producción

```
Browser
  → https://tudominio.com     (Nginx puerto 443, TLS)
       ├── /api/*  → FastCGI → backend:9000 (PHP-FPM) → PostgreSQL
       └── /*      → archivos estáticos compilados por Vite (/dist)
```

---

## Arquitectura del backend (capas)

```
Request HTTP
     ↓
Controller          ← recibe HTTP, valida input, delega
     ↓
Application         ← caso de uso, orquesta (sin Symfony, sin Doctrine)
     ↓
Domain              ← lógica de negocio pura, entidades, interfaces
     ↑
Infrastructure      ← implementa las interfaces: Doctrine, APIs externas
```

**Regla:** las dependencias solo apuntan hacia adentro. `Domain` nunca importa Symfony ni Doctrine.

---

## Secretos y variables de entorno

| Dónde | Qué contiene | ¿Se commitea? |
|---|---|---|
| `.env` (repo raíz) | Nombres de variables + valores dev seguros | Sí |
| `.env.local` (máquina dev) | Override local del desarrollador | No (.gitignore) |
| `/opt/diabetes/staging/.env` (VPS) | Secretos reales de staging | No (solo en VPS) |
| `/opt/diabetes/production/.env` (VPS) | Secretos reales de producción | No (solo en VPS) |
| GitHub Secrets | Valores inyectados en CI para escribir los .env del VPS | No |

---

## Branches

```
main        ── producción ── protegido ── requiere PR + CI verde + aprobación
develop     ── staging    ── protegido ── requiere PR + CI verde
feature/*   ── desde develop, merged via PR
fix/*       ── desde develop, merged via PR
hotfix/*    ── desde main, merged a main + develop
```
