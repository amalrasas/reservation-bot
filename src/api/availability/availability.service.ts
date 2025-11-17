import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { AvailabilityCalendar, TimeSlotsWithCapacity } from 'src/common/types';
import { TimeSlotsProvider } from './timeSlot.provider';
import { generateAvailabilityMap } from './availabilityByDateGenerator';
import {
  DEFAULT_RESTAURANT_SCHEDULE,
  maxCapacityPerSlot,
} from '../../common/types/restaurantSchedule';
import {
  loadAvailabilityFromFile,
  saveAvailabilityToFile,
} from './availability.store';

@Injectable()
export class AvailabilityService implements OnModuleInit {
  private availability: AvailabilityCalendar = {};

  constructor(private readonly timeSlotsProvider: TimeSlotsProvider) {}

  onModuleInit() {
    const loaded = loadAvailabilityFromFile();

    if (loaded) {
      this.availability = loaded;

      return;
    }

    const { slots: timeSlots } = this.timeSlotsProvider.get();

    this.availability = generateAvailabilityMap(
      DEFAULT_RESTAURANT_SCHEDULE.daysOpenForBooking,
      DEFAULT_RESTAURANT_SCHEDULE.defaultCapacityPerSlot,
      timeSlots,
    );

    saveAvailabilityToFile(this.availability);
  }

  getAvailableSlotsByDate(date: string): TimeSlotsWithCapacity {
    if (!Object.hasOwn(this.availability, date)) {
      throw new BadRequestException({
        message: `no available time slots for this date :${date}.`,
      });
    }

    return this.availability[date];
  }

  getAvailableSlots(): AvailabilityCalendar {
    return this.availability;
  }

  private getSlotCapacity(
    timeSlots: TimeSlotsWithCapacity,
    slot: string,
  ): number {
    return timeSlots[slot];
  }

  private canApplyCapacityChange(
    currentCapacity: number,
    qty: number,
    method: 'decrement' | 'increment',
  ): boolean {
    if (method === 'decrement') {
      return currentCapacity >= qty;
    }

    if (method === 'increment') {
      return currentCapacity + qty <= maxCapacityPerSlot;
    }

    return false;
  }

  updateSlotCapacity(
    date: string,
    slot: string,
    qty: number,
    type: 'decrement' | 'increment',
  ) {
    const availableSlotsByDate = this.getAvailableSlotsByDate(date);

    if (!Object.hasOwn(availableSlotsByDate, slot)) {
      throw new BadRequestException(
        `this time slot: ${slot} does not exist on this date: ${date}`,
      );
    }

    const slotCapacity = this.getSlotCapacity(availableSlotsByDate, slot);

    const canUpdateCapacity = this.canApplyCapacityChange(
      slotCapacity,
      qty,
      type,
    );

    if (!canUpdateCapacity) {
      throw new BadRequestException(`Not enough capacity for this slot`);
    }

    if (type === 'decrement') {
      this.availability[date][slot] = slotCapacity - qty;
    }

    if (type === 'increment') {
      this.availability[date][slot] = slotCapacity + qty;
    }

    saveAvailabilityToFile(this.availability);

    return this.availability;
  }
}
