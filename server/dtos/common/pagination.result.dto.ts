export type PaginationResultDto<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};