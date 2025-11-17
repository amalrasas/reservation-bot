import { BadRequestException } from '@nestjs/common';
import { AvailabilityService } from '../availability.service';
import { AvailabilityCalendar, TimeSlotsWithCapacity } from 'src/common/types';
import { TimeSlotsProvider } from '../timeSlot.provider';
import { generateAvailabilityMap } from '../availabilityByDateGenerator';
import {
  DEFAULT_RESTAURANT_SCHEDULE,
  maxCapacityPerSlot,
} from '../../../common/types/restaurantSchedule';
import { existsSync, readFileSync, writeFileSync } from 'fs';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock('../availabilityByDateGenerator', () => ({
  generateAvailabilityMap: jest.fn(),
}));

describe('AvailabilityService', () => {
  let timeSlotProviderMock: jest.Mocked<TimeSlotsProvider>;
  let service: AvailabilityService;

  const asGenerateAvailabilityMap =
    generateAvailabilityMap as jest.MockedFunction<
      typeof generateAvailabilityMap
    >;

  beforeEach(() => {
    jest.clearAllMocks();

    timeSlotProviderMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<TimeSlotsProvider>;

    service = new AvailabilityService(timeSlotProviderMock);
  });

  beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});


  describe('onModuleInit', () => {
    it('loads availability from file when it exists and is valid', () => {
      const fakeCalendar: AvailabilityCalendar = {
        '2025-01-01': { '10:00': 5 },
      };

      (existsSync as jest.Mock).mockReturnValue(true);
      (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(fakeCalendar));

      service.onModuleInit();

      expect(timeSlotProviderMock['get']).not.toHaveBeenCalled();
      expect(asGenerateAvailabilityMap).not.toHaveBeenCalled();

      expect(service.getAvailableSlots()).toEqual(fakeCalendar);
    });

    it('generates availability when no file exists and saves it', () => {
      (existsSync as jest.Mock).mockReturnValue(false);

      const slotsFromProvider = ['10:00', '11:00'];

      timeSlotProviderMock.get.mockReturnValue({
        slots: slotsFromProvider,
        slotDuration: 30,
        durationUnit: 'minutes',
      });

      const generatedCalendar: AvailabilityCalendar = {
        '2025-01-01': { '10:00': 10, '11:00': 10 },
      };

      asGenerateAvailabilityMap.mockReturnValue(generatedCalendar);

      service.onModuleInit();

      expect(timeSlotProviderMock['get']).toHaveBeenCalledTimes(1);
      expect(asGenerateAvailabilityMap).toHaveBeenCalledWith(
        DEFAULT_RESTAURANT_SCHEDULE.daysOpenForBooking,
        DEFAULT_RESTAURANT_SCHEDULE.defaultCapacityPerSlot,
        slotsFromProvider,
      );

      expect(service.getAvailableSlots()).toEqual(generatedCalendar);
      expect(writeFileSync as jest.Mock).toHaveBeenCalledTimes(1);
    });

    it('falls back to generating availability if file is invalid JSON', () => {
      (existsSync as jest.Mock).mockReturnValue(true);
      (readFileSync as jest.Mock).mockReturnValue('not-json');

      const slotsFromProvider = ['10:00'];
      timeSlotProviderMock.get.mockReturnValue({
        slots: slotsFromProvider,
        slotDuration: 30,
        durationUnit: 'minutes',
      });

      const generatedCalendar: AvailabilityCalendar = {
        '2025-01-01': { '10:00': 10 },
      };

      asGenerateAvailabilityMap.mockReturnValue(generatedCalendar);

      service.onModuleInit();

      expect(timeSlotProviderMock['get']).toHaveBeenCalledTimes(1);
      expect(asGenerateAvailabilityMap).toHaveBeenCalledTimes(1);
      expect(service.getAvailableSlots()).toEqual(generatedCalendar);
    });
  });

  describe('getAvailableSlotsByDate', () => {
    beforeEach(() => {
      service['availability'] = {
        '2025-01-01': { '10:00': 5 },
      } as AvailabilityCalendar;
    });

    it('returns slots when date exists', () => {
      const result: TimeSlotsWithCapacity =
        service.getAvailableSlotsByDate('2025-01-01');

      expect(result).toEqual({ '10:00': 5 });
    });

    it('throws BadRequestException when date does not exist', () => {
      expect(() => service.getAvailableSlotsByDate('2025-01-02')).toThrow(
        BadRequestException,
      );

      expect(() => service.getAvailableSlotsByDate('2025-01-02')).toThrow(
        'no available time slots for this date :2025-01-02.',
      );
    });
  });

  describe('getAllSlots', () => {
    it('returns the entire availability map', () => {
      const calendar: AvailabilityCalendar = {
        '2025-01-01': { '10:00': 5 },
      };

      service['availability'] = calendar;

      expect(service.getAvailableSlots()).toBe(calendar);
    });
  });

  describe('updateSlotCapacity', () => {
    beforeEach(() => {
      service['availability'] = {
        '2025-01-01': { '10:00': 5, '11:00': 3 },
      } as AvailabilityCalendar;
    });

    it('throws if the slot does not exist on that date', () => {
      expect(() =>
        service.updateSlotCapacity('2025-01-01', '12:00', 1, 'decrement'),
      ).toThrow(BadRequestException);

      expect(() =>
        service.updateSlotCapacity('2025-01-01', '12:00', 1, 'decrement'),
      ).toThrow(
        'this time slot: 12:00 does not exist on this date: 2025-01-01',
      );
    });

    it('throws if there is not enough capacity to decrement', () => {
      expect(() =>
        service.updateSlotCapacity('2025-01-01', '11:00', 5, 'decrement'),
      ).toThrow(BadRequestException);

      expect(() =>
        service.updateSlotCapacity('2025-01-01', '11:00', 5, 'decrement'),
      ).toThrow('Not enough capacity for this slot');
    });

    it('throws if incrementing would exceed maxCapacityPerSlot', () => {
      service['availability'] = {
        '2025-01-01': { '10:00': maxCapacityPerSlot - 1 },
      } as AvailabilityCalendar;

      expect(() =>
        service.updateSlotCapacity('2025-01-01', '10:00', 2, 'increment'),
      ).toThrow(BadRequestException);

      expect(() =>
        service.updateSlotCapacity('2025-01-01', '10:00', 2, 'increment'),
      ).toThrow('Not enough capacity for this slot');
    });

    it('decrements capacity correctly and saves to file', () => {
      const result = service.updateSlotCapacity(
        '2025-01-01',
        '10:00',
        2,
        'decrement',
      );

      expect(result['2025-01-01']['10:00']).toBe(3);
      expect(writeFileSync as jest.Mock).toHaveBeenCalledTimes(1);
    });

    it('increments capacity correctly and saves to file', () => {
      service['availability'] = {
        '2025-01-01': { '10:00': maxCapacityPerSlot - 3 },
      } as AvailabilityCalendar;

      const result = service.updateSlotCapacity(
        '2025-01-01',
        '10:00',
        2,
        'increment',
      );

      expect(result['2025-01-01']['10:00']).toBe(maxCapacityPerSlot - 1);
      expect(writeFileSync as jest.Mock).toHaveBeenCalledTimes(1);
    });
  });
});
