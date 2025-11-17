import { TimeSlotDurationUnit } from './timeSlotConfig';

export const maxCapacityPerSlot = Number(
  process.env.MAX_CAPACITY_PER_SLOT ?? 20,
);

export interface RestaurantSchedule {
  openTime: string;
  closeTime: string;
  slotDuration: number;
  slotDurationUnit: TimeSlotDurationUnit;
  daysOpenForBooking: number;
  defaultCapacityPerSlot: number;
}

export const DEFAULT_RESTAURANT_SCHEDULE: RestaurantSchedule = {
  openTime: '12:00',
  closeTime: '22:00',
  slotDuration: 30,
  slotDurationUnit: 'minutes',
  daysOpenForBooking: 7,
  defaultCapacityPerSlot: maxCapacityPerSlot,
};
