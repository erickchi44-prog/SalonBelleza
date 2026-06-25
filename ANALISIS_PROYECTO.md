# Análisis del Proyecto: Aura Luxe Salon

## 1. Datos Generales

| Atributo | Valor |
|---|---|
| **Nombre del proyecto** | `salon-belleza` |
| **Marca** | Aura Luxe Salon |
| **Versión** | 0.0.0 |
| **Stack principal** | Vue 3 + Vite + PrimeVue + Tailwind CSS |
| **Ruteo** | Vue Router 4 |
| **Color primario** | `#79542e` (cafe/marrón) |
| **Idioma** | Español |
| **Tipo** | Frontend SPA (Single Page Application) |

---

## 2. Tecnologías y Dependencias

### Producción

| Paquete | Versión | Propósito |
|---|---|---|
| `vue` | ^3.5.34 | Framework frontend |
| `vue-router` | ^4.6.4 | Enrutador oficial de Vue |
| `primevue` | ^4.5.5 | Biblioteca de componentes UI |
| `@primevue/themes` | ^4.5.4 | Temas para PrimeVue |
| `primeicons` | ^7.0.0 | Iconos |
| `@tailwindcss/vite` | ^4.3.1 | Plugin Tailwind para Vite |

### Desarrollo

| Paquete | Versión | Propósito |
|---|---|---|
| `vite` | ^8.0.12 | Bundler y dev server |
| `@vitejs/plugin-vue` | ^6.0.6 | Plugin Vue para Vite |
| `tailwindcss` | ^4.3.1 | Framework CSS utility-first |
| `autoprefixer` | ^10.5.0 | Prefijos CSS |
| `postcss` | ^8.5.15 | Procesador CSS |
| `supabase` (CLI) | ^2.107.0 | Edge Functions, deploy, webhooks |

### Servicios externos

| Servicio | Propósito |
|---|---|
| **Supabase** | Base de datos, autenticación, Edge Functions |
| **Resend** | Emails transaccionales (confirmación, recordatorios, etc.) |

---

## 3. Estructura del Proyecto

```
SalonBelleza/
├── index.html                  # Entry point HTML
├── vite.config.js              # Configuración de Vite
├── package.json                # Dependencias y scripts
├── scripts/
│   └── deploy-emails.sh        # Deploy automatizado de Edge Functions
├── supabase/
│   ├── config.toml             # Configuración Supabase CLI
│   ├── .env                    # Variables locales para Edge Functions
│   └── functions/
│       ├── booking-confirmation/
│       ├── appointment-status-change/
│       ├── feedback-thankyou/
│       ├── welcome-email/
│       └── send-reminders/
├── public/
│   ├── favicon.svg             # Favicon de la marca
│   └── icons.svg               # Sprite de iconos (legacy)
└── src/
    ├── main.js                 # Punto de entrada de la app
    ├── App.vue                 # Componente raíz
    ├── style.css               # Estilos globales + tema personalizado
    ├── lib/
    │   ├── supabase.ts         # Cliente Supabase
    │   └── email.ts            # Wrapper para invocar Edge Functions de email
    ├── assets/                 # Recursos estáticos
    ├── components/
    │   ├── atoms/              # Componentes atómicos (AppButton, AppInput, etc.)
    │   ├── molecules/          # Moléculas (ServiceCard, FeedbackCard, etc.)
    │   └── organisms/          # Organismos (AppHeader, AppFooter)
    ├── layouts/
    │   ├── DefaultLayout.vue   # Layout público
    │   └── AdminLayout.vue     # Layout administrativo
    ├── router/
    │   └── index.js            # Definición de rutas
    └── views/
        ├── BookingView.vue     # Reserva de citas
        ├── FeedbackView.vue    # Valoraciones
        ├── LoginView.vue       # Inicio de sesión
        ├── RegisterView.vue    # Registro
        ├── ServicesView.vue    # Catálogo de servicios
        └── admin/
            ├── AdminAnalyticsView.vue
            ├── AdminCalendarView.vue
            ├── AdminDashboardView.vue
            ├── AdminFeedbackView.vue
            ├── AdminPromotionsView.vue
            ├── AdminSchedulesView.vue
            └── AdminSpecialistsView.vue
```

---

## 4. Sistema de Rutas

### Rutas Públicas (DefaultLayout)

| Ruta | Vista | Descripción |
|---|---|---|
| `/services` | ServicesView | Catálogo de servicios (ruta por defecto) |
| `/booking` | BookingView | Flujo de reserva en 4 pasos |
| `/feedback` | FeedbackView | Formulario y lista de valoraciones |
| `/login` | LoginView | Inicio de sesión |
| `/register` | RegisterView | Registro de usuarios |

### Rutas Administrativas (AdminLayout)

| Ruta | Vista | Descripción |
|---|---|---|
| `/admin/dashboard` | AdminDashboardView | KPIs y resumen (ruta por defecto admin) |
| `/admin/calendar` | AdminCalendarView | Calendario semanal de citas |
| `/admin/specialists` | AdminSpecialistsView | CRUD de especialistas |
| `/admin/promotions` | AdminPromotionsView | CRUD de promociones |
| `/admin/feedback` | AdminFeedbackView | Panel de valoraciones |
| `/admin/schedules` | AdminSchedulesView | Configuración de horarios |
| `/admin/analytics` | AdminAnalyticsView | Analíticas con AI Insights |

- Lazy loading en todas las rutas
- Redirección a `/services` para rutas no encontradas
- Scroll al inicio en cada navegación

---

## 5. Arquitectura de Componentes (Atomic Design)

### Átomos

| Componente | Propósito |
|---|---|
| `AppButton` | Botón reutilizable con estilos de marca |
| `AppInput` | Campo de texto con etiqueta flotante |
| `AppPassword` | Campo de contraseña con toggle de visibilidad |
| `AppTextarea` | Área de texto con auto-resize |
| `AppDropdown` | Selector desplegable |
| `AppCalendar` | Selector de fecha |
| `AppRating` | Calificación por estrellas |

### Moléculas

| Componente | Propósito |
|---|---|
| `ServiceCard` | Tarjeta de servicio con imagen, precio y acción |
| `FeedbackCard` | Tarjeta de opinión con calificación |
| `SpecialistCard` | Tarjeta de especialista (no usado actualmente) |

### Organismos

| Componente | Propósito |
|---|---|
| `AppHeader` | Header de navegación principal con menú responsive |
| `AppFooter` | Footer con enlaces y copyright |

---

## 6. Funcionalidades Implementadas

| Funcionalidad | Estado |
|---|---|
| Catálogo de servicios con búsqueda y filtros | ✅ Completo |
| Flujo de reserva de citas multi-paso (4 pasos) | ✅ Completo |
| Valoraciones de clientes (ver y publicar) | ✅ Completo |
| Login de usuario (simulado) | ✅ Completo |
| Registro de usuario (simulado) | ✅ Completo |
| Dashboard administrativo con KPIs | ✅ Completo |
| Calendario semanal de citas | ✅ Completo |
| CRUD de especialistas | ✅ Completo |
| CRUD de promociones | ✅ Completo |
| Panel de valoraciones con métricas | ✅ Completo |
| Configuración de horarios por especialista | ✅ Completo |
| Panel de analíticas con AI Insights | ✅ Completo |
| Diseño responsive | ✅ Completo |
| Notificaciones toast | ✅ Completo |
| Sidebar de navegación admin | ✅ Completo |
| Menú móvil con animaciones | ✅ Completo |
| Emails transaccionales (Resend + Edge Functions) | ✅ Completo |

### Funcionalidades Simuladas (sin backend real)

| Funcionalidad | Comportamiento actual |
|---|---|---|
| Autenticación | Supabase Auth (real) |
| Registro | Supabase Auth con trigger `handle_new_user` |
| Persistencia de datos | Supabase PostgreSQL + RLS |
| Reserva de citas | INSERT en `appointments` via Supabase API |
| CRUD de especialistas | CRUD via `specialists` table |
| CRUD de promociones | CRUD via `promotions` table |
| Emails transaccionales | Resend via Supabase Edge Functions |
| AI Analytics | Texto narrativo hardcodeado |
| Imágenes | Usan URLs externas |
| Pagos | No implementado |

---

## 7. Sistema de Diseño

### Colores
- Paleta Material Design 3 personalizada en tonos cafes/marrones
- Color primario: `#79542e`
- Tema claro únicamente (dark mode configurado pero no implementado)

### Tipografía
- **Playfair Display** (serif) → Títulos y displays
- **Hanken Grotesk** (sans-serif) → Cuerpo de texto y etiquetas

### Estilo Visual
- Diseño minimalista con bordes planos
- Formularios con borde inferior únicamente (floating labels)
- Sombras sutiles en tarjetas
- Iconos: PrimeIcons + Material Symbols Outlined

### Responsive Design
- Breakpoints de Tailwind CSS
- Layouts adaptativos (columnas en desktop, apilados en móvil)
- Header con menú hamburguesa en móvil
- AdminLayout con sidebar en desktop y drawer deslizante en móvil

---

## 8. Vistas Públicas - Detalle

### ServicesView (`/services`)
- Catálogo con 6 servicios hardcodeados
- Búsqueda por texto y filtro por categorías (Cabello, Manicura & Pedicura, Faciales, Bienestar)
- Cada servicio redirige a `/booking` guardando selección en localStorage

### BookingView (`/booking`)
- Wizard de 4 pasos: Servicio → Especialista → Fecha/Hora → Confirmación
- 12 slots de tiempo disponibles (9:00 AM - 3:30 PM)
- 4 especialistas definidos

### FeedbackView (`/feedback`)
- Formulario para dejar valoración + lista de 6 opiniones de ejemplo
- Validación de campos obligatorios

### LoginView (`/login`)
- Diseño de dos columnas (imagen + formulario)
- Validación: email con `@`, password >= 6 caracteres
- Redirección por rol: admin → `/admin/dashboard`, cliente → `/booking`

### RegisterView (`/register`)
- Mismo diseño que LoginView
- Validación: nombre >= 3, email con `@`, teléfono >= 8, contraseñas coincidentes

---

## 9. Vistas Administrativas - Detalle

### AdminDashboardView
- 4 KPIs: Citas Hoy (14), Ingresos ($18,420), Nuevos Clientes (37), Rating (4.8)
- Tabla de citas recientes con estados (Confirmada/Pendiente/Cancelada)
- Acciones rápidas y citas del día

### AdminCalendarView
- Calendario semanal con slots de 30 minutos (9:00 AM - 4:30 PM)
- Diálogo para crear nueva cita
- Filtro por fecha y especialista

### AdminSpecialistsView
- Grilla de 4 especialistas con estadísticas
- CRUD mediante diálogos (modal)
- Enlace a configuración de horarios

### AdminPromotionsView
- DataTable paginado con 4 promociones
- CRUD mediante diálogos
- Badges de descuento y estado

### AdminFeedbackView
- Calificación promedio y distribución por estrellas
- Filtro por calificación
- Lista de valoraciones con botón "Responder" (visual)

### AdminSchedulesView
- Horarios semanales por especialista
- Toggle activo/inactivo por día
- Configuración de hora inicio, cierre y descanso

### AdminAnalyticsView
- Badge "AI Assistant activo"
- Resumen inteligente narrativo con datos del mes
- 4 stats con barras de progreso
- Rendimiento por servicio y ranking de especialistas

---

## 10. Punto de Entrada (`main.js`)

1. Crea la app con `createApp(App)`
2. Registra Vue Router
3. Configura PrimeVue con preset personalizado `AuraLuxePreset` (tema Aura con colores cafes)
4. Registra `ToastService` para notificaciones
5. Monta la app en `#app`

---

## 11. Estilos Globales (`style.css`)

- Tema personalizado con 54 variables de color
- 6 fuentes semánticas (display, headline, body, label)
- 11 variables de espaciado
- 3 familias de fuentes importadas (Playfair Display, Hanken Grotesk, Material Symbols)

---

## 12. Estado Actual del Proyecto

**Aura Luxe Salon** es un MVP funcional para la gestión de un salón de belleza de lujo. Está construido profesionalmente con:

- Arquitectura atómica de componentes
- Lazy loading de rutas
- Sistema de diseño consistente
- Diseño responsive
- Separación clara entre layouts público y administrativo
- Backend real con Supabase (auth, DB, RLS, Edge Functions)
- Emails transaccionales con Resend integrados via Edge Functions

---

*Documento generado el 16 de junio de 2026 — Actualizado el 24 de junio de 2026*
