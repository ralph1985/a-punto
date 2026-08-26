# A Punto

Agenda privada de mantenimiento para vehículos. Prioriza lo que vence por fecha o kilómetros, permite registrar intervenciones y conserva el historial, costes y enlaces documentales.

## Arquitectura

- Next.js, TypeScript y App Router.
- Prisma 7 con PostgreSQL gestionado por Prisma Postgres en Vercel.
- Acceso de una sola cuenta mediante código secreto hasheado y cookie de sesión firmada.
- PWA instalable sin caché de datos privados ni modo offline.

## Configuración local

```bash
cp .env.example .env.local
pnpm auth:hash -- "tu-codigo-secreto"
pnpm db:migrate --name init
pnpm import:legacy -- --write
pnpm dev
```

Configura el resultado de `auth:hash` como `APP_ACCESS_CODE_HASH` y crea un valor aleatorio largo para `SESSION_SECRET`. La integración de Vercel proporciona `DATABASE_URL` automáticamente al enlazar el proyecto.

## Datos iniciales

La importación usa en modo lectura `/home/rafa/tailscale/dev-20260618-085601.db`. Puede validarse sin escribir:

```bash
pnpm import:legacy
```

Con `--write`, guarda vehículos, talleres, intervenciones, lecturas de odómetro, plan preventivo, seguro, compra y documentación. Las referencias de origen hacen que sea idempotente.

## Copias

```bash
pnpm backup:db
pnpm backup:db:cron:install
```

Las copias locales se guardan en `var/backups/postgres/`, ignoradas por Git, con archivos `600`, retención de 30 días y cron diario a las 01:00 Europe/Madrid. La exportación fuera del PC es una fase posterior.

## Verificación

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
