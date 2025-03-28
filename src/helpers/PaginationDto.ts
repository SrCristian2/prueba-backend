import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  pageSize: number = 20;
}
