import "@supabase/functions-js/edge-runtime.d.ts"
import { withSupabase } from "@supabase/server"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const FROM_EMAIL = Deno.env.get("FROM_EMAIL")!
const FROM_NAME = Deno.env.get("FROM_NAME")!

const STATUS_MESSAGES: Record<string, { subject: string; message: string }> = {
  Confirmada: {
    subject: "Cita Confirmada — Aura Luxe Salon",
    message: "Tu cita ha sido confirmada. ¡Te esperamos!",
  },
  Cancelada: {
    subject: "Cita Cancelada — Aura Luxe Salon",
    message:
      "Lamentamos informarte que tu cita ha sido cancelada. Contáctanos para reagendar.",
  },
  Completada: {
    subject: "¡Gracias por visitarnos! — Aura Luxe Salon",
    message:
      "Gracias por tu visita. Esperamos que hayas tenido una experiencia increíble. Te invitamos a dejarnos tu feedback.",
  },
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req) => {
    const { record } = await req.json()
    const info = STATUS_MESSAGES[record.status]
    if (!info) {
      return Response.json({ message: "No action needed" }, { status: 200 })
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
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
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: ${record.status === "Confirmada" ? "#16a34a" : record.status === "Cancelada" ? "#dc2626" : "#2563eb"};">${record.status}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">Aura Luxe Salon</p>
          </div>
        `,
      }),
    })

    return Response.json(await res.json(), { status: res.status })
  }),
}
