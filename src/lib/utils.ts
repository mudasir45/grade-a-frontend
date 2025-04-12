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
  code: string;
  conversion_rate: string;
};

/**
 * Converts an amount from one currency to another.
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
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

/**
 * Safely gets the currency code from a country object
 * @param country - The country object which may have a currency property
 * @param defaultCode - Default currency code to return if country or currency is null/undefined
 * @returns The currency code or default value
 */
export function getCurrencyCode(
  country: any,
  defaultCode: string = "MYR"
): string {
  if (!country) return defaultCode;
  if (!country.currency) return defaultCode;
  return country.currency.code || defaultCode;
}

/**
 * Gets the currency code for a specific country ID from a list of countries
 * @param countryId - The ID of the country to find
 * @param countries - Array of country objects to search in
 * @param defaultCode - Default currency code to return if country not found or currency is null
 * @returns The currency code or default value
 */
export function getCountryCurrencyCode(
  countryId: string,
  countries: any[],
  defaultCode: string = "MYR"
): string {
  if (!countryId || !countries || !Array.isArray(countries)) {
    return defaultCode;
  }

  const country = countries.find((c) => c.id === countryId);
  return getCurrencyCode(country, defaultCode);
}

/**
 * Gets the country name for a specific country ID
 * @param countryId - The ID of the country to find
 * @param countries - Array of country objects to search in
 * @param defaultValue - Default value to return if country not found
 * @returns The country name or default value
 */
export function getCountryNameById(
  countryId: string | undefined,
  countries: any[],
  defaultValue: string = "Unknown"
): string {
  if (!countryId || !countries || !Array.isArray(countries)) {
    return defaultValue;
  }

  const country = countries.find((c) => c.id === countryId);
  return country?.name || defaultValue;
}

/**
 * Gets the city name for a specific city ID
 * @param cityId - The ID of the city to find
 * @param cities - Array of city objects to search in
 * @param defaultValue - Default value to return if city not found
 * @returns The city name or default value
 */
export function getCityNameById(
  cityId: string | undefined | { name: string },
  cities: any[],
  defaultValue: string = "Unknown"
): string {
  if (!cityId) {
    return defaultValue;
  }

  if (!cities || !Array.isArray(cities)) {
    return defaultValue;
  }

  // If cityId is already an object with a name property, return it
  if (typeof cityId === "object" && cityId !== null && "name" in cityId) {
    return cityId.name || defaultValue;
  }

  const city = cities.find((c) => c.id === cityId);
  return city?.name || defaultValue;
}

/**
 * Gets the service type name for a specific service type ID
 * @param serviceTypeId - The ID of the service type to find
 * @param serviceTypes - Array of service type objects to search in
 * @param defaultValue - Default value to return if service type not found
 * @returns The service type name or default value
 */
export function getServiceTypeNameById(
  serviceTypeId: string | undefined,
  serviceTypes: any[],
  defaultValue: string = "Unknown"
): string {
  if (!serviceTypeId || !serviceTypes || !Array.isArray(serviceTypes)) {
    return defaultValue;
  }

  const serviceType = serviceTypes.find((s) => s.id === serviceTypeId);
  return serviceType?.name || defaultValue;
}

// Function to fetch country data from API
export async function fetchCountries(): Promise<any[]> {
  try {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/shipping-rates/countries/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }

    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
}

// Function to fetch cities data from API
export async function fetchCities(): Promise<any[]> {
  try {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/accounts/cities/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch cities");
    }

    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

// Function to fetch service types data from API
export async function fetchServiceTypes(): Promise<any[]> {
  try {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/shipping-rates/service-types/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch service types");
    }

    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error("Error fetching service types:", error);
    return [];
  }
}

export const PercentageCharge = (
  total_cost: number,
  percentage_value: number
) => {
  return (total_cost * percentage_value) / 100;
};
