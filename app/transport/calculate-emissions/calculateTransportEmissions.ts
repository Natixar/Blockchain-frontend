// Define types for the transport segment
type TransportType = 'truck' | 'train' | 'ship' | 'airship' | 'barge';
type EnergyType = 'diesel' | 'electricity' | 'cng' | 'lng' | 'biofuel' | 'hfo' | 'mdo' | 'jetfuel';

interface TransportSegment {
  transportType: TransportType;
  energyType: EnergyType;
  from: string;
  to: string;
}

// Define the structure of the emission factors object
type EmissionFactor = Partial<Record<EnergyType, number>>;

// https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024
// https://ghgprotocol.org/Third-Party-Databases/IPCC-Emissions-Factor-Database
// https://ourworldindata.org/co2-emissions-from-transport
// https://www.iea.org/data-and-statistics/charts/transport-sector-co2-emissions-by-mode-in-the-sustainable-development-scenario-2000-2030
// https://www.epa.gov/smartway
// https://www.eea.europa.eu/en

// Define the structure of the emission factors object
const emissionFactors: Record<TransportType, EmissionFactor> = {
  truck: {
    diesel: 0.060,  // Road Truck using Diesel
    electricity: 0.015,  // Electric Road Truck
    cng: 0.049,  // Compressed Natural Gas (CNG) Road Truck
    lng: 0.035,  // Liquefied Natural Gas (LNG) Road Truck
    biofuel: 0.040,  // Biofuel Road Truck
  },
  train: {
    diesel: 0.027,  // Freight Train using Diesel
    electricity: 0.006,  // Electric Freight Train
  },
  ship: {
    hfo: 0.015,  // Ship using Heavy Fuel Oil (HFO)
    lng: 0.007,  // Ship using Liquefied Natural Gas (LNG)
    mdo: 0.018,  // Ship using Marine Diesel Oil (MDO)
  },
  airship: {
    jetfuel: 0.19,  // Merchant Aviation using Jet Fuel
  },
  barge: {
    diesel: 0.030,  // Inland Waterways Barge using Diesel
  }
};

export default async function calculateTransportEmissions(segments: TransportSegment[], loadCarried: number) {
  try {
    const segmentEmissionsPromises = segments.map(async (segment) => {
      const { transportType, energyType, from, to } = segment;

      if (!emissionFactors[transportType] || !emissionFactors[transportType][energyType]) {
        throw new Error(`Emission factor not found for ${transportType} with ${energyType}`);
      }

      const distance = await getDistance(from, to);
      const emissionFactor = emissionFactors[transportType][energyType]!;
      const segmentEmissions = distance * (loadCarried / 1000) * emissionFactor;
      return segmentEmissions;
    });

    // Wait for all segment emissions calculations to finish
    const segmentEmissions = await Promise.all(segmentEmissionsPromises);
    // Sum all the emissions
    const totalEmissions = segmentEmissions.reduce((total, emissions) => total + emissions, 0);
    return totalEmissions;
  } catch (error) {
    throw error;
  }
}

// Haversine formula function (calculating great-circle distance)
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Function to get road distance using Distance Matrix API
async function getRoadDistance(from: string, to: string): Promise<number | null> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(from)}&destinations=${encodeURIComponent(to)}&key=${process.env.GOOGLE_MAPS_API_KEY}&mode=driving`
  );
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (data.rows[0].elements[0].status === 'ZERO_RESULTS') {
    return null; // No road route available, will fall back to haversine
  }
  return data.rows[0].elements[0].distance.value / 1000; // Return distance in kilometers
}

// Function to get latitude and longitude using Geocoding API
async function getCoordinates(address: string): Promise<{ lat: number, lng: number }> {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  );
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (data.results.length === 0) {
    throw new Error(`No coordinates found for address: ${address}`);
  }
  return data.results[0].geometry.location; // Return {lat, lng}
}

async function getDistance(from: string, to: string) {
  try {
    const roadDistance = await getRoadDistance(from, to);
    if (roadDistance !== null) {
      return roadDistance;
    }

    // Fallback to Haversine if no road route is found

    // Get coordinates for both locations using Geocoding API
    const fromCoords = await getCoordinates(from);
    const toCoords = await getCoordinates(to);

    // Calculate distance using Haversine formula
    const haversineDist = haversineDistance(
      fromCoords.lat,
      fromCoords.lng,
      toCoords.lat,
      toCoords.lng
    );
    return haversineDist;
  } catch (error) {
    console.error("Error calculating distance:", error);
    throw error;
  }
}