import { generateTimeSlotsFromSchedule } from '../timeSlotsGenerator';
import { RestaurantSchedule } from 'src/common/types/restaurantSchedule';
import { TimeSlotDurationUnit } from 'src/common/types';

describe('generateTimeSlots', () => {
  const makeSchedule = (
    openTime: string,
    closeTime: string,
    slotDuration: number,
    slotDurationUnit: TimeSlotDurationUnit,
  ): RestaurantSchedule => ({
    openTime,
    closeTime,
    slotDuration,
    slotDurationUnit,
    daysOpenForBooking: 7,
    defaultCapacityPerSlot: 10,
  });

  it('generates hourly time slots between open and close time (exclusive of close)', () => {
    const schedule = makeSchedule('10:00', '13:00', 1, 'hours');

    const result = generateTimeSlotsFromSchedule(schedule);

    expect(result.slots).toEqual(['10:00', '11:00', '12:00']);
    expect(result.slotDuration).toBe(1);
    expect(result.durationUnit).toBe('hours');
  });

  it('generates 30-minute time slots between open and close (exclusive of close)', () => {
    const schedule = makeSchedule('09:00', '10:30', 30, 'minutes');

    const result = generateTimeSlotsFromSchedule(schedule);

    expect(result.slots).toEqual(['9:00', '9:30', '10:00']);
    expect(result.slotDuration).toBe(30);
    expect(result.durationUnit).toBe('minutes');
  });

  it('returns an empty slots array when openTime equals closeTime', () => {
    const schedule = makeSchedule('10:00', '10:00', 30, 'minutes');

    const result = generateTimeSlotsFromSchedule(schedule);

    expect(result.slots).toEqual([]);
    expect(result.slotDuration).toBe(30);
    expect(result.durationUnit).toBe('minutes');
  });

  it('throws if slotDuration is zero', () => {
    const schedule = makeSchedule('10:00', '12:00', 0, 'minutes');

    expect(() => generateTimeSlotsFromSchedule(schedule)).toThrow(
      'slotDuration must be > 0',
    );
  });

  it('throws if slotDuration is negative', () => {
    const schedule = makeSchedule('10:00', '12:00', -15, 'minutes');

    expect(() => generateTimeSlotsFromSchedule(schedule)).toThrow(
      'slotDuration must be > 0',
    );
  });

  it('throws if opening time is after closing time', () => {
    const schedule = makeSchedule('18:00', '10:00', 30, 'minutes');

    expect(() => generateTimeSlotsFromSchedule(schedule)).toThrow(
      'closing time must be greater than opening time.',
    );
  });

  it('supports seconds as duration unit (increments in seconds)', () => {
    const schedule = makeSchedule('10:00', '10:01', 30, 'seconds');

    const result = generateTimeSlotsFromSchedule(schedule);

    expect(result.slots).toEqual(['10:00', '10:00']);
    expect(result.slotDuration).toBe(30);
    expect(result.durationUnit).toBe('seconds');
  });
});
