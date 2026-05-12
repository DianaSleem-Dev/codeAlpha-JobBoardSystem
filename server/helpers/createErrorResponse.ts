import { ErrorResponseDto } from "../dtos/common/error.response.dto";

export const createErrorResponse = (
  message: string,
  errorCode?: string,
  details?: any,
  statusCode: number = 500
): ErrorResponseDto => {
  return {
    success: false,
    message,
    errorCode,
    details,
    statusCode,
    timestamp: new Date(),
  };
};