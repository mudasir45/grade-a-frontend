import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

// utils/currencyConverter.ts

export type Currency = "USD" | "MYR" | "NGN";

// Conversion rates relative to USD
// (Pick an updated ratio so that 1 MYR ~ 352 NGN).
// For example, if 1 USD = 4.5 MYR, but 1 MYR = 352 NGN, then 1 USD would be 4.5 MYR => 4.5 * 352 NGN = 1584 NGN
const conversionRates: Record<Currency, number> = {
  //   USD: 1,
  // If 1 MYR = 352 NGN and 1 USD = 1584 NGN,
  // then 1 MYR is 1/4.5 of a USD => but we must keep them consistent.
  // Let's do it more directly:
  //   1 USD = 1584 NGN
  //   1 USD = 4.5 MYR
  // So, 1 MYR = 1584 / 4.5 = 352 NGN
  // But we need the value of MYR in terms of USD:
  //   1 MYR = 1 / 4.5 USD = 0.2222... USD
  //   1 NGN = 1 / 1584 USD = 0.00063... USD
  USD: 1,
  MYR: 0.2222, // (1 MYR = 0.2222 USD)
  NGN: 1 / 1584, // (1 NGN = ~0.0   0063 USD)
};

/**
 * Converts an amount from one currency to another.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (typeof amount !== "number" || isNaN(amount)) {
    throw new Error("Amount must be a valid number.");
  }

  const fromRate = conversionRates[fromCurrency];
  const toRate = conversionRates[toCurrency];

  if (fromRate === undefined || toRate === undefined) {
    throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
  }

  // Convert amount to USD, then from USD to target currency.
  const amountInUSD = amount * fromRate;
  return amountInUSD / toRate;
}
