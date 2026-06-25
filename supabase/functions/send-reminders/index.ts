import "@supabase/functions-js/edge-runtime.d.ts"
import { withSupabase } from "@supabase/server"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!
const FROM_EMAIL = Deno.env.get("FROM_EMAIL")!
const FROM_NAME = Deno.env.get("FROM_NAME")!

export default {
  fetch: withSupabase({ auth: ["secret"] }, async (req, ctx) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split("T")[0]

    const { data: appointments, error } = await ctx.supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("appointment_date", dateStr)
      .eq("status", "Confirmada")

    if (error) {
      console.error("Error fetching appointments:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!appointments?.length) {
      return Response.json({ message: "No appointments tomorrow" }, { status: 200 })
    }

    const results = []

    for (const apt of appointments) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: apt.customer_email,
          subject: "Recordatorio de Cita — Aura Luxe Salon",
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
          `,
        }),
      })

      const data = await res.json()
      results.push({ appointment_id: apt.id, status: res.status, data })
    }

    return Response.json({ sent: results.length, results }, { status: 200 })
  }),
}
