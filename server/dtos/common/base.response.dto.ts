export type BaseResponseDto<T> = {
  success: true;
  message: string;
  data: T;
};