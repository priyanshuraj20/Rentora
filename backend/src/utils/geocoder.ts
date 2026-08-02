/**
 * Geocoding Utility for Rentora
 * Resolves address string (city/state/district) to GeoJSON coordinates [longitude, latitude]
 * using OpenStreetMap Nominatim API with Redis caching and graceful fallback.
 */

import { redisConnection } from "../config/redis";
import logger from "../config/logger";

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
};

export async function geocodeCityOrAddress(
  city?: string,
  state?: string,
  district?: string,
): Promise<{ coordinates: [number, number]; city?: string; state?: string; district?: string }> {
  const addressParts = [city?.trim(), district?.trim(), state?.trim(), "India"].filter(
    (part): part is string => Boolean(part && part.length > 0)
  );

  const query = addressParts.join(", ");
  const cacheKey = `geocode:${query.toLowerCase()}`;

  // 1. Try Redis cache if available
  try {
    const cached = await redisConnection.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        coordinates: parsed,
        city: city?.trim(),
        state: state?.trim(),
        district: district?.trim(),
      };
    }
  } catch (err) {
    // Non-blocking cache lookup error
  }

  // 2. Fetch from OpenStreetMap Nominatim API
  if (query) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&limit=1`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Rentora/1.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const lon = parseFloat(data[0].lon);
          const lat = parseFloat(data[0].lat);

          if (!isNaN(lon) && !isNaN(lat)) {
            const coords: [number, number] = [lon, lat];

            // Cache in Redis for 7 days
            redisConnection
              .set(cacheKey, JSON.stringify(coords), "EX", 7 * 24 * 60 * 60)
              .catch((err) => {
                logger.warn(`Failed to write geocode cache to Redis for '${query}': ${err}`);
              });

            return {
              coordinates: coords,
              city: city?.trim(),
              state: state?.trim(),
              district: district?.trim(),
            };
          }
        }
      } else {
        logger.warn(`Nominatim geocoding HTTP error ${response.status} for '${query}'`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      logger.warn(`Nominatim geocoding failed for '${query}': ${error}`);
    }
  }

  // 3. Fallback to local map lookup if Nominatim fails or returns no results
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

  // 4. Default fallback coordinates
  return {
    coordinates: [77.209, 28.6139],
    city: city?.trim() || district?.trim() || state?.trim() || "Local Area",
    state: state?.trim() || "",
    district: district?.trim() || "",
  };
}
