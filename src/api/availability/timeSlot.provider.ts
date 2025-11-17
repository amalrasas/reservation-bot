import { Injectable, OnModuleInit } from '@nestjs/common';
import { TimeSlotConfig } from 'src/common/types';
import { DEFAULT_RESTAURANT_SCHEDULE } from '../../common/types/restaurantSchedule';
import { generateTimeSlotsFromSchedule } from './timeSlotsGenerator';

@Injectable()
export class TimeSlotsProvider implements OnModuleInit {
  private generatedTimeSlots: TimeSlotConfig | null = null;

  onModuleInit() {
    this.generatedTimeSlots = generateTimeSlotsFromSchedule(
      DEFAULT_RESTAURANT_SCHEDULE,
    );
  }

  set(timeSlots: TimeSlotConfig) {
    this.generatedTimeSlots = timeSlots;
  }

  get(): TimeSlotConfig {
    if (!this.generatedTimeSlots) {
      throw new Error('generatedTimeSlots is not initialized yet!');
    }

    return this.generatedTimeSlots;
  }
}
