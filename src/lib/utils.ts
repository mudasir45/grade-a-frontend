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
export async function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<number> {
  if (typeof amount !== "number" || isNaN(amount)) {
    throw new Error("Amount must be a valid number.");
  }
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/shipping-rates/convert-currency/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_currency: fromCurrency,
          from_amount: amount,
          to_currency: toCurrency,
        }),
      }
    );

    if (!response.ok) {
      let errorMsg = `API request failed with status ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMsg += `: ${errorData.message}`;
        }
      } catch {
        // If parsing the error response fails, ignore and use the default message.
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();

    let convertedAmount: number | undefined;

    // Check if data is an object and if it contains a conversion result.
    if (typeof data === "object" && data !== null) {
      if ("convertedAmount" in data) {
        convertedAmount = Number(data.convertedAmount);
      } else if ("converted_amount" in data) {
        convertedAmount = Number(data.converted_amount);
      }
    } else if (typeof data === "number") {
      convertedAmount = data;
    } else if (typeof data === "string") {
      convertedAmount = Number(data);
    }

    if (typeof convertedAmount !== "number" || isNaN(convertedAmount)) {
      throw new Error("Invalid conversion result from API");
    }

    return convertedAmount;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error converting currency: ${error.message}`);
    }
    throw new Error("An unknown error occurred during currency conversion");
  }
}
