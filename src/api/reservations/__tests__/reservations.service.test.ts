import { NotFoundException } from '@nestjs/common';
import { ReservationService } from '../reservations.service';
import { AvailabilityService } from '../../availability/availability.service';
import { Reservation } from '../../../common/types';
import { CreateReservationDTO } from '../dto/create-reservation.dto';
import { UpdateReservationDTO } from '../dto/update-reservation.dto';
import * as store from '../reservations.store';
import { randomUUID } from 'crypto';

jest.mock('../reservations.store');

jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

type AvailabilityServiceMock = {
  updateSlotCapacity: jest.Mock<
    unknown,
    [string, string, number, 'decrement' | 'increment']
  >;
};

describe('ReservationsService', () => {
  let service: ReservationService;
  let availabilityServiceMock: AvailabilityServiceMock;

  const addReservationMock = jest.mocked(store.addReservation);
  const loadReservationsMock = jest.mocked(store.loadReservations);
  const updateReservationMock = jest.mocked(store.updateReservation);
  const randomUUIDMock = randomUUID as jest.MockedFunction<typeof randomUUID>;

  beforeEach(() => {
    jest.clearAllMocks();

    availabilityServiceMock = {
      updateSlotCapacity:
        jest.fn() as AvailabilityServiceMock['updateSlotCapacity'],
    };

    service = new ReservationService(
      availabilityServiceMock as unknown as AvailabilityService,
    );

    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T12:00:00.000Z'));
    randomUUIDMock.mockReturnValue('fixed-1234-1234-uuid-123');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('create', () => {
    it('creates a reservation, decrements availability and stores it', () => {
      const dto: CreateReservationDTO = {
        guestName: 'John Doe',
        guestPhoneNumber: '123456789',
        date: '2025-01-02',
        slot: '10:00',
        numberOfPeople: 4,
        notes: 'Window seat',
      };

      const result = service.create(dto);

      expect(availabilityServiceMock.updateSlotCapacity).toHaveBeenCalledWith(
        '2025-01-02',
        '10:00',
        4,
        'decrement',
      );

      expect(randomUUIDMock).toHaveBeenCalled();

      expect(addReservationMock).toHaveBeenCalledTimes(1);
      const addedReservation = addReservationMock.mock.calls[0][0];

      expect(addedReservation.id).toBe('fixed-1234-1234-uuid-123');
      expect(addedReservation.status).toBe('confirmed');
      expect(addedReservation.date).toBe(dto.date);
      expect(addedReservation.slot).toBe(dto.slot);
      expect(addedReservation.numberOfPeople).toBe(dto.numberOfPeople);
      expect(addedReservation.guestName).toBe(dto.guestName);
      expect(addedReservation.guestPhoneNumber).toBe(dto.guestPhoneNumber);
      expect(addedReservation.notes).toBe(dto.notes);
      expect(addedReservation.createdAt).toBe('2025-01-01T12:00:00.000Z');
      expect(addedReservation.updatedAt).toBe('2025-01-01T12:00:00.000Z');

      expect(result).toEqual(addedReservation);
    });
  });

  describe('find', () => {
    it('returns all reservations from the store', () => {
      const reservations: Reservation[] = [
        {
          id: '1',
          guestName: 'A',
          guestPhoneNumber: '111',
          date: '2025-01-01',
          slot: '10:00',
          numberOfPeople: 2,
          notes: '',
          status: 'confirmed',
          createdAt: '2025-01-01T10:00:00.000Z',
          updatedAt: '2025-01-01T10:00:00.000Z',
        },
      ];
      loadReservationsMock.mockReturnValue(reservations);

      const result = service.find();

      expect(loadReservationsMock).toHaveBeenCalledTimes(1);
      expect(result).toBe(reservations);
    });
  });

  describe('findById', () => {
    it('returns a reservation when it exists', () => {
      const reservation: Reservation = {
        id: 'abc',
        guestName: 'Test',
        guestPhoneNumber: '000',
        date: '2025-01-01',
        slot: '10:00',
        numberOfPeople: 2,
        notes: '',
        status: 'confirmed',
        createdAt: '2025-01-01T10:00:00.000Z',
        updatedAt: '2025-01-01T10:00:00.000Z',
      };

      loadReservationsMock.mockReturnValue([reservation]);

      const result = service.findById('abc');

      expect(loadReservationsMock).toHaveBeenCalledTimes(1);
      expect(result).toBe(reservation);
    });

    it('throws NotFoundException when reservation does not exist', () => {
      loadReservationsMock.mockReturnValue([]);

      expect(() => service.findById('missing-id')).toThrow(NotFoundException);
      expect(() => service.findById('missing-id')).toThrow(
        'reservation with id: missing-id not found',
      );
    });
  });

  describe('update', () => {
    const baseReservation: Reservation = {
      id: 'res-1',
      guestName: 'Old Name',
      guestPhoneNumber: '111',
      date: '2025-01-01',
      slot: '10:00',
      numberOfPeople: 2,
      notes: 'Old notes',
      status: 'confirmed',
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z',
    };

    beforeEach(() => {
      loadReservationsMock.mockReturnValue([baseReservation]);
      updateReservationMock.mockImplementation((r) => r);
    });

    it('updates only non-availability fields when nothing changed in date/slot/capacity', () => {
      const dto: UpdateReservationDTO = {
        guestName: 'New Name',
        notes: 'New notes',
      };

      const result = service.update('res-1', dto);

      expect(availabilityServiceMock.updateSlotCapacity).not.toHaveBeenCalled();

      expect(updateReservationMock).toHaveBeenCalledTimes(1);
      const updated = updateReservationMock.mock.calls[0][0];

      expect(updated.id).toBe('res-1');
      expect(updated.date).toBe(baseReservation.date);
      expect(updated.slot).toBe(baseReservation.slot);
      expect(updated.numberOfPeople).toBe(baseReservation.numberOfPeople);
      expect(updated.guestName).toBe('New Name');
      expect(updated.notes).toBe('New notes');
      expect(updated.createdAt).toBe(baseReservation.createdAt);
      expect(updated.status).toBe(baseReservation.status);
      expect(updated.updatedAt).toBe('2025-01-01T12:00:00.000Z');

      expect(result).toEqual(updated);
    });

    it('adjusts capacity when only numberOfPeople increases (same date/slot)', () => {
      const dto: UpdateReservationDTO = {
        numberOfPeople: 5,
      };

      service.update('res-1', dto);

      expect(availabilityServiceMock.updateSlotCapacity).toHaveBeenCalledTimes(
        1,
      );
      expect(availabilityServiceMock.updateSlotCapacity).toHaveBeenCalledWith(
        '2025-01-01',
        '10:00',
        3,
        'decrement',
      );
    });

    it('adjusts capacity when numberOfPeople decreases (same date/slot)', () => {
      const dto: UpdateReservationDTO = {
        numberOfPeople: 1,
      };

      service.update('res-1', dto);

      expect(availabilityServiceMock.updateSlotCapacity).toHaveBeenCalledTimes(
        1,
      );
      expect(availabilityServiceMock.updateSlotCapacity).toHaveBeenCalledWith(
        '2025-01-01',
        '10:00',
        1,
        'increment',
      );
    });

    it('adjusts availability when changing date/slot', () => {
      const dto: UpdateReservationDTO = {
        date: '2025-01-02',
        slot: '12:00',
        numberOfPeople: 4,
      };

      service.update('res-1', dto);

      expect(availabilityServiceMock.updateSlotCapacity).toHaveBeenCalledTimes(
        2,
      );
      expect(
        availabilityServiceMock.updateSlotCapacity,
      ).toHaveBeenNthCalledWith(1, '2025-01-01', '10:00', 2, 'increment');
      expect(
        availabilityServiceMock.updateSlotCapacity,
      ).toHaveBeenNthCalledWith(2, '2025-01-02', '12:00', 4, 'decrement');
    });
  });

  describe('cancel', () => {
    it('increments availability and updates reservation status to cancelled', () => {
      const existing: Reservation = {
        id: 'res-2',
        guestName: 'To Cancel',
        guestPhoneNumber: '222',
        date: '2025-01-03',
        slot: '18:00',
        numberOfPeople: 3,
        notes: '',
        status: 'confirmed',
        createdAt: '2025-01-01T10:00:00.000Z',
        updatedAt: '2025-01-01T10:00:00.000Z',
      };

      loadReservationsMock.mockReturnValue([existing]);
      updateReservationMock.mockImplementation((r) => r);

      const result = service.cancel('res-2');

      expect(availabilityServiceMock.updateSlotCapacity).toHaveBeenCalledTimes(
        1,
      );
      expect(availabilityServiceMock.updateSlotCapacity).toHaveBeenCalledWith(
        '2025-01-03',
        '18:00',
        3,
        'increment',
      );

      expect(updateReservationMock).toHaveBeenCalledTimes(1);
      const updated = updateReservationMock.mock.calls[0][0];

      expect(updated.status).toBe('cancelled');
      expect(updated.updatedAt).toBe('2025-01-01T12:00:00.000Z');

      expect(result).toEqual(updated);
    });
  });
});
