import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'notifications@example.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { to, subject, html } = req.body as { to: string[]; subject: string; html: string }

    if (!to || to.length === 0) {
      return res.status(400).json({ error: 'missing to' })
    }

    const result = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    })

    return res.status(200).json({ id: result.data?.id })
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'unknown error' })
  }
}
