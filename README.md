# Diabetes App

React + Symfony 7 + PostgreSQL — contenerizado con Docker.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| Backend | Symfony 7, PHP 8.4 |
| Base de datos | PostgreSQL 16 |
| Proxy | Nginx |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## Estructura del repositorio

```
diabetes/
├── frontend/           ← React + Vite + TypeScript
│   ├── Dockerfile
│   └── src/
├── backend/            ← Symfony 7 API
│   ├── Dockerfile
│   └── src/
├── docker/
│   └── nginx/
│       ├── nginx.dev.conf
│       └── nginx.prod.conf
├── .github/
│   └── workflows/      ← CI/CD pipelines
├── docs/               ← Arquitectura, templates VPS, ADRs
├── docker-compose.yml  ← Desarrollo local
├── .env                ← Variables por defecto (no secretos)
└── README.md
```

---

## Desarrollo local

### Requisitos

- Docker Engine 26+
- Docker Compose plugin 2.27+
- Git

> No necesitas PHP ni Node instalados en tu máquina. Todo corre dentro de Docker.

### Primeros pasos

```bash
# 1. Clonar
git clone git@github.com:tu-org/diabetes.git
cd diabetes

# 2. Arrancar
docker compose up --build
```

Servicios disponibles:

| Servicio | URL |
|---|---|
| App (frontend + API) | http://localhost |
| Frontend HMR directo | http://localhost:5173 |
| PostgreSQL | localhost:5432 |

### Migrar la base de datos

```bash
docker compose exec backend php bin/console doctrine:migrations:migrate
```

---

## Comandos útiles

```bash
# Ver logs de un servicio
docker compose logs -f backend

# Abrir shell en el backend
docker compose exec backend bash

# Abrir shell en el frontend
docker compose exec frontend sh

# Limpiar caché de Symfony
docker compose exec backend php bin/console cache:clear

# Listar rutas del API
docker compose exec backend php bin/console debug:router
```

## Tests

```bash
# Frontend
docker compose exec frontend npm run test
docker compose exec frontend npm run typecheck

# Backend
docker compose exec backend vendor/bin/phpunit
docker compose exec backend vendor/bin/phpstan analyse
docker compose exec backend vendor/bin/php-cs-fixer check
```

---

## Branches y deploys

```
feature/* ──► develop ──► [staging automático]
                  ↓ PR
               main ──► [production con aprobación manual]
```

Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para la guía completa.
# dinoman
# dinoman
