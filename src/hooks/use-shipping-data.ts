import { useEffect, useState } from 'react';

interface Country {
  id: string;
  name: string;
  code: string;
  country_type: 'DEPARTURE' | 'DESTINATION';
  is_active: boolean;
}

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
}

const useShippingData = () => {
  const [shippingData, setShippingData] = useState<ShippingData>({
    departureCountries: [],
    destinationCountries: [],
    serviceTypes: [],
    shippingZones: [],
    isLoading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      // Fetch all data in parallel
      const [departureResponse, destinationResponse, serviceTypesResponse, zonesResponse] = 
        await Promise.all([
          fetch('http://127.0.0.1:8000/api/shipping-rates/countries?country_type=DEPARTURE'),
          fetch('http://127.0.0.1:8000/api/shipping-rates/countries?country_type=DESTINATION'),
          fetch('http://127.0.0.1:8000/api/shipping-rates/service-types/'),
          fetch('http://127.0.0.1:8000/api/shipping-rates/shipping-zones/')
        ]);

      const [departureData, destinationData, serviceTypesData, zonesData] = 
        await Promise.all([
          departureResponse.json(),
          destinationResponse.json(),
          serviceTypesResponse.json(),
          zonesResponse.json()
        ]);

      setShippingData({
        departureCountries: departureData.results,
        destinationCountries: destinationData.results,
        serviceTypes: serviceTypesData.results,
        shippingZones: zonesData.results,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setShippingData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('An error occurred'),
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    setShippingData(prev => ({ ...prev, isLoading: true, error: null }));
    fetchData();
  };

  return {
    ...shippingData,
    refetch,
  };
};

export default useShippingData;