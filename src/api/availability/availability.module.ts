import { Module } from '@nestjs/common';
import { TimeSlotsProvider } from './timeSlot.provider';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';

@Module({
  providers: [TimeSlotsProvider, AvailabilityService],
  controllers: [AvailabilityController],
  exports: [AvailabilityService, TimeSlotsProvider],
})
export class AvailabilityModule {}
