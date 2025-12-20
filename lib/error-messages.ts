// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFriendlyErrorMessage(error: any): string {
  const errorMessage = error?.message || String(error);

  // MongoDB Duplicate Key Error (E11000)
  if (
    errorMessage.includes("E11000") ||
    errorMessage.includes("duplicate key")
  ) {
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

  // MongoDB Validation Errors
  if (errorMessage.includes("validation failed")) {
    return "Please check your input. Some required fields are missing or invalid.";
  }

  // Cast Errors (invalid ObjectId, etc.)
  if (errorMessage.includes("Cast to ObjectId failed")) {
    return "Invalid ID format. Please try again.";
  }

  // Unauthorized
  if (
    errorMessage.toLowerCase().includes("unauthorized") ||
    errorMessage.toLowerCase().includes("not authorized")
  ) {
    return "You don't have permission to perform this action.";
  }

  // Not Found
  if (errorMessage.toLowerCase().includes("not found")) {
    return "The requested item could not be found. It may have been deleted.";
  }

  // Network/Connection Errors
  if (
    errorMessage.toLowerCase().includes("network") ||
    errorMessage.toLowerCase().includes("connection")
  ) {
    return "Network error. Please check your internet connection and try again.";
  }

  // Timeout Errors
  if (errorMessage.toLowerCase().includes("timeout")) {
    return "The request took too long. Please try again.";
  }

  // File Upload Errors
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

  // Required Field Errors
  if (
    errorMessage.includes("required") ||
    errorMessage.includes("is required")
  ) {
    const fieldMatch = errorMessage.match(/Path `(\w+)`/);
    const field = fieldMatch?.[1] || "field";
    return `The ${field} field is required. Please fill it in.`;
  }

  // Min/Max Length Errors
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

  // Default friendly messages based on context
  const contextMessages: Record<string, string> = {
    category:
      "An error occurred while processing the category. Please try again.",
    product:
      "An error occurred while processing the product. Please try again.",
    user: "An error occurred while processing the user information. Please try again.",
    order: "An error occurred while processing the order. Please try again.",
    payment:
      "Payment processing failed. Please try again or use a different payment method.",
  };

  // Try to detect context from error message
  const lowerMessage = errorMessage.toLowerCase();
  for (const [context, message] of Object.entries(contextMessages)) {
    if (lowerMessage.includes(context)) {
      return message;
    }
  }

  // Generic fallback
  return "Something went wrong. Please try again or contact support if the problem persists.";
}
