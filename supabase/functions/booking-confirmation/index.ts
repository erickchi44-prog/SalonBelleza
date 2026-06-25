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
        to: record.customer_email,
        subject: "Cita Confirmada — Aura Luxe Salon",
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
        `,
      }),
    })

    const data = await res.json()
    console.log("Resend response:", data)
    return Response.json(data, { status: res.status })
  }),
}
