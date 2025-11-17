import { generateAvailabilityMap } from '../availabilityByDateGenerator';

describe('generateAvailabilityMap', () => {
  const fixedToday = new Date('2025-01-01T10:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(fixedToday);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('generates availability for the correct number of days', () => {
    const slots = ['10:00', '11:00', '12:00'];
    const daysOpen = 3;
    const defaultCap = 5;

    const map = generateAvailabilityMap(daysOpen, defaultCap, slots);

    const keys = Object.keys(map);
    expect(keys).toEqual(['2025-01-01', '2025-01-02', '2025-01-03']);
  });

  it('assigns the correct slot capacities for each day', () => {
    const slots = ['09:00', '09:30'];
    const map = generateAvailabilityMap(2, 10, slots);

    expect(map['2025-01-01']).toEqual({
      '09:00': 10,
      '09:30': 10,
    });

    expect(map['2025-01-02']).toEqual({
      '09:00': 10,
      '09:30': 10,
    });
  });

  it('supports empty slot lists (returns empty objects per day)', () => {
    const map = generateAvailabilityMap(2, 5, []);

    expect(map['2025-01-01']).toEqual({});
    expect(map['2025-01-02']).toEqual({});
  });

  it('returns an empty map when daysOpenForBooking = 0', () => {
    const map = generateAvailabilityMap(0, 10, ['10:00']);
    expect(map).toEqual({});
  });

  it('ensures ISO date format is correct (YYYY-MM-DD)', () => {
    const map = generateAvailabilityMap(1, 5, ['10:00']);

    const dateKey = Object.keys(map)[0];
    expect(dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(map[dateKey]).toEqual({ '10:00': 5 });
  });
});
