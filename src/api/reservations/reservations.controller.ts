import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ReservationService } from './reservations.service';
import { CreateReservationDTO } from './dto/create-reservation.dto';
import { UpdateReservationDTO } from './dto/update-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationService) {}

  @Post()
  create(@Body() createDTO: CreateReservationDTO) {
    return this.reservationsService.create(createDTO);
  }

  @Get()
  findAll() {
    return this.reservationsService.find();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findById(id);
  }

  @Put(':id/update')
  update(@Param('id') id: string, @Body() updateDTO: UpdateReservationDTO) {
    return this.reservationsService.update(id, updateDTO);
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.reservationsService.cancel(id);
  }
}
