# Guía de Integración: Resend (Emails Transaccionales)

## Plan Gratuito de Resend

| Recurso | Límite Gratuito |
|---|---|
| Emails/día | 100 |
| Emails/mes | 3,000 |
| Destinatarios | 1 (solo tu email verificado) |
| Dominio | `resend.dev` (modo testing) |
| API Keys | Ilimitadas |

> **Para producción**: Plan **Pro** ($10/mes) — 50,000 emails/mes, dominio propio, attachments, analytics.

---

## Arquitectura

Como el proyecto es un frontend Vue 3 **sin backend propio**, los emails se envían mediante **Supabase Edge Functions** (Deno serverless), activadas por **Database Webhooks** cuando ocurren eventos en la DB:

```
[DB event] → Webhook HTTP → Edge Function (Resend SDK) → Email
```

También puedes invocar Edge Functions directamente desde el frontend tras una acción del usuario.

---

## 1. Configurar Resend

1. Ir a [resend.com](https://resend.com) y registrarte
2. Ir a **API Keys** → **Create API Key** → copiar la key (ej. `re_abc123`)
3. (Opcional) Ir a **Domains** → **Add Domain** para usar tu propio dominio en producción

---

## 2. Instalar Supabase CLI

```bash
# Instalar Supabase CLI global
npm i -g supabase

# Iniciar sesión con GitHub
supabase login

# Inicializar Supabase en el proyecto (si no existe)
supabase init
```

Esto crea la carpeta `supabase/` con `config.toml`.

---

## 3. Variables de Entorno

Agregar a `supabase/.env` (o usar `supabase secrets set`):

```
RESEND_API_KEY=re_abc123
FROM_EMAIL=onboarding@resend.dev
FROM_NAME=Aura Luxe Salon
```

En producción se setean con:

```bash
supabase secrets set RESEND_API_KEY=re_abc123
supabase secrets set FROM_EMAIL=onboarding@resend.dev
supabase secrets set FROM_NAME="Aura Luxe Salon"
```

---

## 4. Edge Functions — Casos de Uso

### 4.1 Confirmación de Cita

Se dispara al **insertar** una cita en `appointments`.

```bash
supabase functions new booking-confirmation
```

`supabase/functions/booking-confirmation/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL')!
const FROM_NAME = Deno.env.get('FROM_NAME')!

serve(async (req) => {
  const { record } = await req.json()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: record.customer_email,
      subject: 'Cita Confirmada — Aura Luxe Salon',
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #79542e;">¡Tu Cita Ha Sido Confirmada!</h2>
          <p>Hola <strong>${record.customer_name}</strong>,</p>
          <p>Tu cita en <strong>Aura Luxe Salon</strong> ha sido registrada exitosamente.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Especialista</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${record.specialist_name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Fecha</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${record.appointment_date}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Hora</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${record.appointment_time}</td>
            </tr>
          </table>
          <p style="color: #6b7280; font-size: 14px;">
            Si necesitas cancelar o reagendar, contáctanos al +52 55 1234 5678.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Aura Luxe Salon — Donde la belleza encuentra su verdadera expresión
          </p>
        </div>
      `
    })
  })

  const data = await res.json()
  console.log('Resend response:', data)
  return new Response(JSON.stringify(data), { status: res.status })
})
```

### 4.2 Cambio de Estado de Cita

Se dispara al **actualizar** `appointments.status`.

```bash
supabase functions new appointment-status-change
```

`supabase/functions/appointment-status-change/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL')!
const FROM_NAME = Deno.env.get('FROM_NAME')!

const statusMessages: Record<string, { subject: string; message: string }> = {
  Confirmada: {
    subject: 'Cita Confirmada — Aura Luxe Salon',
    message: 'Tu cita ha sido confirmada. ¡Te esperamos!'
  },
  Cancelada: {
    subject: 'Cita Cancelada — Aura Luxe Salon',
    message: 'Lamentamos informarte que tu cita ha sido cancelada. Contáctanos para reagendar.'
  },
  Completada: {
    subject: '¡Gracias por visitarnos! — Aura Luxe Salon',
    message: 'Gracias por tu visita. Esperamos que hayas tenido una experiencia increíble. Te invitamos a dejarnos tu feedback.'
  }
}

serve(async (req) => {
  const { record } = await req.json()
  const info = statusMessages[record.status]
  if (!info) return new Response('No action needed', { status: 200 })

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: record.customer_email,
      subject: info.subject,
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #79542e;">${info.subject}</h2>
          <p>Hola <strong>${record.customer_name}</strong>,</p>
          <p>${info.message}</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Servicio</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${record.service_name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Fecha</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${record.appointment_date}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Estado</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: ${record.status === 'Confirmada' ? '#16a34a' : record.status === 'Cancelada' ? '#dc2626' : '#2563eb'};">${record.status}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">Aura Luxe Salon</p>
        </div>
      `
    })
  })

  return new Response(JSON.stringify(await res.json()), { status: res.status })
})
```

### 4.3 Agradecimiento por Feedback

Se dispara al **insertar** en `feedback`.

```bash
supabase functions new feedback-thankyou
```

`supabase/functions/feedback-thankyou/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL')!
const FROM_NAME = Deno.env.get('FROM_NAME')!

serve(async (req) => {
  const { record } = await req.json()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: record.customer_email,
      subject: '¡Gracias por tu Feedback! — Aura Luxe Salon',
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #79542e;">¡Gracias por tu Opinión!</h2>
          <p>Hola <strong>${record.customer_name}</strong>,</p>
          <p>Tu opinión es muy importante para nosotros. Gracias por tomarte el tiempo de compartir tu experiencia en <strong>Aura Luxe Salon</strong>.</p>
          <p style="font-style: italic; color: #6b7280; border-left: 3px solid #79542e; padding-left: 16px; margin: 24px 0;">
            "${record.comment}"
          </p>
          <p>Tu calificación de <strong>${record.rating}/5</strong> nos ayuda a seguir mejorando.</p>
          <p style="color: #6b7280; font-size: 14px;">¡Esperamos verte pronto de nuevo!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">Aura Luxe Salon</p>
        </div>
      `
    })
  })

  return new Response(JSON.stringify(await res.json()), { status: res.status })
})
```

### 4.4 Bienvenida al Registrarse

Se dispara al **insertar** en `profiles`.

```bash
supabase functions new welcome-email
```

`supabase/functions/welcome-email/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL')!
const FROM_NAME = Deno.env.get('FROM_NAME')!

serve(async (req) => {
  const { record } = await req.json()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: record.email,
      subject: '¡Bienvenido a Aura Luxe Salon!',
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #79542e;">Bienvenido, ${record.full_name}!</h2>
          <p>Nos alegra tenerte en <strong>Aura Luxe Salon</strong>, donde la belleza encuentra su verdadera expresión.</p>
          <p>Con tu cuenta puedes:</p>
          <ul style="color: #374151; line-height: 2;">
            <li>✅ Reservar citas online</li>
            <li>⭐ Dejar feedback después de tu visita</li>
            <li>📅 Ver el historial de tus citas</li>
            <li>🎯 Recibir promociones exclusivas</li>
          </ul>
          <p>¿Listo para tu primera experiencia? <a href="https://tusitio.com/booking" style="color: #79542e; font-weight: bold;">Reserva tu cita aquí</a></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">Aura Luxe Salon</p>
        </div>
      `
    })
  })

  return new Response(JSON.stringify(await res.json()), { status: res.status })
})
```

---

## 5. Configurar Webhooks en Supabase

Cada Edge Function necesita un webhook que la dispare.

1. Ir a **Supabase Dashboard** → **Database** → **Webhooks**
2. Click **Create a webhook**
3. Configurar:

| Campo | Valor Ejemplo |
|---|---|
| **Name** | `booking-confirmation` |
| **Table** | `appointments` |
| **Events** | `Insert` |
| **Type** | `HTTP Request` |
| **HTTP Method** | `POST` |
| **URL** | `https://[project-ref].supabase.co/functions/v1/booking-confirmation` |
| **Headers** | `Authorization: Bearer [anon key]` (opcional si la función es pública) |
| **Condition** | `OLD.status IS DISTINCT FROM NEW.status` (solo para updates) |

Repetir para cada función.

---

## 6. Desplegar Edge Functions

```bash
# Desplegar todas las funciones
supabase functions deploy booking-confirmation
supabase functions deploy appointment-status-change
supabase functions deploy feedback-thankyou
supabase functions deploy welcome-email

# Setear secrets en producción
supabase secrets set RESEND_API_KEY=re_abc123
supabase secrets set FROM_EMAIL=onboarding@resend.dev
supabase secrets set FROM_NAME="Aura Luxe Salon"
```

---

## 7. Desarrollo Local

```bash
# Iniciar Supabase local
supabase start

# Servir funciones localmente (con hot-reload)
supabase functions serve booking-confirmation --env-file supabase/.env

# Probar con curl
curl -X POST http://localhost:54321/functions/v1/booking-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "table": "appointments",
    "record": {
      "customer_name": "María López",
      "customer_email": "tu-email@verificado.com",
      "specialist_name": "Elena Vargas",
      "appointment_date": "2026-07-01",
      "appointment_time": "10:00"
    }
  }'
```

> En plan gratuito de Resend, el email solo llega al destinatario que verificaste. Para pruebas, usa `tu-email@verificado.com` como `customer_email`.

---

## 8. Invocar Edge Function desde el Frontend (Alternativa a Webhooks)

Si prefieres enviar el email inmediatamente después de una acción del usuario (sin esperar el webhook), puedes llamar la Edge Function directamente desde Vue:

```typescript
// src/lib/email.ts
import { supabase } from './supabase'

export async function sendBookingConfirmation(bookingData: {
  customer_name: string
  customer_email: string
  specialist_name: string
  appointment_date: string
  appointment_time: string
}) {
  const { error } = await supabase.functions.invoke('booking-confirmation', {
    body: { record: bookingData }
  })
  if (error) console.error('Error sending email:', error)
}
```

Usarlo en `BookingView.vue` después de confirmar la cita:

```typescript
import { sendBookingConfirmation } from '@/lib/email'

const confirmBooking = async () => {
  // ... insertar cita en Supabase ...
  // ... si ok, enviar email ...
  await sendBookingConfirmation({
    customer_name: form.value.customerName,
    customer_email: user.value.email,
    specialist_name: selectedSpecialist.value.name,
    appointment_date: form.value.date,
    appointment_time: form.value.time
  })
}
```

---

## 9. Recordatorios Automáticos (Cron)

Para enviar recordatorios 24h antes de la cita, necesitas un **cron job** externo (Supabase no tiene scheduler nativo en el plan gratuito).

### Opción A: GitHub Actions

```yaml
# .github/workflows/reminder.yml
name: Send Appointment Reminders
on:
  schedule:
    - cron: '0 8 * * *'  # 8 AM todos los días

jobs:
  remind:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST https://[project].supabase.co/functions/v1/send-reminders \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

### Opción B: Edge Function + cron externo (cron-job.org)

Crea una función que busque citas para mañana y envíe recordatorios:

```bash
supabase functions new send-reminders
```

`supabase/functions/send-reminders/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL')!
const FROM_NAME = Deno.env.get('FROM_NAME')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toISOString().split('T')[0]

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('appointment_date', dateStr)
    .eq('status', 'Confirmada')

  if (!appointments?.length) return new Response('No appointments tomorrow', { status: 200 })

  for (const apt of appointments) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: apt.customer_email,
        subject: 'Recordatorio de Cita — Aura Luxe Salon',
        html: `
          <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #79542e;">Recordatorio de Cita</h2>
            <p>Hola <strong>${apt.customer_name}</strong>,</p>
            <p>Te recordamos que tienes una cita mañana:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Fecha</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${apt.appointment_date}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">Hora</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">${apt.appointment_time}</td>
              </tr>
            </table>
            <p style="color: #6b7280; font-size: 14px;">¡Te esperamos!</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">Aura Luxe Salon</p>
          </div>
        `
      })
    })
  }

  return new Response(`Sent ${appointments.length} reminders`, { status: 200 })
})
```

Luego programa un cron gratuito en [cron-job.org](https://cron-job.org) que haga GET a `https://[project].supabase.co/functions/v1/send-reminders` cada día a las 8 AM.

---

## 10. Ver Estado de los Emails

- **Resend Dashboard** → **Logs** → Ver estado de cada envío (delivered, bounced, opened)
- **Supabase Dashboard** → **Edge Functions** → **Invocations** → Ver logs de cada ejecución

---

## 11. Resumen de Archivos a Crear

| Archivo | Acción |
|---|---|
| `supabase/config.toml` | **Crear** — `supabase init` |
| `supabase/.env` | **Crear** — variables locales |
| `supabase/functions/booking-confirmation/index.ts` | **Crear** — email confirmación de cita |
| `supabase/functions/appointment-status-change/index.ts` | **Crear** — email cambio de estado |
| `supabase/functions/feedback-thankyou/index.ts` | **Crear** — email agradecimiento feedback |
| `supabase/functions/welcome-email/index.ts` | **Crear** — email de bienvenida |
| `supabase/functions/send-reminders/index.ts` | **Crear** — recordatorios (opcional) |
| `src/lib/email.ts` | **Crear** — wrapper para invocar desde frontend (opcional) |

---

## 12. Buenas Prácticas

1. **Nunca expongas la `RESEND_API_KEY`** en el frontend — siempre desde Edge Functions o backend
2. **Usa `service_role` key** en Edge Functions para operaciones administrativas (como `send-reminders`)
3. **Verifica tu dominio** en Resend antes de producción para mejor deliverability
4. **Monitorea los logs** de Resend para detectar rebotes o quejas de spam
5. **Rate limiting** — Resend gratuito permite 100 emails/día; suficiente para un salón pequeño
6. **Plantillas HTML** — usa tablas para compatibilidad con clientes de email (Outlook, etc.)
7. **Personaliza el `from`** — usa un nombre amigable como `"Aura Luxe Salon <no-reply@tudominio.com>"`
8. **Suscripción** — considera agregar un enlace de unsubscribe en campañas promocionales (no necesario para transaccionales)

---

*Documento generado el 24 de junio de 2026*
