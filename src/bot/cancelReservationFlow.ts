import { Interface } from 'readline';
import { askQuestion } from './askQuestion';
import { Reservation } from 'src/common/types';
import { findReservationById, cancelReservation } from './api';

export async function cancelReservationFlow(rl: Interface) {
  console.log('\n🗑 Cancel an existing reservation\n');

  let reservationId = (await askQuestion(
    rl,
    'Enter your reservation ID: ',
  )) as string;

  reservationId = reservationId.trim();

  if (!reservationId) {
    console.log('Reservation ID is required! ');

    return;
  }

  let reservation: Reservation;

  try {
    reservation = await findReservationById(reservationId);
  } catch (e) {
    console.log(`${e?.response?.data?.message ?? e.message} \n`);

    return;
  }

  console.log('\n📋 Reservation details:');
  console.log(`  ID        : ${reservation.id}`);
  console.log(`  Date      : ${reservation.date}`);
  console.log(`  Time      : ${reservation.slot}`);
  console.log(`  Party size: ${reservation.numberOfPeople}`);
  console.log(`  Name      : ${reservation.guestName}`);
  console.log(`  Phone     : ${reservation.guestPhoneNumber}`);
  console.log(`  Status    : ${reservation.status}`);

  if (reservation.notes) console.log(`  Notes     : ${reservation.notes}`);

  let answer = (await askQuestion(
    rl,
    '\nType "yes" to confirm cancellation, or anything else to abort:',
  )) as string;

  answer = answer.trim().toLowerCase();

  if (answer !== 'yes') {
    console.log('\n❕ Cancellation aborted. Reservation not cancelled.\n');

    return;
  }

  try {
    await cancelReservation(reservationId);
    console.log('\n✅ Reservation cancelled successfully!');
  } catch (e) {
    console.log('\n Failed to cancel reservation.');
    console.log(e?.response?.data ?? e.message);

    return;
  }
}
