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
        subject: "¡Gracias por tu Feedback! — Aura Luxe Salon",
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
        `,
      }),
    })

    return Response.json(await res.json(), { status: res.status })
  }),
}
