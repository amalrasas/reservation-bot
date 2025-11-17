import { TimeSlotConfig, TimeSlotDurationUnit } from 'src/common/types';
import { RestaurantSchedule } from '../../common/types/restaurantSchedule';

function addUnit(date: Date, amount: number, unit: TimeSlotDurationUnit): Date {
  const d = new Date(date); // clone date

  switch (unit) {
    case 'hours':
      d.setHours(d.getHours() + amount);
      break;
    case 'minutes':
      d.setMinutes(d.getMinutes() + amount);
      break;
    case 'seconds':
      d.setSeconds(d.getSeconds() + amount);
      break;
  }

  return d;
}

function formatDateToTimeString(d: Date): string {
  const hh = String(d.getHours());

  const mm = String(d.getMinutes()).padStart(2, '0');

  return `${hh}:${mm}`;
}

function convertTimeToDate(time: string): Date {
  const [h, m] = time.split(':').map((t) => Number(t));

  return new Date(2025, 0, 1, h, m, 0, 0);
}

export function generateTimeSlotsFromSchedule(
  schedule: RestaurantSchedule,
): TimeSlotConfig {
  const { openTime, closeTime, slotDuration, slotDurationUnit } = schedule;

  if (slotDuration <= 0) {
    throw new Error('slotDuration must be > 0');
  }

  const open: Date = convertTimeToDate(openTime);
  const close: Date = convertTimeToDate(closeTime);

  if (open > close) {
    throw new Error('closing time must be greater than opening time.');
  }

  const slots: string[] = [];
  let cursor = new Date(open); //clone open

  while (cursor < close) {
    slots.push(formatDateToTimeString(cursor));
    cursor = addUnit(cursor, slotDuration, slotDurationUnit);
  }

  const timeSlots: TimeSlotConfig = {
    slots,
    slotDuration,
    durationUnit: slotDurationUnit,
  };

  return timeSlots;
}
