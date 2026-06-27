export function validateEmail(email: string): boolean {
  if (email.length > 255) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password must be under 128 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain a number";
  return null;
}

export function sanitizeInput(input: string, maxLength: number = 500): string {
  return input.trim().replace(/[<>]/g, "").slice(0, maxLength);
}

export function validateCoordinates(lat: unknown, lng: unknown): { valid: boolean; error?: string } {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return { valid: false, error: "Coordinates must be numbers" };
  }
  if (!isFinite(lat) || !isFinite(lng)) {
    return { valid: false, error: "Coordinates must be finite numbers" };
  }
  if (isNaN(lat) || isNaN(lng)) {
    return { valid: false, error: "Coordinates must not be NaN" };
  }
  if (lat < -90 || lat > 90) {
    return { valid: false, error: "Latitude must be between -90 and 90" };
  }
  if (lng < -180 || lng > 180) {
    return { valid: false, error: "Longitude must be between -180 and 180" };
  }
  return { valid: true };
}
