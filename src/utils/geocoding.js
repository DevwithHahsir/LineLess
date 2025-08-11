// Geocoding utility to convert latitude/longitude to address
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error("Geocoding request failed");
    }

    const data = await response.json();

    if (data && data.display_name) {
      return {
        fullAddress: data.display_name,
        formatted: formatAddress(data.address),
        raw: data,
      };
    } else {
      throw new Error("No address found for these coordinates");
    }
  } catch {
    // no console output per request
    return {
      fullAddress: `${latitude}, ${longitude}`,
      formatted: `Coordinates: ${latitude}, ${longitude}`,
      raw: null,
    };
  }
};

// Helper function to format address nicely
const formatAddress = (addressComponents) => {
  if (!addressComponents) return null;

  const parts = [];

  // Add house number and road
  if (addressComponents.house_number && addressComponents.road) {
    parts.push(`${addressComponents.house_number} ${addressComponents.road}`);
  } else if (addressComponents.road) {
    parts.push(addressComponents.road);
  }

  // Add neighborhood or suburb
  if (addressComponents.neighbourhood || addressComponents.suburb) {
    parts.push(addressComponents.neighbourhood || addressComponents.suburb);
  }

  // Add city
  if (
    addressComponents.city ||
    addressComponents.town ||
    addressComponents.village
  ) {
    parts.push(
      addressComponents.city ||
        addressComponents.town ||
        addressComponents.village
    );
  }

  // Add state/province
  if (addressComponents.state || addressComponents.province) {
    parts.push(addressComponents.state || addressComponents.province);
  }

  // Add country
  if (addressComponents.country) {
    parts.push(addressComponents.country);
  }

  return parts.join(", ");
};

// Alternative function for Google Maps API (if you have an API key)
export const getAddressFromGoogleMaps = async (latitude, longitude, apiKey) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return {
        fullAddress: data.results[0].formatted_address,
        formatted: data.results[0].formatted_address,
        raw: data.results[0],
      };
    } else {
      throw new Error("No address found");
    }
  } catch {
    // no console output per request
    return {
      fullAddress: `${latitude}, ${longitude}`,
      formatted: `Coordinates: ${latitude}, ${longitude}`,
      raw: null,
    };
  }
};
