import { AvailabilityCalendar } from 'src/common/types';

export function generateAvailabilityMap(
  daysOpenForBooking: number,
  defaultCapacityPerSlot: number,
  slots: string[],
): AvailabilityCalendar {
  const availabilityMap: AvailabilityCalendar = {};
  const today = new Date();

  for (let i = 0; i < daysOpenForBooking; i++) {
    const date = new Date(today);

    date.setDate(today.getDate() + i);

    const iso = date.toISOString().split('T')[0]; // "YYYY-MM-DD"

    const slotCapacityRecord: Record<string, number> = {};

    for (const slot of slots) {
      slotCapacityRecord[slot] = defaultCapacityPerSlot;
    }

    availabilityMap[iso] = slotCapacityRecord;
  }

  return availabilityMap;
}
