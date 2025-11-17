import { BadRequestException } from '@nestjs/common';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Reservation } from 'src/common/types';

const FILE_PATH = join(process.cwd(), 'reservations.json');

export function loadReservations(): Reservation[] {
  if (!existsSync(FILE_PATH)) return [];

  const raw = readFileSync(FILE_PATH, 'utf8');

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Reservation[];
  } catch (e) {
    console.error(e);

    return [];
  }
}

function saveReservations(data: Reservation[]): void {
  try {
    writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('📁 [saveReservations] Failed to save reservations file:', e);
  }
}

export function addReservation(reservation: Reservation): void {
  const reservations = loadReservations();

  reservations.push(reservation);

  saveReservations(reservations);
}

export function updateReservation(
  updatedReservation: Reservation,
): Reservation {
  const reservations = loadReservations();
  const reservation_index = reservations.findIndex(
    (r) => r.id === updatedReservation.id,
  );

  if (reservation_index === -1) {
    throw new BadRequestException(
      `Reservation with Id: ${updatedReservation.id} not found.`,
    );
  }

  reservations[reservation_index] = updatedReservation;

  saveReservations(reservations);

  return updatedReservation;
}
