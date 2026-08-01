import { Resend } from "resend";
import nodemailer from "nodemailer";
import { AppError } from "./AppError";
import logger from "@config/logger";
import { env } from "@config/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(env.SMTP_PORT || process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: env.SMTP_USER || process.env.SMTP_USER,
    pass: env.SMTP_PASS || process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = env.MAIL_USER || process.env.MAIL_USER || "onboarding@resend.dev";
const FROM_NAME = "Rentora";

export const sendOTP = async (email: string, otp: string) => {
  const subject = `${otp} is your Rentora verification code`;
  const html = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2D3436; margin: 0; font-size: 24px;">Rentora</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="color: #636e72; font-size: 16px; margin-bottom: 10px;">Verification Code</p>
        <h2 style="color: #0984e3; font-size: 36px; font-weight: bold; margin: 10px 0; letter-spacing: 5px;">${otp}</h2>
        <p style="color: #b2bec3; font-size: 12px;">This code expires in <strong>10 minutes</strong>.</p>
    </div>
    <p style="color: #636e72; font-size: 14px; margin-top: 20px; line-height: 1.5;">
        If you didn't request this, please ignore this email or contact support if you have concerns.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #b2bec3; font-size: 11px; text-align: center;">
        © ${new Date().getFullYear()} Rentora. All rights reserved.
    </p>
</div>
`;

  // 1. Try Resend if configured
  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL.includes("@") ? FROM_EMAIL : "onboarding@resend.dev"}>`,
        to: email,
        subject,
        html,
      });

      if (!error) {
        logger.info("OTP sent successfully via Resend", { email });
        return;
      }
      logger.warn("Resend rejected the email, trying Nodemailer fallback", { email, error });
    } catch (err) {
      logger.warn("Resend exception, trying Nodemailer fallback", { email, error: err });
    }
  }

  // 2. Fallback to Nodemailer SMTP
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject,
      html,
    });
    logger.info("OTP sent successfully via Nodemailer SMTP", { email });
  } catch (error) {
    logger.error("Unable to send OTP via Resend or Nodemailer SMTP", { email, error });
    throw new AppError("Unable to send OTP. Please check email configuration.", 500);
  }
};

export const cancellationEmail = async (email: string, bookingId: string) => {
  const subject = `Booking Cancellation Notification`;
  const html = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2D3436; margin: 0; font-size: 24px;">Rentora</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="color: #636e72; font-size: 16px; margin-bottom: 10px;">Booking Cancellation Notification</p>
        <p style="color: #b2bec3; font-size: 12px;">Your booking with ID ${bookingId} has been cancelled.</p>
    </div>
    <p style="color: #636e72; font-size: 14px; margin-top: 20px; line-height: 1.5;">
        If you have any questions or need assistance, please contact our support team.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #b2bec3; font-size: 11px; text-align: center;">
        © ${new Date().getFullYear()} Rentora. All rights reserved.
    </p>
</div>
`;

  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL.includes("@") ? FROM_EMAIL : "onboarding@resend.dev"}>`,
        to: email,
        subject,
        html,
      });

      if (!error) return;
    } catch (err) {
      logger.warn("Resend cancellation email exception", { email, error: err });
    }
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    logger.error("Unable to send cancellation email", { email, error });
  }
};

export const acceptedBookingEmail = async (email: string, bookingId: string) => {
  const subject = `Booking Accepted Notification`;
  const html = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2D3436; margin: 0; font-size: 24px;">Rentora</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center;">
        <p style="color: #636e72; font-size: 16px; margin-bottom: 10px;">Booking Accepted Notification</p>
        <p style="color: #b2bec3; font-size: 12px;">Your booking with ID ${bookingId} has been accepted.</p>
    </div>
    <p style="color: #636e72; font-size: 14px; margin-top: 20px; line-height: 1.5;">
        If you have any questions or need assistance, please contact our support team.
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #b2bec3; font-size: 11px; text-align: center;">
        © ${new Date().getFullYear()} Rentora. All rights reserved.
    </p>
</div>
`;

  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL.includes("@") ? FROM_EMAIL : "onboarding@resend.dev"}>`,
        to: email,
        subject,
        html,
      });

      if (!error) return;
    } catch (err) {
      logger.warn("Resend accepted email exception", { email, error: err });
    }
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    logger.error("Unable to send accepted-booking email", { email, error });
  }
};
