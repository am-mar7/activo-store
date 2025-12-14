export class RequestError extends Error {
    status: number;
    errors?: Record<string, string[]>;
  
    constructor(
      status: number,
      message: string,
      errors?: Record<string, string[]>
    ) {
      super(message);
      this.status = status;
      this.errors = errors;
      this.name = "RequestError";
    }
  }
  
  export class ValidationError extends RequestError {
    constructor(fieldErrors: Record<string, string[]>) {
      const message = ValidationError.formatFieldErrors(fieldErrors);
      super(400, message, fieldErrors);
      this.name = "ValidationError";
      this.errors = fieldErrors; // this line can be deleted
    }
    // formats the error record into single string
    static formatFieldErrors(errors: Record<string, string[]>): string {
      const formattedMessages = Object.entries(errors).map(
        ([field, messages]) => {
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
  
          if (messages[0] === "Required") {
            return `${fieldName} is required`;
          } else {
            return messages.join(" and ");
          }
        }
      );
  
      return formattedMessages.join(", ");
    }
  }
  
  export class NotFoundError extends RequestError {
    constructor(resource: string) {
      super(404, `${resource} not found`);
      this.name = "NotFoundError";
    }
  }
  
  export class ForbiddenError extends RequestError {
    constructor(message: string = "Forbidden") {
      super(403, message);
      this.name = "ForbiddenError";
    }
  }
  
  export class UnauthorizedError extends RequestError {
    constructor(message: string = "Unauthorized") {
      super(401, message);
      this.name = "UnauthorizedError";
    }
  }
  