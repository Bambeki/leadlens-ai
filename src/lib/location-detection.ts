export interface DetectedLocation {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
}

const REGIONAL_CITIES: {
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
}[] = [
  { city: "Giessen", region: "Hesse", country: "Germany", lat: 50.5873, lng: 8.6755 },
  { city: "Marburg", region: "Hesse", country: "Germany", lat: 50.8099, lng: 8.7707 },
  { city: "Wetzlar", region: "Hesse", country: "Germany", lat: 50.5531, lng: 8.5047 },
  { city: "Frankfurt", region: "Hesse", country: "Germany", lat: 50.1109, lng: 8.6821 },
  { city: "Kassel", region: "Hesse", country: "Germany", lat: 51.3127, lng: 9.4797 },
  { city: "Fulda", region: "Hesse", country: "Germany", lat: 50.5558, lng: 9.6808 },
  { city: "Limburg", region: "Hesse", country: "Germany", lat: 50.3836, lng: 8.0503 },
  { city: "Darmstadt", region: "Hesse", country: "Germany", lat: 49.8728, lng: 8.6512 },
];

function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function reverseGeocode(latitude: number, longitude: number): DetectedLocation {
  let nearest = REGIONAL_CITIES[0];
  let minDist = Infinity;

  for (const c of REGIONAL_CITIES) {
    const d = distanceKm(latitude, longitude, c.lat, c.lng);
    if (d < minDist) {
      minDist = d;
      nearest = c;
    }
  }

  return {
    latitude,
    longitude,
    city: nearest.city,
    region: nearest.region,
    country: nearest.country,
  };
}

export type GeolocationResult =
  | { ok: true; location: DetectedLocation }
  | { ok: false; error: string };

export function requestUserLocation(): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({
        ok: false,
        error: "Geolocation is not supported in this browser. Enter your city manually below.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({
          ok: true,
          location: reverseGeocode(latitude, longitude),
        });
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "Location access was denied. Enter your city manually below.",
          2: "Could not determine your position. Check your connection and try again, or enter your city manually.",
          3: "Location request timed out. Try again or enter your city manually.",
        };
        resolve({
          ok: false,
          error: messages[err.code] ?? "Could not detect your location. Enter your city manually below.",
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}
