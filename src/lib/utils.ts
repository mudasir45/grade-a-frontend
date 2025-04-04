import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// utils/currencyConverter.ts

export type Currency = {
  id: string;
  name: string;
  cod: string;
  conversion_rate: string;
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
      `${process.env.NEXT_PUBLIC_API_URL}/shipping-rates/convert-currency/`,
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
