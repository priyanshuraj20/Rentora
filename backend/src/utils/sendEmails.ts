import { Resend } from "resend";
import { AppError } from "./AppError";
import logger from "@config/logger";
import { env } from "@config/env";

const resend = new Resend(env.RESEND_API_KEY);

const FROM = "RentItRight <onboarding@resend.dev>";

export const sendOTP = async (email: string, otp: string) => {
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: `${otp} is your RentItRight verification code`,
      html: `...`,
    });

    if (error) {
      logger.error("Resend rejected the email", { email, error });
      throw new AppError("Unable to send OTP", 500);
    }
  } catch (error) {
    logger.error("Unable to send OTP", { email, error });
    throw new AppError("Unable to send OTP", 500);
  }
};


export const cancellationEmail = async (email: string, bookingId: string) => {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Booking Cancellation Notification`,
      html: `<div>Booking ${bookingId} cancelled.</div>`,
    });
  } catch (error) {
    logger.error("Unable to send cancellation email", { email, error });
    throw new AppError("Unable to send cancellation email", 500);
  }
};

export const acceptedBookingEmail = async (
  email: string,
  bookingId: string,
) => {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Booking Accepted Notification`,
      html: `<div>Booking ${bookingId} accepted.</div>`,
    });
  } catch (error) {
    logger.error("Unable to send accepted-booking email", { email, error });
    throw new AppError("Unable to send cancellation email", 500);
  }
};
