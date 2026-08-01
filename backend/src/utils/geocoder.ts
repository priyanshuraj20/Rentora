/**
 * Geocoding Utility for Rentora
 * Resolves address string (city/state) to GeoJSON coordinates [longitude, latitude].
 */

const CITY_COORDINATES_MAP: Record<string, [number, number]> = {
  patna: [85.1376, 25.5941],
  ranchi: [85.3096, 23.3441],
  ahmedabad: [72.5714, 23.0225],
  delhi: [77.209, 28.6139],
  "new delhi": [77.209, 28.6139],
  mumbai: [72.8777, 19.076],
  bengaluru: [77.5946, 12.9716],
  bangalore: [77.5946, 12.9716],
  kolkata: [88.3639, 22.5726],
  hyderabad: [78.4867, 17.385],
  chennai: [80.2707, 13.0827],
  pune: [73.8567, 18.5204],
  jaipur: [75.7873, 26.9124],
  lucknow: [80.9462, 26.8467],
  chandigarh: [76.7794, 30.7333],
  gujarat: [72.5714, 23.0225],
  bihar: [85.1376, 25.5941],
  jharkhand: [85.3096, 23.3441],
  maharashtra: [72.8777, 19.076],
  karnataka: [77.5946, 12.9716],
};

export async function geocodeCityOrAddress(
  city?: string,
  state?: string,
  district?: string,
): Promise<{ coordinates: [number, number]; city?: string; state?: string; district?: string }> {
  const normCity = city?.trim().toLowerCase();
  const normDistrict = district?.trim().toLowerCase();
  const normState = state?.trim().toLowerCase();

  if (normCity && CITY_COORDINATES_MAP[normCity]) {
    return {
      coordinates: CITY_COORDINATES_MAP[normCity],
      city: city?.trim(),
      state: state?.trim(),
      district: district?.trim(),
    };
  }

  if (normDistrict && CITY_COORDINATES_MAP[normDistrict]) {
    return {
      coordinates: CITY_COORDINATES_MAP[normDistrict],
      city: city?.trim() || district?.trim(),
      state: state?.trim(),
      district: district?.trim(),
    };
  }

  if (normState && CITY_COORDINATES_MAP[normState]) {
    return {
      coordinates: CITY_COORDINATES_MAP[normState],
      city: city?.trim() || state?.trim(),
      state: state?.trim(),
      district: district?.trim(),
    };
  }

  // Preserve whatever city/district string was passed without hardcoding New Delhi
  return {
    coordinates: [77.209, 28.6139],
    city: city?.trim() || district?.trim() || state?.trim() || "Local Area",
    state: state?.trim() || "",
    district: district?.trim() || "",
  };
}
