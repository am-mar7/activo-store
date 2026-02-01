// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFriendlyErrorMessage(error: any): string {
  const errorMessage = error?.message || String(error);

  // 1️⃣ Regex patterns for preserving manual/friendly errors
  const friendlyPatterns: RegExp[] = [
    /^(This .+ already exists)$/i,
    /^User not found$/i,
    /^Unauthorized access$/i,
    /^Failed to (get|create|update|load|place|cancel) .+$/i,
    /^Wrong email or password please Try again$/i,
    /^Reset token is invalid or expired$/i,
    /^All image uploads failed\. Please try again\.$/i,
    /^Product creation failed$/i,
    /^Category not found$/i,
    /^Order not found$/i,
  ];

  if (friendlyPatterns.some((pattern) => pattern.test(errorMessage))) {
    return errorMessage; // preserve the friendly manual message
  }

  // 2️⃣ MongoDB Duplicate Key Error (E11000)
  if (errorMessage.includes("E11000") || errorMessage.includes("duplicate key")) {
    const fieldMatch = errorMessage.match(/index: (\w+)_/);
    const valueMatch = errorMessage.match(/dup key: { .*?: "(.+?)" }/);

    const field = fieldMatch?.[1] || "field";
    const value = valueMatch?.[1] || "";

    const fieldNames: Record<string, string> = {
      slug: "slug",
      email: "email address",
      username: "username",
      sku: "SKU code",
      name: "name",
    };

    const friendlyField = fieldNames[field] || field;

    return value
      ? `This ${friendlyField} "${value}" is already in use. Please choose a different one.`
      : `This ${friendlyField} is already in use. Please choose a different one.`;
  }

  // 3️⃣ MongoDB validation errors
  if (errorMessage.includes("validation failed")) {
    return "Please check your input. Some required fields are missing or invalid.";
  }

  if (errorMessage.includes("Cast to ObjectId failed")) {
    return "Invalid ID format. Please try again.";
  }

  // 4️⃣ Unauthorized / Not Found / Network / Timeout errors
  if (
    errorMessage.toLowerCase().includes("unauthorized") ||
    errorMessage.toLowerCase().includes("not authorized")
  ) {
    return "You don't have permission to perform this action.";
  }

  if (errorMessage.toLowerCase().includes("not found")) {
    return "The requested item could not be found. It may have been deleted.";
  }

  if (
    errorMessage.toLowerCase().includes("network") ||
    errorMessage.toLowerCase().includes("connection")
  ) {
    return "Network error. Please check your internet connection and try again.";
  }

  if (errorMessage.toLowerCase().includes("timeout")) {
    return "The request took too long. Please try again.";
  }

  // 5️⃣ File upload errors
  if (
    errorMessage.toLowerCase().includes("file") &&
    errorMessage.toLowerCase().includes("size")
  ) {
    return "File is too large. Please choose a smaller file.";
  }

  if (
    errorMessage.toLowerCase().includes("file type") ||
    errorMessage.toLowerCase().includes("invalid format")
  ) {
    return "Invalid file type. Please upload a supported format.";
  }

  // 6️⃣ Required field errors
  if (
    errorMessage.includes("required") ||
    errorMessage.includes("is required")
  ) {
    const fieldMatch = errorMessage.match(/Path `(\w+)`/);
    const field = fieldMatch?.[1] || "field";
    return `The ${field} field is required. Please fill it in.`;
  }

  // 7️⃣ Min/Max length errors
  if (
    errorMessage.includes("shorter than the minimum") ||
    errorMessage.includes("minimum allowed length")
  ) {
    return "Some fields are too short. Please provide more information.";
  }

  if (
    errorMessage.includes("longer than the maximum") ||
    errorMessage.includes("maximum allowed length")
  ) {
    return "Some fields are too long. Please shorten your input.";
  }

  // 8️⃣ Default fallback
  return "Something went wrong. Please try again or contact support if the problem persists.";
}
