import { Interface } from 'readline';
import { findReservationById, modifyReservation } from './api';
import { Reservation, ReservationDraft } from 'src/common/types';
import { askQuestion } from './askQuestion';
import { editReservationDraft } from './newReservationFlow';

export async function modifyReservationFlow(rl: Interface) {
  console.log('\n✏️ Modify an existing reservation\n');

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

  let draft: ReservationDraft = {
    date: reservation.date,
    slot: reservation.slot,
    numberOfPeople: reservation.numberOfPeople,
    guestName: reservation.guestName,
    guestPhoneNumber: reservation.guestPhoneNumber,
    notes: reservation.notes,
  };

  draft = await editReservationDraft(rl, draft);

  console.log('\n📋 Updated reservation preview:');

  console.log('\n📋 Reservation details:');
  console.log(`  ID        : ${reservation.id}`);
  console.log(`  Date      : ${draft.date}`);
  console.log(`  Time      : ${draft.slot}`);
  console.log(`  Party size: ${draft.numberOfPeople}`);
  console.log(`  Name      : ${draft.guestName}`);
  console.log(`  Phone     : ${draft.guestPhoneNumber}`);
  console.log(`  Status    : ${reservation.status}`);

  const confirm = (await askQuestion(
    rl,
    '\nType "yes" to save changes, or anything else to cancel: ',
  )) as string;

  if (confirm.trim().toLowerCase() !== 'yes') {
    console.log('\n❕ Changes discarded. Reservation NOT updated.\n');

    return;
  }

  try {
    const modifiedReservation = await modifyReservation(reservation.id, {
      date: draft.date,
      slot: draft.slot,
      numberOfPeople: draft.numberOfPeople,
      guestName: draft.guestName,
      guestPhoneNumber: draft.guestPhoneNumber,
      notes: draft.notes,
    });

    console.log('\n✅ Reservation updated successfully!');

    console.log('\n📋 Updated reservation details:');
    console.log(`  ID        : ${modifiedReservation.id}`);
    console.log(`  Date      : ${modifiedReservation.date}`);
    console.log(`  Time      : ${modifiedReservation.slot}`);
    console.log(`  Party size: ${modifiedReservation.numberOfPeople}`);
    console.log(`  Name      : ${modifiedReservation.guestName}`);
    console.log(`  Phone     : ${modifiedReservation.guestPhoneNumber}`);
    console.log(`  Status    : ${modifiedReservation.status}`);
  } catch (err: any) {
    console.log('\n❌ Failed to update reservation.');
    console.log(err?.response?.data ?? err.message);
  }
}
