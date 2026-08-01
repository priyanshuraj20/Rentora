/**
 * Standardized Centralized Pricing Calculator for Rentora
 * Single Source of Truth for Subtotal, Platform Fee (10%), Owner Earnings, Tax, and Total Amount calculations.
 */

export const PLATFORM_FEE_PERCENT = 10;
export const PLATFORM_FEE_RATE = 0.1;

export interface PricingInput {
  baseRate: number;
  discountApplied?: number;
  securityDeposit?: number;
  serviceFee?: number;
  tax?: number;
  totalDays?: number;
}

export interface PricingResult {
  appliedPricing: "daily" | "weekly" | "monthly";
  baseRate: number;
  discountApplied: number;
  subtotal: number;
  platformFee: number;
  ownerEarning: number;
  securityDeposit: number;
  serviceFee: number;
  tax: number;
  totalAmount: number;
}

export function calculatePricing(input: PricingInput): PricingResult {
  const baseRate = Math.max(0, input.baseRate || 0);
  const discountApplied = Math.max(0, input.discountApplied || 0);
  const totalDays = Math.max(1, input.totalDays || 1);

  const appliedPricing =
    totalDays >= 30 ? "monthly" : totalDays >= 7 ? "weekly" : "daily";

  const subtotal = Math.max(0, baseRate - discountApplied);
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
  const ownerEarning = Math.max(0, subtotal - platformFee);

  const securityDeposit = Math.max(0, input.securityDeposit || 0);
  const serviceFee = Math.max(0, input.serviceFee || 0);
  const tax = Math.max(0, input.tax || 0);

  const totalAmount = subtotal + securityDeposit + serviceFee + tax;

  return {
    appliedPricing,
    baseRate,
    discountApplied,
    subtotal,
    platformFee,
    ownerEarning,
    securityDeposit,
    serviceFee,
    tax,
    totalAmount,
  };
}
