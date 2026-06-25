import "@supabase/functions-js/edge-runtime.d.ts"
import { withSupabase } from "@supabase/server"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const FROM_EMAIL = Deno.env.get("FROM_EMAIL")!
const FROM_NAME = Deno.env.get("FROM_NAME")!

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req) => {
    const { record } = await req.json()

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: record.email,
        subject: "¡Bienvenido a Aura Luxe Salon!",
        html: `
          <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #79542e;">¡Bienvenido, ${record.full_name}!</h2>
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
        `,
      }),
    })

    return Response.json(await res.json(), { status: res.status })
  }),
}
