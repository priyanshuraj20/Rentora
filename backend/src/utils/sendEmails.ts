import nodemailer from "nodemailer";
import { AppError } from "./AppError";
import { logger } from "@sentry/node";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTP = async (email: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: `"Rentora" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `${otp} is your Rentora verification code`,
      html: `
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
`,
    });
  } catch (error) {
    logger.error("Unable to send OTP", { email, error });
    throw new AppError("Unable to send OTP", 500);
  }
};

export const cancellationEmail = async (email: string, bookingId: string) => {
  try {
    await transporter.sendMail({
      from: `"Rentora" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Booking Cancellation Notification`,
      html: `
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
            `,
    });
  } catch (error) {
    throw new AppError("Unable to send cancellation email", 500);
  }
};

export const acceptedBookingEmail = async (
  email: string,
  bookingId: string,
) => {
  try {
    await transporter.sendMail({
      from: `"Rentora" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Booking Accepted Notification`,
      html: `
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
            `,
    });
  } catch (error) {
    throw new AppError("Unable to send cancellation email", 500);
  }
};
