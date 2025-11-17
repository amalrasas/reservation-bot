import { IsDateString, IsOptional, Matches } from 'class-validator';

export class AvailabilityQueryDto {
  @IsDateString()
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in format YYYY-MM-DD',
  })
  date: string;
}
