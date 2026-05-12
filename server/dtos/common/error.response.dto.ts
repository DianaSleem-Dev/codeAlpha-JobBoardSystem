export type ErrorResponseDto = {
  success: false;
  message: string;
  errorCode?: string;
  details?: any;
  statusCode?: number;
  timestamp?: Date;
};