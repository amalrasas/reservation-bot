import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDTO } from './create-reservation.dto';

export class UpdateReservationDTO extends PartialType(CreateReservationDTO) {}
