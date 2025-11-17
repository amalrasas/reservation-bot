import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateReservationDTO {
  @IsString()
  guestPhoneNumber: string;

  @IsString()
  guestName: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'timeSlot must be HH:mm' })
  slot: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  numberOfPeople: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
