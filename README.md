# AutoVault

Concesionaria online full stack. Cualquier visitante puede recorrer el catálogo de vehículos en venta y ver el detalle de cada uno; los administradores gestionan el catálogo desde un panel protegido.

TP2 de Metodologías y Desarrollos Web (UAI), tomando como referencia el repositorio de la materia.

## Deploy (Render)

| Parte | URL |
|---|---|
| Frontend (Static Site) | https://autovault-pv40.onrender.com |
| Backend (Web Service) | https://autovault-api-f98z.onrender.com (ej: [`/health`](https://autovault-api-f98z.onrender.com/health)) |

El frontend llama a la API por `/api` (rewrite del Static Site hacia el backend), nunca directo a la URL del backend.

> El backend usa el plan gratuito de Render: si estuvo inactivo, la primera request puede tardar ~1 minuto mientras "despierta".

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| admin | `admin@autovault.com` | `Admin1234!` |
| user | `user@autovault.com` | `User1234!` |

Todo usuario nuevo (registro con email o login con GitHub) recibe el rol `user`.

## Entidad elegida: `Vehicle`

Recurso REST: `/api/v1/vehicles`

| Campo | Tipo | Detalle |
|---|---|---|
| `brand` | texto | Marca, obligatorio (máx. 50) |
| `model` | texto | Modelo/versión, obligatorio (máx. 80) |
| `year` | número | Entero entre 1950 y el año próximo |
| `price` | número | Precio en USD, mayor a 0 |
| `mileage` | número | Kilometraje, entero ≥ 0 |
| `fuelType` | enum | `gasoline`, `diesel`, `cng`, `hybrid`, `electric` |
| `transmission` | enum | `manual`, `automatic` |
| `bodyType` | enum | `sedan`, `hatchback`, `suv`, `pickup`, `coupe`, `van` |
| `color` | texto | Opcional |
| `description` | texto | Opcional (máx. 2000) |
| `imageUrl` | texto (URL) | Opcional, `http(s)://...` |
| `available` | booleano | `true` = disponible, `false` = vendido |
| `listedAt` | fecha | Fecha de publicación |

## Stack

- **Backend** (`backend/`): Node.js, Express 5, TypeScript, MongoDB (Mongoose), Zod, Better Auth (plugin `admin` para roles).
- **Frontend** (`frontend/`): React 19, Vite, TypeScript, React Router, Redux Toolkit / RTK Query, React Hook Form + Zod, Tailwind CSS.

## API

Formato de error: `{ "error": { "message": "...", "details": { "campo": ["..."] } } }`.

### Vehículos

| Método | Ruta | Rol requerido | Respuestas |
|---|---|---|---|
| GET | `/api/v1/vehicles` | público | 200, 400 (query inválida) |
| GET | `/api/v1/vehicles/brands` | público | 200 (marcas distintas, ordenadas) |
| GET | `/api/v1/vehicles/:id` | público | 200, 400 (id inválido), 404 |
| POST | `/api/v1/vehicles` | admin | 201, 400, 401, 403 |
| PUT | `/api/v1/vehicles/:id` | admin | 200, 400, 401, 403, 404 |
| PATCH | `/api/v1/vehicles/:id` | admin | 200, 400, 401, 403, 404 |
| DELETE | `/api/v1/vehicles/:id` | admin | 204, 400, 401, 403, 404 |

Query params de `GET /api/v1/vehicles` (todos opcionales, validados con Zod):

| Param | Ejemplo | Descripción |
|---|---|---|
| `page`, `limit` | `page=2&limit=12` | Paginación (`limit` de 1 a 50, default 12) |
| `sortBy`, `sortOrder` | `sortBy=price&sortOrder=asc` | Orden por `listedAt` (default), `price`, `year`, `mileage` o `brand` |
| `search` | `search=toyota hilux` | Cada palabra debe aparecer en marca, modelo, color o descripción |
| `brand` | `brand=ford` | Marca exacta (sin importar mayúsculas) |
| `fuelType`, `transmission`, `bodyType` | `bodyType=suv` | Valores de los enums |
| `minPrice`, `maxPrice` | `maxPrice=30000` | Rango de precio (USD) |
| `minYear`, `maxYear` | `minYear=2022` | Rango de año |
| `available` | `available=true` | `true` = disponibles, `false` = vendidos |

Respuesta: `{ data: Vehicle[], meta: { total, page, limit, totalPages } }`.

`PUT` y `PATCH` aceptan actualizaciones parciales (al menos un campo).

### Autenticación (Better Auth)

| Método | Ruta | Rol requerido | Descripción |
|---|---|---|---|
| POST | `/api/auth/sign-up/email` | público | Registro con nombre, email y contraseña |
| POST | `/api/auth/sign-in/email` | público | Login con email y contraseña |
| POST | `/api/auth/sign-in/social` | público | Login con GitHub (`{ "provider": "github" }`) |
| GET | `/api/auth/callback/github` | público | Callback OAuth de GitHub |
| GET | `/api/auth/get-session` | público | Sesión actual (`null` si no hay) |
| POST | `/api/auth/sign-out` | sesión | Cierra la sesión (la borra de la base) |

### Otros

| Método | Ruta | Rol requerido | Descripción |
|---|---|---|---|
| GET | `/health` | público | Estado del servidor |

## Correr en local

Requisitos: Node.js 24, una base en MongoDB Atlas y una OAuth App de GitHub.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # completar los valores
npm run seed           # crea los usuarios de prueba y vehículos de ejemplo
npm run dev            # http://localhost:3000
```

Variables de entorno (`backend/.env`):

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (default 3000) |
| `NODE_ENV` | `development` / `production` |
| `MONGODB_URI` | URI de MongoDB Atlas, con el nombre de la base (`.../autovault?...`) |
| `BETTER_AUTH_SECRET` | Secreto de sesiones: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `BETTER_AUTH_URL` | URL pública del **frontend** (local: `http://localhost:5173`) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | OAuth App de GitHub. Callback: `<BETTER_AUTH_URL>/api/auth/callback/github` |
| `DNS_SERVERS` | Opcional. Si Atlas falla con `querySrv ECONNREFUSED`, usar `8.8.8.8,1.1.1.1` |

Scripts: `dev`, `build`, `start`, `typecheck`, `seed` (`npm run seed -- --reset` recarga los vehículos).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

El frontend llama siempre a `/api` (mismo origen): en local lo resuelve el proxy de Vite hacia `localhost:3000` y en Render el rewrite del Static Site. Así la cookie de sesión es first-party y no hace falta CORS.

## Deploy en Render

**Backend → Web Service**
- Root Directory: `backend`
- Build Command: `npm install --include=dev && npm run build`
- Start Command: `npm start`
- Health Check Path: `/health`
- Variables: las del `.env.example` (`BETTER_AUTH_URL` = URL del frontend; OAuth App de GitHub de producción con callback `https://autovault-pv40.onrender.com/api/auth/callback/github`).

**Frontend → Static Site**
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Redirects/Rewrites (en este orden):
  1. `/api/*` → `https://autovault-api-f98z.onrender.com/api/*` (Rewrite)
  2. `/*` → `/index.html` (Rewrite)

## Estructura

```
backend/
  scripts/seed.ts        datos de prueba
  src/
    config/              conexión a Mongo y DNS
    constants/           valores de los enums
    controllers/         capa HTTP
    lib/auth.ts          configuración de Better Auth
    middlewares/         authMiddleware, requireRole, validaciones Zod
    models/              modelo Mongoose
    routes/              rutas /api/v1
    schemas/             schemas Zod
    services/            lógica de negocio y acceso a datos
frontend/
  src/
    components/          UI (formularios, tarjetas, auth)
    layouts/             header + footer
    lib/                 cliente de Better Auth, axios, formatos
    pages/               Home, VehicleDetail, Login, Register, Admin
    router/              rutas y ProtectedRoute
    schemas/             schemas Zod de formularios
    store/               Redux + RTK Query
```
