import { BaseResponseDto } from "../dtos/common/base.response.dto";

export const createSuccessResponse = <T>(
  data: T,
  message = "success"
): BaseResponseDto<T> => {
  return {
    success: true,
    message,
    data,
  };
};