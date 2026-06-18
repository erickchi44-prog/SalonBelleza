# Guía de Integración: Supabase (Plan Gratuito)

## Requisitos del Plan Gratuito de Supabase

| Recurso | Límite Gratuito |
|---|---|
| Proyectos | 2 organizaciones, proyectos ilimitados |
| Base de datos | 500 MB |
| Autenticación | 50,000 usuarios |
| Storage | 1 GB |
| Transferencia de datos | 5 GB/mes |
| Usuarios mensuales activos (MAU) | 50,000 |
| Edge Functions | 500,000 invocaciones/mes |
| Realtime | 2 millones mensajes/mes |

---

## 1. Crear Proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) e iniciar sesión con GitHub
2. Click en **"New project"**
3. Completar:
   - **Name**: `salon-belleza` (o el que prefieras)
   - **Database Password**: Generar una segura (guardarla)
   - **Region**: Elegir la más cercana (US East, US West, o EU West)
   - **Pricing Plan**: Free
4. Esperar a que se provisione (~2 minutos)
5. Una vez creado, ir a **Project Settings > API** y copiar:
   - `Project URL` (ej: `https://abc123.supabase.co`)
   - `anon public` key

---

## 2. Instalar Dependencias

```bash
npm install @supabase/supabase-js
```

---

## 3. Crear Archivo de Variables de Entorno

Crear `.env` en la raíz del proyecto:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Agregar `.env` al `.gitignore` (ya existe con `*.local`, renombrar como `.env.local`):

```
.env
.env.local
.env.*.local
```

---

## 4. Crear el Cliente de Supabase

Crear `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 5. Esquema de Base de Datos

Ejecutar este SQL en el **SQL Editor** de Supabase:

```sql
-- Tabla: profiles (perfiles de usuario, se crea con trigger de auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta al crear un usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Tabla: services
CREATE TABLE services (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration INT NOT NULL, -- en minutos
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: specialists
CREATE TABLE specialists (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  bio TEXT,
  years_exp INT DEFAULT 0,
  appointments INT DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: schedules (horarios por especialista)
CREATE TABLE schedules (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  specialist_id BIGINT REFERENCES specialists(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=domingo
  active BOOLEAN DEFAULT true,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start TIME,
  break_end TIME,
  UNIQUE(specialist_id, day_of_week)
);

-- Tabla: appointments (citas)
CREATE TABLE appointments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  specialist_id BIGINT REFERENCES specialists(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Confirmada', 'Cancelada', 'Completada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla pivote: appointment_services (relación muchos-a-muchos)
CREATE TABLE appointment_services (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id BIGINT NOT NULL REFERENCES services(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(appointment_id, service_id)
);

-- Tabla: feedback (valoraciones)
CREATE TABLE feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  service_id BIGINT REFERENCES services(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: promotions (promociones)
CREATE TABLE promotions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount INT NOT NULL,
  valid_until DATE,
  service_id BIGINT REFERENCES services(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar datos iniciales (servicios)
INSERT INTO services (category, title, description, price, duration, image_url) VALUES
  ('CABELLO', 'Corte de Autor & Peinado', 'Corte personalizado adaptado a tus rasgos faciales y estilo de vida, incluyendo lavado con champú orgánico y peinado profesional.', 45, 60, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFONwbKKI4qg71dm7dse3OMWxf9lYy1ysa7sjuofNlW0mV6EfYCu2-BGBswvxTT0uOvAmayMzEzESXWtv7tPS2vxSACBW5xB3X1jUvZ0jP7H2Im-bNPqP5wTQVT67eOL5JqAzZx7cr47-m_WB_tsqsr_0KnF3TK7NovREcwIFOeSYBRyT1hDHM_ruv6lxQkKG20QF8cVPV1LVULL8-erxvsAU4w4bhycbe7JjKqtFcyqFMwqyftd-p9ZCPl8My_wYiDyJ_EQ54uTk'),
  ('CABELLO', 'Balayage Premium & Brillo', 'Técnica de coloración francesa a mano alzada para crear reflejos naturales y degradados sublimes, sellado con un tratamiento de brillo nutritivo.', 130, 150, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFONwbKKI4qg71dm7dse3OMWxf9lYy1ysa7sjuofNlW0mV6EfYCu2-BGBswvxTT0uOvAmayMzEzESXWtv7tPS2vxSACBW5xB3X1jUvZ0jP7H2Im-bNPqP5wTQVT67eOL5JqAzZx7cr47-m_WB_tsqsr_0KnF3TK7NovREcwIFOeSYBRyT1hDHM_ruv6lxQkKG20QF8cVPV1LVULL8-erxvsAU4w4bhycbe7JjKqtFcyqFMwqyftd-p9ZCPl8My_wYiDyJ_EQ54uTk'),
  ('MANICURA & PEDICURA', 'Manicura Spa de Lujo', 'Tratamiento completo de uñas que incluye exfoliación con sales marinas, mascarilla hidratante, masaje relajante y esmaltado de larga duración.', 35, 45, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFONwbKKI4qg71dm7dse3OMWxf9lYy1ysa7sjuofNlW0mV6EfYCu2-BGBswvxTT0uOvAmayMzEzESXWtv7tPS2vxSACBW5xB3X1jUvZ0jP7H2Im-bNPqP5wTQVT67eOL5JqAzZx7cr47-m_WB_tsqsr_0KnF3TK7NovREcwIFOeSYBRyT1hDHM_ruv6lxQkKG20QF8cVPV1LVULL8-erxvsAU4w4bhycbe7JjKqtFcyqFMwqyftd-p9ZCPl8My_wYiDyJ_EQ54uTk'),
  ('FACIALES', 'Facial Hidratante Aura Glow', 'Tratamiento rejuvenecedor profundo con infusión de ácido hialurónico y vitaminas para restaurar el brillo y la jugosidad de la piel.', 75, 60, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFONwbKKI4qg71dm7dse3OMWxf9lYy1ysa7sjuofNlW0mV6EfYCu2-BGBswvxTT0uOvAmayMzEzESXWtv7tPS2vxSACBW5xB3X1jUvZ0jP7H2Im-bNPqP5wTQVT67eOL5JqAzZx7cr47-m_WB_tsqsr_0KnF3TK7NovREcwIFOeSYBRyT1hDHM_ruv6lxQkKG20QF8cVPV1LVULL8-erxvsAU4w4bhycbe7JjKqtFcyqFMwqyftd-p9ZCPl8My_wYiDyJ_EQ54uTk'),
  ('BIENESTAR', 'Masaje de Tejido Profundo Relajante', 'Terapia corporal completa enfocada en liberar tensiones musculares acumuladas utilizando aceites esenciales aromáticos calientes.', 90, 75, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFONwbKKI4qg71dm7dse3OMWxf9lYy1ysa7sjuofNlW0mV6EfYCu2-BGBswvxTT0uOvAmayMzEzESXWtv7tPS2vxSACBW5xB3X1jUvZ0jP7H2Im-bNPqP5wTQVT67eOL5JqAzZx7cr47-m_WB_tsqsr_0KnF3TK7NovREcwIFOeSYBRyT1hDHM_ruv6lxQkKG20QF8cVPV1LVULL8-erxvsAU4w4bhycbe7JjKqtFcyqFMwqyftd-p9ZCPl8My_wYiDyJ_EQ54uTk'),
  ('MANICURA & PEDICURA', 'Pedicura Jelly Real Spa', 'Pedicura única con baño gelatinoso caliente impregnado de esencias naturales que relaja los pies, seguido de pedicura completa y masaje.', 50, 60, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFONwbKKI4qg71dm7dse3OMWxf9lYy1ysa7sjuofNlW0mV6EfYCu2-BGBswvxTT0uOvAmayMzEzESXWtv7tPS2vxSACBW5xB3X1jUvZ0jP7H2Im-bNPqP5wTQVT67eOL5JqAzZx7cr47-m_WB_tsqsr_0KnF3TK7NovREcwIFOeSYBRyT1hDHM_ruv6lxQkKG20QF8cVPV1LVULL8-erxvsAU4w4bhycbe7JjKqtFcyqFMwqyftd-p9ZCPl8My_wYiDyJ_EQ54uTk');

-- Insertar datos iniciales (especialistas)
INSERT INTO specialists (name, specialty, bio, years_exp, appointments, rating) VALUES
  ('Elena Vargas', 'Estilista Senior', 'Más de 12 años de experiencia en colorimetría y cortes de autor de vanguardia.', 12, 248, 4.9),
  ('Mía Rodríguez', 'Especialista en Spa', 'Experta en tratamientos faciales y corporales con técnicas holísticas de bienestar.', 8, 186, 4.8),
  ('Carlos Ortiz', 'Maestro Barbero', 'Especializado en cortes masculinos de precisión y tratamientos capilares restauradores.', 10, 312, 4.7),
  ('Laura Méndez', 'Nail Artist', 'Artista de uñas certificada en técnicas gel, acrílico y nail art de alta complejidad.', 6, 165, 5.0);

-- Insertar horarios por defecto para cada especialista
INSERT INTO schedules (specialist_id, day_of_week, active, start_time, end_time, break_start, break_end)
SELECT s.id, dow.day, true, '09:00', '19:00', '13:00', '14:00'
FROM specialists s
CROSS JOIN (VALUES (0), (1), (2), (3), (4), (5), (6)) AS dow(day)
WHERE dow.day NOT IN (0, 6); -- Solo lunes a viernes

-- Sábado (10:00 - 18:00 sin descanso)
INSERT INTO schedules (specialist_id, day_of_week, active, start_time, end_time, break_start, break_end)
SELECT s.id, 6, true, '10:00', '18:00', NULL, NULL
FROM specialists s;

-- Domingo (inactivo)
INSERT INTO schedules (specialist_id, day_of_week, active, start_time, end_time, break_start, break_end)
SELECT s.id, 0, false, '10:00', '16:00', NULL, NULL
FROM specialists s;

-- Insertar promociones iniciales
INSERT INTO promotions (title, description, discount, valid_until, service_id, active) VALUES
  ('Martes de Brillo', 'Descuento especial en servicios de coloración los martes.', 20, '2026-06-30', (SELECT id FROM services WHERE title LIKE '%Balayage%'), true),
  ('Spa Weekend', 'Paquete especial de bienestar disponible sábados y domingos.', 15, '2026-07-31', (SELECT id FROM services WHERE title LIKE '%Masaje%'), true),
  ('Nueva Cliente', 'Bienvenida especial para clientes que visitan el salón por primera vez.', 25, '2026-12-31', NULL, true),
  ('Cumpleañera Especial', 'Descuento el mes de tu cumpleaños con previa identificación.', 30, '2026-12-31', NULL, false);

-- Insertar feedback de ejemplo
INSERT INTO feedback (customer_name, service_id, rating, comment) VALUES
  ('Sofía Herrera', (SELECT id FROM services WHERE title LIKE '%Balayage%'), 5, 'Una experiencia absolutamente mágica. Elena es una artista del cabello. Salí transformada y radiante.'),
  ('Miguel Torres', (SELECT id FROM services WHERE title LIKE '%Masaje%'), 4, 'El masaje fue profundamente relajante. Las instalaciones son impecables y el ambiente, muy tranquilo.'),
  ('Ana Jiménez', (SELECT id FROM services WHERE title LIKE '%Facial%'), 5, 'Mi piel brilla como nunca. El facial Aura Glow es un must. Regresaré definitivamente el próximo mes.'),
  ('Daniela López', (SELECT id FROM services WHERE title LIKE '%Manicura%'), 5, 'Laura es increíble con las uñas. Un trabajo artístico y muy detallado. El resultado superó todas mis expectativas.'),
  ('Ricardo Garza', (SELECT id FROM services WHERE title LIKE '%Corte%'), 4, 'Carlos es un maestro de la barbería. Corte perfecto y muy buena atención. El servicio fue puntual y profesional.'),
  ('Valentina Cruz', (SELECT id FROM services WHERE title LIKE '%Pedicura%'), 5, 'La pedicura jelly fue una revelación. Nunca había sentido algo tan relajante. El equipo es simplemente maravilloso.');
```

---

### Migración: servicio único → multi-servicio

Si ya tienes datos en `appointments` con `service_id`, ejecuta en el SQL Editor:

```sql
-- 1. Crear tabla pivote (si no existe)
CREATE TABLE IF NOT EXISTS appointment_services (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id BIGINT NOT NULL REFERENCES services(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(appointment_id, service_id)
);

-- 2. Migrar datos existentes
INSERT INTO appointment_services (appointment_id, service_id)
SELECT id, service_id FROM appointments WHERE service_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Eliminar columna antigua (una vez verificada)
-- ALTER TABLE appointments DROP COLUMN service_id;

-- 4. Políticas RLS para la nueva tabla (ejecutar después de 6. Seguridad)
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios crean servicios de sus citas"
  ON appointment_services FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM appointments WHERE id = appointment_id AND user_id = auth.uid())
  );
CREATE POLICY "Usuarios ven servicios de sus citas"
  ON appointment_services FOR SELECT USING (
    EXISTS (SELECT 1 FROM appointments WHERE id = appointment_id AND user_id = auth.uid())
  );
CREATE POLICY "Admins gestionan appointment_services"
  ON appointment_services FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 6. Seguridad (Row Level Security)

Ejecutar después de insertar los datos:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuarios ven su propio perfil"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios actualizan su propio perfil"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins ven todos los perfiles"
  ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Políticas para services (lectura pública, escritura solo admin)
CREATE POLICY "Servicios visibles para todos"
  ON services FOR SELECT USING (true);
CREATE POLICY "Solo admin puede modificar servicios"
  ON services FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Políticas para specialists
CREATE POLICY "Especialistas visibles para todos"
  ON specialists FOR SELECT USING (true);
CREATE POLICY "Solo admin puede modificar especialistas"
  ON specialists FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Políticas para schedules (lectura para clientes, escritura admin)
CREATE POLICY "Horarios visibles para todos"
  ON schedules FOR SELECT USING (true);
CREATE POLICY "Solo admin puede modificar horarios"
  ON schedules FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Políticas para appointments
CREATE POLICY "Usuarios ven sus propias citas"
  ON appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios crean sus propias citas"
  ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins ven todas las citas"
  ON appointments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins modifican cualquier cita"
  ON appointments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Políticas para feedback
CREATE POLICY "Feedback visible para todos"
  ON feedback FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados crean feedback"
  ON feedback FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins gestionan feedback"
  ON feedback FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Políticas para promotions
CREATE POLICY "Promociones visibles para todos"
  ON promotions FOR SELECT USING (true);
CREATE POLICY "Solo admin puede modificar promociones"
  ON promotions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 7. Migración de Vistas — Paso a Paso

### 7.1 Autenticación (`LoginView.vue`)

Reemplazar la lógica simulada por Supabase Auth:

```javascript
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errors = ref({})

const handleLogin = async () => {
  errors.value = {}
  if (!email.value.includes('@')) {
    errors.value.email = 'Por favor ingresa un correo válido.'
    return
  }
  if (password.value.length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  loading.value = true
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  loading.value = false

  if (error) {
    errors.value.email = error.message
    return
  }

  // Obtener el rol del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', (await supabase.auth.getUser()).data.user.id)
    .single()

  if (profile?.role === 'admin') {
    router.push('/admin/dashboard')
  } else {
    router.push('/booking')
  }
}
```

### 7.2 Registro (`RegisterView.vue`)

```javascript
const handleRegister = async () => {
  // ... validaciones existentes ...

  loading.value = true
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        full_name: fullName.value,
        phone: phone.value
      }
    }
  })
  loading.value = false

  if (error) {
    errors.value.email = error.message
    return
  }

  // El perfil se crea automáticamente via trigger
  router.push('/login')
  // En producción: mostrar mensaje de verificación de email
}
```

### 7.3 Cerrar Sesión (AppHeader + AdminLayout)

```javascript
const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
```

### 7.4 Proteger Rutas (Router)

Agregar un guard de navegación en `router/index.js`:

```javascript
import { supabase } from '../lib/supabase'

router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()

  const publicRoutes = ['login', 'register', 'services', 'feedback']
  const adminRoutes = ['admin-dashboard', 'admin-calendar', 'admin-specialists', 'admin-promotions', 'admin-feedback', 'admin-schedules', 'admin-analytics']

  if (!user && !publicRoutes.includes(to.name)) {
    return next({ name: 'login' })
  }

  if (adminRoutes.includes(to.name)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return next({ name: 'services' })
    }
  }

  next()
})
```

### 7.5 ServicesView — Obtener desde Supabase

```javascript
const services = ref([])

const fetchServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('id')

  if (!error) services.value = data
}

onMounted(fetchServices)
```

### 7.6 BookingView — Guardar cita en Supabase

```javascript
import { supabase } from '../lib/supabase'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const confirmBooking = async () => {
  loading.value = true

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('appointments').insert({
    user_id: user.id,
    customer_name: user.email, // o profile.full_name
    service_id: selectedServiceId.value,
    specialist_id: selectedSpecialistId.value,
    appointment_date: selectedDate.value.toISOString().split('T')[0],
    appointment_time: selectedTime.value,
    notes: notes.value,
    status: 'Pendiente'
  })

  loading.value = false

  if (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 4000 })
    return
  }

  toast.add({ severity: 'success', summary: '¡Cita Confirmada!', detail: `Tu cita ha sido registrada.`, life: 4000 })
  setTimeout(() => router.push('/feedback'), 2500)
}
```

### 7.7 FeedbackView — Leer y escribir desde Supabase

```javascript
const fetchReviews = async () => {
  const { data, error } = await supabase
    .from('feedback')
    .select('*, services(title)')
    .order('created_at', { ascending: false })

  if (!error) {
    reviews.value = data.map(r => ({
      id: r.id,
      customerName: r.customer_name,
      date: new Date(r.created_at).toLocaleDateString('es-MX'),
      rating: r.rating,
      comment: r.comment,
      serviceName: r.services?.title
    }))
  }
}

const submitFeedback = async () => {
  if (!feedbackForm.value.serviceId || feedbackForm.value.rating === 0 || !feedbackForm.value.comment) {
    toast.add({ severity: 'warn', summary: 'Campos incompletos', detail: 'Por favor completa todos los campos.', life: 3000 })
    return
  }

  loading.value = true

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    customer_name: profile?.full_name || 'Usuario',
    service_id: feedbackForm.value.serviceId,
    rating: feedackForm.value.rating,
    comment: feedackForm.value.comment
  })

  loading.value = false

  if (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 })
    return
  }

  feedbackForm.value = { serviceId: null, rating: 0, comment: '' }
  toast.add({ severity: 'success', summary: '¡Gracias!', detail: 'Tu valoración ha sido publicada.', life: 3000 })
  fetchReviews()
}
```

### 7.8 AdminDashboardView — KPIs desde Supabase

```javascript
const kpis = ref([])

const fetchKpis = async () => {
  const today = new Date().toISOString().split('T')[0]
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const [{ count: todayCount }, { data: monthRevenue }, { data: feedbackData }] = await Promise.all([
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', today),
    supabase.rpc('get_monthly_revenue'), // función SQL o cálculo manual
    supabase.from('feedback').select('rating')
  ])

  const avgRating = feedbackData?.length
    ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
    : '0'

  kpis.value = [
    { label: 'Citas Hoy', value: String(todayCount), trend: 12, icon: 'pi pi-calendar', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
    { label: 'Ingresos del Mes', value: `$${monthRevenue || '0'}`, trend: 8, icon: 'pi pi-dollar', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Valoración Promedio', value: avgRating, trend: 2, icon: 'pi pi-star', iconBg: 'bg-yellow-50', iconColor: 'text-yellow-500' }
  ]
}
```

### 7.9 AdminSpecialistsView — CRUD desde Supabase

```javascript
const fetchSpecialists = async () => {
  const { data, error } = await supabase
    .from('specialists')
    .select('*')
    .order('id')

  if (!error) specialists.value = data
}

const saveSpecialist = async () => {
  if (editingId.value) {
    const { error } = await supabase
      .from('specialists')
      .update({
        name: form.value.name,
        specialty: form.value.specialty,
        years_exp: Number(form.value.yearsExp),
        bio: form.value.bio
      })
      .eq('id', editingId.value)

    if (!error) {
      showDialog.value = false
      fetchSpecialists()
    }
  } else {
    const { error } = await supabase
      .from('specialists')
      .insert({
        name: form.value.name,
        specialty: form.value.specialty,
        years_exp: Number(form.value.yearsExp),
        bio: form.value.bio,
        appointments: 0,
        rating: 0
      })

    if (!error) {
      showDialog.value = false
      fetchSpecialists()
    }
  }
}
```

### 7.10 AdminPromotionsView — CRUD desde Supabase

```javascript
const fetchPromotions = async () => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error) promotions.value = data
}

const savePromotion = async () => {
  const payload = {
    title: form.value.title,
    description: form.value.description,
    discount: Number(form.value.discount),
    valid_until: form.value.validUntil?.toISOString().split('T')[0],
    service_id: form.value.service === 'all' ? null : form.value.service,
    active: true
  }

  if (editingId.value) {
    await supabase.from('promotions').update(payload).eq('id', editingId.value)
  } else {
    await supabase.from('promotions').insert(payload)
  }

  showDialog.value = false
  fetchPromotions()
}

const deletePromotion = async (id) => {
  await supabase.from('promotions').delete().eq('id', id)
  fetchPromotions()
}
```

### 7.11 AdminSchedulesView — desde Supabase

```javascript
const fetchSchedules = async () => {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('specialist_id', selectedSpecialist.value)
    .order('day_of_week')

  if (!error) schedule.value = data.map(s => ({
    day: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][s.day_of_week],
    active: s.active,
    start: s.start_time.slice(0, 5),
    end: s.end_time.slice(0, 5),
    break: s.break_start ? `${s.break_start.slice(0, 5)} - ${s.break_end.slice(0, 5)}` : 'none'
  }))
}
```

---

## 8. Storage para Imágenes (Opcional)

En Supabase Dashboard > Storage:

1. Crear bucket `service-images` (público)
2. Política: `SELECT` para todos, `INSERT/UPDATE/DELETE` solo admin
3. Subir imágenes desde el panel admin

```javascript
// Ejemplo de subida de imagen
const uploadImage = async (file) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  
  const { error } = await supabase.storage
    .from('service-images')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('service-images')
    .getPublicUrl(fileName)

  return publicUrl
}
```

---

## 9. Variables de Entorno en Producción

Si despliegas en Vercel / Netlify / Railway, agregar en la configuración del proyecto:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

---

## 10. Buenas Prácticas y Notas

1. **Nunca exponer la `service_role` key** — solo usar la `anon` key del lado del cliente
2. **RLS es obligatorio** — sin RLS, cualquier usuario puede leer/escribir toda la DB
3. **Trigger de perfil** — el trigger `handle_new_user` asegura que cada usuario tenga un perfil al registrarse
4. **Primer admin** — crear manualmente en la tabla `profiles`:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'uuid-del-usuario-admin';
   ```
5. **Verificación de email** — en el plan gratuito, el email de confirmación se envía automáticamente. Los usuarios deben confirmar antes de iniciar sesión (se puede desactivar en Authentication > Settings > Disable email confirmation)
6. **Límites gratuitos** — 500 MB de DB, 50k usuarios, 1 GB storage. Suficiente para un salón de belleza pequeño/mediano
7. **Monitoreo** — en Supabase Dashboard > Database > Query performance para ver consultas lentas

---

## 11. Resumen de Archivos a Crear/Modificar

| Archivo | Acción |
|---|---|
| `.env` | **Crear** — variables de entorno |
| `src/lib/supabase.js` | **Crear** — cliente de Supabase |
| `src/router/index.js` | **Modificar** — agregar navigation guard |
| `src/views/LoginView.vue` | **Modificar** — usar `supabase.auth.signInWithPassword` |
| `src/views/RegisterView.vue` | **Modificar** — usar `supabase.auth.signUp` |
| `src/views/ServicesView.vue` | **Modificar** — fetch desde `supabase.from('services')` |
| `src/views/BookingView.vue` | **Modificar** — insert en `appointments` |
| `src/views/FeedbackView.vue` | **Modificar** — insert/select desde `feedback` |
| `src/views/admin/AdminDashboardView.vue` | **Modificar** — KPIs desde consultas reales |
| `src/views/admin/AdminCalendarView.vue` | **Modificar** — citas desde `appointments` |
| `src/views/admin/AdminSpecialistsView.vue` | **Modificar** — CRUD desde `specialists` |
| `src/views/admin/AdminPromotionsView.vue` | **Modificar** — CRUD desde `promotions` |
| `src/views/admin/AdminFeedbackView.vue` | **Modificar** — feedback desde `feedback` |
| `src/views/admin/AdminSchedulesView.vue` | **Modificar** — horarios desde `schedules` |
| `src/components/organisms/AppHeader.vue` | **Modificar** — botón cerrar sesión |
| `src/layouts/AdminLayout.vue` | **Modificar** — botón cerrar sesión |

---

*Documento generado el 16 de junio de 2026*
