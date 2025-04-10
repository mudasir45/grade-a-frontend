import { Country } from "@/lib/types/index";
import { useEffect, useState } from "react";

interface ServiceType {
  id: string;
  name: string;
  description: string;
  delivery_time: string;
  is_active: boolean;
}

interface ShippingZone {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface ShippingData {
  departureCountries: Country[];
  destinationCountries: Country[];
  serviceTypes: ServiceType[];
  shippingZones: ShippingZone[];
  isLoading: boolean;
  error: Error | null;
  dataLoaded: boolean;
}

const useShippingData = () => {
  const [shippingData, setShippingData] = useState<ShippingData>({
    departureCountries: [],
    destinationCountries: [],
    serviceTypes: [],
    shippingZones: [],
    isLoading: true,
    error: null,
    dataLoaded: false,
  });

  const fetchData = async () => {
    // Skip fetching if data is already loaded
    if (shippingData.dataLoaded) {
      return;
    }

    try {
      // Fetch all data in parallel
      const [
        departureResponse,
        destinationResponse,
        serviceTypesResponse,
        zonesResponse,
      ] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shipping-rates/countries?country_type=DEPARTURE`
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shipping-rates/countries?country_type=DESTINATION`
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shipping-rates/service-types/`
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/shipping-rates/shipping-zones/`
        ),
      ]);

      const [departureData, destinationData, serviceTypesData, zonesData] =
        await Promise.all([
          departureResponse.json(),
          destinationResponse.json(),
          serviceTypesResponse.json(),
          zonesResponse.json(),
        ]);

      setShippingData({
        departureCountries: departureData.results || [],
        destinationCountries: destinationData.results || [],
        serviceTypes: serviceTypesData.results || [],
        shippingZones: zonesData.results || [],
        isLoading: false,
        error: null,
        dataLoaded: true,
      });
    } catch (error) {
      setShippingData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error("An error occurred"),
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    setShippingData((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      dataLoaded: false,
    }));
    fetchData();
  };

  return {
    ...shippingData,
    refetch,
  };
};

export default useShippingData;
