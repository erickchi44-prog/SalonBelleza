# Aura Luxe Salon

Sistema de gestión para salón de belleza construido con **Vue 3 + Vite + PrimeVue + Tailwind CSS** y respaldado por **Supabase** (plan gratuito).

## Stack

| Tecnología   | Versión  | Propósito                   |
| ------------ | -------- | --------------------------- |
| Vue 3        | ^3.5.34  | Framework frontend          |
| Vite         | ^8.0.12  | Bundler y dev server        |
| PrimeVue     | ^4.5.5   | Componentes UI              |
| Tailwind CSS | ^4.3.1   | Estilos utility-first       |
| Vue Router   | ^4.6.4   | Enrutamiento SPA            |
| Supabase     | ^2.108.2 | Backend (auth, DB, storage) |

## Funcionalidades

- **Catálogo de servicios** con precios y duración
- **Especialistas** con perfiles y especialidades
- **Reserva de citas** con selección de servicio, especialista y horario
- **Feedback** y reseñas de clientes
- **Panel administrador** con dashboard, CRUD de especialistas/promociones, calendario, horarios, analíticas y moderación de feedback
- **Autenticación** con Supabase Auth (login/registro), roles `client` y `admin`
- **Control de acceso** por ruta via navigation guard

## Vistas

### Públicas

- Login (`/login`)
- Registro (`/register`)
- Servicios (`/servicios`)
- Reserva de Cita (`/booking`)
- Feedback (`/feedback`)

### Admin (`/admin/*`)

- Dashboard (KPIs)
- Calendario de citas
- Especialistas (CRUD)
- Promociones (CRUD)
- Horarios
- Feedback (moderación)
- Analíticas

## Empezar

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Previsualizar build
npm run preview
```

## Variables de Entorno

Crear `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Estructura del Proyecto

```
SalonBelleza/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.js
    ├── App.vue
    ├── style.css
    ├── lib/
    │   └── supabase.js          # Cliente Supabase
    ├── router/
    │   └── index.js             # Vue Router + navigation guard
    ├── components/
    │   ├── atoms/               # Botones, inputs, etc.
    │   ├── molecules/           # ServiceCard, FeedbackCard, etc.
    │   └── organisms/           # Header, footer, layouts
    └── views/
        ├── LoginView.vue
        ├── RegisterView.vue
        ├── ServicesView.vue
        ├── BookingView.vue
        ├── FeedbackView.vue
        └── admin/
            ├── AdminDashboardView.vue
            ├── AdminCalendarView.vue
            ├── AdminSpecialistsView.vue
            ├── AdminPromotionsView.vue
            ├── AdminSchedulesView.vue
            ├── AdminFeedbackView.vue
            └── AdminAnalyticsView.vue
```

## Documentación Adicional

- [`ANALISIS_PROYECTO.md`](./ANALISIS_PROYECTO.md) — Análisis inicial del proyecto
- [`GUIA_SUPABASE.md`](./GUIA_SUPABASE.md) — Guía completa de integración, SQL y RLS
- [`AVANCE.md`](./AVANCE.md) — Progreso del proyecto y pendientes

## Notas

### Supabase

- Plan gratuito: 500 MB DB, 50k usuarios, 1 GB storage
- Row Level Security (RLS) activo en todas las tablas
- Función `is_admin()` SECURITY DEFINER para políticas de administración
- En desarrollo, recomienda deshabilitar confirmación de email en Supabase Dashboard

### Color primario

- `#79542e` — tono cafe/marrón de la marca
