/**
 * Email notification system using SMTP (nodemailer)
 * Sends transactional emails for order lifecycle events
 *
 * Configure with environment variables:
 * - SMTP_HOST (e.g., mail.lh.pl)
 * - SMTP_PORT (e.g., 587)
 * - SMTP_USER (your email)
 * - SMTP_PASS (your password)
 * - SMTP_FROM (sender address, e.g., "Santa <santa@yourdomain.com>")
 */

import nodemailer from 'nodemailer'

// Lazy-load transporter to avoid build-time errors
let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || 'Mikołaj <mikolaj@magiaswiat.pl>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://santapl-production.up.railway.app'

interface OrderEmailData {
  orderId: string
  customerEmail: string
  childrenNames: string[]
}

/**
 * Send email when order is confirmed (payment received)
 */
export async function sendOrderConfirmedEmail(data: OrderEmailData): Promise<boolean> {
  const smtp = getTransporter()
  if (!smtp) {
    console.log('[Email] SMTP not configured, skipping email')
    return false
  }

  const childrenText = data.childrenNames.length === 1
    ? data.childrenNames[0]
    : data.childrenNames.length === 2
      ? `${data.childrenNames[0]} and ${data.childrenNames[1]}`
      : `${data.childrenNames.slice(0, -1).join(', ')}, and ${data.childrenNames[data.childrenNames.length - 1]}`

  try {
    await smtp.sendMail({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Creating Santa's magical video for ${childrenText}!`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Georgia', serif; background-color: #1a1a2e; color: #ffffff; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f3460 0%, #16213e 100%); border-radius: 20px; padding: 40px; border: 2px solid #c9a227;">

    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #c9a227; font-size: 32px; margin: 0;">Magia Świąt</h1>
      <p style="color: #e8d5b7; font-size: 14px; margin-top: 5px;">Spersonalizowane Wideo od Mikołaja</p>
    </div>

    <div style="background: rgba(201, 162, 39, 0.1); border-radius: 15px; padding: 25px; margin-bottom: 25px;">
      <h2 style="color: #ffffff; margin-top: 0;">Ho Ho Ho!</h2>
      <p style="color: #e8d5b7; line-height: 1.8; font-size: 16px;">
        Santa has received your order and is now creating a magical personalized video for <strong style="color: #c9a227;">${childrenText}</strong>!
      </p>
      <p style="color: #e8d5b7; line-height: 1.8; font-size: 16px;">
        Nasze elfy w warsztacie Mikołaja pracują nad Twoim filmem. To zwykle trwa około <strong>10-15 minut</strong>.
      </p>
    </div>

    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 20px; margin-bottom: 25px;">
      <h3 style="color: #c9a227; margin-top: 0;">What happens next?</h3>
      <ul style="color: #e8d5b7; line-height: 2; padding-left: 20px;">
        <li>Santa is filming your personalized video</li>
        <li>Magic is being added to each scene</li>
        <li>You'll receive another email when it's ready</li>
        <li>Share the magic with your little ones!</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${APP_URL}/order/${data.orderId}/success"
         style="display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #d4af37 100%); color: #1a1a2e; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px;">
        Check Video Status
      </a>
    </div>

    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(201, 162, 39, 0.3);">
      <p style="color: #888; font-size: 12px; margin: 0;">
        Order ID: ${data.orderId}<br>
        Magia Świąt - Spersonalizowane Wideo od Mikołaja<br>
        Stworzone z miłością
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })

    console.log(`[Email] Order confirmed email sent to ${data.customerEmail}`)
    return true
  } catch (error) {
    console.error('[Email] Failed to send order confirmed email:', error)
    return false
  }
}

/**
 * Send email when video is ready
 */
export async function sendVideoReadyEmail(data: OrderEmailData & { videoUrl: string }): Promise<boolean> {
  const smtp = getTransporter()
  if (!smtp) {
    console.log('[Email] SMTP not configured, skipping email')
    return false
  }

  const childrenText = data.childrenNames.length === 1
    ? data.childrenNames[0]
    : data.childrenNames.length === 2
      ? `${data.childrenNames[0]} and ${data.childrenNames[1]}`
      : `${data.childrenNames.slice(0, -1).join(', ')}, and ${data.childrenNames[data.childrenNames.length - 1]}`

  try {
    await smtp.sendMail({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Santa's video for ${childrenText} is ready!`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Georgia', serif; background-color: #1a1a2e; color: #ffffff; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f3460 0%, #16213e 100%); border-radius: 20px; padding: 40px; border: 2px solid #c9a227;">

    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #c9a227; font-size: 32px; margin: 0;">It's Ready!</h1>
      <p style="color: #e8d5b7; font-size: 14px; margin-top: 5px;">Magia Świąt - Spersonalizowane Wideo od Mikołaja</p>
    </div>

    <div style="background: rgba(201, 162, 39, 0.1); border-radius: 15px; padding: 25px; margin-bottom: 25px;">
      <h2 style="color: #ffffff; margin-top: 0;">Ho Ho Ho! Great news!</h2>
      <p style="color: #e8d5b7; line-height: 1.8; font-size: 16px;">
        Santa's magical video for <strong style="color: #c9a227;">${childrenText}</strong> is now ready to watch!
      </p>
      <p style="color: #e8d5b7; line-height: 1.8; font-size: 16px;">
        To chwila, której nigdy nie zapomną. Mikołaj przyleciał specjalnie dla nich z Bieguna Północnego!
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/order/${data.orderId}/success"
         style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: #ffffff; padding: 20px 50px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);">
        Watch Santa's Video
      </a>
    </div>

    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 20px; margin-bottom: 25px;">
      <h3 style="color: #c9a227; margin-top: 0;">Tips for the best experience:</h3>
      <ul style="color: #e8d5b7; line-height: 2; padding-left: 20px;">
        <li>Watch it together as a family</li>
        <li>Maybe dim the lights for extra magic</li>
        <li>Have your camera ready to capture their reaction!</li>
        <li>You can download and keep the video forever</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(201, 162, 39, 0.3);">
      <p style="color: #888; font-size: 12px; margin: 0;">
        Order ID: ${data.orderId}<br>
        Magia Świąt - Spersonalizowane Wideo od Mikołaja<br>
        Wesołych Świąt!
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })

    console.log(`[Email] Video ready email sent to ${data.customerEmail}`)
    return true
  } catch (error) {
    console.error('[Email] Failed to send video ready email:', error)
    return false
  }
}

/**
 * Send email when video generation fails
 */
export async function sendVideoFailedEmail(data: OrderEmailData & { errorMessage?: string }): Promise<boolean> {
  const smtp = getTransporter()
  if (!smtp) {
    console.log('[Email] SMTP not configured, skipping email')
    return false
  }

  try {
    await smtp.sendMail({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Issue with your Santa video order`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Georgia', serif; background-color: #1a1a2e; color: #ffffff; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f3460 0%, #16213e 100%); border-radius: 20px; padding: 40px; border: 2px solid #c9a227;">

    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #c9a227; font-size: 32px; margin: 0;">Oh no!</h1>
    </div>

    <div style="background: rgba(231, 76, 60, 0.1); border-radius: 15px; padding: 25px; margin-bottom: 25px; border: 1px solid rgba(231, 76, 60, 0.3);">
      <h2 style="color: #ffffff; margin-top: 0;">We hit a small snag</h2>
      <p style="color: #e8d5b7; line-height: 1.8; font-size: 16px;">
        Santa's elves encountered an issue while creating your magical video. Don't worry - we're on it!
      </p>
      <p style="color: #e8d5b7; line-height: 1.8; font-size: 16px;">
        Our team has been notified and we'll either retry automatically or reach out to you personally.
      </p>
    </div>

    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 20px; margin-bottom: 25px;">
      <h3 style="color: #c9a227; margin-top: 0;">What we're doing:</h3>
      <ul style="color: #e8d5b7; line-height: 2; padding-left: 20px;">
        <li>Attempting to regenerate your video</li>
        <li>Our team is reviewing the issue</li>
        <li>We'll update you within 24 hours</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #e8d5b7;">
        Questions? Reply to this email and we'll help right away.
      </p>
    </div>

    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(201, 162, 39, 0.3);">
      <p style="color: #888; font-size: 12px; margin: 0;">
        Order ID: ${data.orderId}<br>
        Magia Świąt - Spersonalizowane Wideo od Mikołaja
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })

    console.log(`[Email] Video failed email sent to ${data.customerEmail}`)
    return true
  } catch (error) {
    console.error('[Email] Failed to send video failed email:', error)
    return false
  }
}
