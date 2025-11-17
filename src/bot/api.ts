import axios from 'axios';
import { CreateReservationDTO } from 'src/api/reservations/dto/create-reservation.dto';
import { UpdateReservationDTO } from 'src/api/reservations/dto/update-reservation.dto';
import { Reservation, TimeSlotsWithCapacity } from 'src/common/types';

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';

export async function fetchAvailability(date: string) {
  try {
    const { data } = await axios.get<TimeSlotsWithCapacity>(
      `${BASE_URL}/availability`,
      {
        params: { date },
      },
    );

    return data;
  } catch (e) {
    throw new Error(
      e.response?.data?.message ?? 'Failed to fetch availability',
    );
  }
}

export async function createReservation(
  body: CreateReservationDTO,
): Promise<Reservation> {
  const { data } = await axios.post<Reservation>(
    `${BASE_URL}/reservations`,
    body,
  );

  return data;
}

export async function modifyReservation(
  id: string,
  body: UpdateReservationDTO,
): Promise<Reservation> {
  const { data } = await axios.put<Reservation>(
    `${BASE_URL}/reservations/${id}/update`,
    body,
  );

  return data;
}

export async function cancelReservation(id: string): Promise<Reservation> {
  const { data } = await axios.put<Reservation>(
    `${BASE_URL}/reservations/${id}/cancel`,
  );

  return data;
}

export async function findReservationById(id: string): Promise<Reservation> {
  const { data } = await axios.get<Reservation>(
    `${BASE_URL}/reservations/${id}`,
  );

  return data;
}
