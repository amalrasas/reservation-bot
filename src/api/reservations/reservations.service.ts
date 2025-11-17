import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Reservation } from '../../common/types';
import { AvailabilityService } from '../availability/availability.service';
import { CreateReservationDTO } from './dto/create-reservation.dto';
import {
  addReservation,
  loadReservations,
  updateReservation,
} from './reservations.store';
import { UpdateReservationDTO } from './dto/update-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(private readonly availabilityService: AvailabilityService) {}

  create(dto: CreateReservationDTO): Reservation {
    this.availabilityService.updateSlotCapacity(
      dto.date,
      dto.slot,
      dto.numberOfPeople,
      'decrement',
    );

    const UUID = randomUUID();

    const reservation: Reservation = {
      id: UUID,
      guestName: dto.guestName,
      guestPhoneNumber: dto.guestPhoneNumber,
      date: dto.date,
      slot: dto.slot,
      numberOfPeople: dto.numberOfPeople,
      notes: dto.notes,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('📁 [Service] Adding reservation', reservation.id);
    addReservation(reservation);

    return reservation;
  }

  find(): Reservation[] {
    return loadReservations();
  }

  findById(id: string): Reservation {
    const reservations = loadReservations();
    const reservation = reservations.find((r) => r.id === id);

    if (!reservation) {
      throw new NotFoundException(`reservation with id: ${id} not found`);
    }

    return reservation;
  }

  update(id: string, updateDTO: UpdateReservationDTO): Reservation {
    const reservation = this.findById(id);

    const oldDate = reservation.date;
    const oldSlot = reservation.slot;
    const oldCapacity = reservation.numberOfPeople;

    const newDate = updateDTO.date ?? reservation.date;
    const newSlot = updateDTO.slot ?? reservation.slot;
    const newCapacity = updateDTO.numberOfPeople ?? reservation.numberOfPeople;

    const dateOrSlotChanced = oldDate !== newDate || oldSlot !== newSlot;
    const capacityChanged = oldCapacity !== newCapacity;

    if (dateOrSlotChanced || capacityChanged) {
      this.adjustAvailabilityOnUpdate(
        oldDate,
        oldSlot,
        oldCapacity,
        newDate,
        newSlot,
        newCapacity,
      );
    }

    const updatedReservation: Reservation = {
      id: id,
      date: newDate ?? oldDate,
      slot: newSlot ?? oldSlot,
      numberOfPeople: newCapacity ?? oldCapacity,
      notes: updateDTO.notes ?? reservation.notes,
      guestPhoneNumber:
        updateDTO.guestPhoneNumber ?? reservation.guestPhoneNumber,
      guestName: updateDTO.guestName ?? reservation.guestName,
      createdAt: reservation.createdAt,
      status: reservation.status,
      updatedAt: new Date().toISOString(),
    };

    return updateReservation(updatedReservation);
  }

  cancel(id: string): Reservation {
    const reservation = this.findById(id);

    this.availabilityService.updateSlotCapacity(
      reservation.date,
      reservation.slot,
      reservation.numberOfPeople,
      'increment',
    );

    reservation.status = 'cancelled';
    reservation.updatedAt = new Date().toISOString();

    return updateReservation(reservation);
  }

  private adjustAvailabilityOnUpdate(
    oldDate: string,
    oldSlot: string,
    oldCapacity: number,
    newDate: string,
    newSlot: string,
    newCapacity: number,
  ) {
    // change in capacity only
    if (oldDate === newDate && oldSlot === newSlot) {
      const diff = newCapacity - oldCapacity;

      if (diff == 0) {
        return;
      } else if (diff > 0) {
        // need to reserve for more people
        const newAvailability = this.availabilityService.updateSlotCapacity(
          oldDate,
          oldSlot,
          diff,
          'decrement',
        );

        return newAvailability;
      } else {
        // diff < 0 => need to reserve for less people
        const newAvailability = this.availabilityService.updateSlotCapacity(
          oldDate,
          oldSlot,
          -diff, // here diff will be a negative number, doing -diff to convert it to a positive number and increment slot capacity
          'increment',
        );

        return newAvailability;
      }
    }

    // change in date OR slot
    if (newDate !== oldDate || newSlot !== oldSlot) {
      // increment back old data/slot capacity
      this.availabilityService.updateSlotCapacity(
        oldDate,
        oldSlot,
        oldCapacity,
        'increment',
      );

      // reserve new date/slot
      const newAvailability = this.availabilityService.updateSlotCapacity(
        newDate,
        newSlot,
        newCapacity,
        'decrement',
      );

      return newAvailability;
    }
  }
}
