type ReservationStatus = 'confirmed' | 'cancelled';

export interface Reservation {
  id: string;
  guestPhoneNumber: string;
  guestName: string;
  status: ReservationStatus;
  date: string; // YYYY-MM-DD
  slot: string; // HH:mm
  numberOfPeople: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReservationDraft = Omit<
  Reservation,
  'id' | 'status' | 'createdAt' | 'updatedAt'
>;
