import { Interface } from 'readline';
import { askQuestion } from './askQuestion';
import { createReservation, fetchAvailability } from './api';
import {
  Reservation,
  ReservationDraft,
  TimeSlotsWithCapacity,
} from 'src/common/types';
import { CreateReservationDTO } from 'src/api/reservations/dto/create-reservation.dto';
import { maxCapacityPerSlot } from '../common/types/restaurantSchedule';

export async function newReservationFlow(rl: Interface) {
  console.log('\n🧾 New reservation\n');

  while (true) {
    // let user enter reservation date
    const date = await askForDate(rl);

    const res = await getAvailableTimeSlotsForSpecificDate(date);

    if (!res) {
      return;
    }

    const {
      availableTimeSlotsWithCapacityObj,
      availableTimeSlotsWithCapacityArray,
    } = res;

    // let user choose a time slot to reserve
    const slot = await askForTimeSlot(
      rl,
      availableTimeSlotsWithCapacityObj,
      availableTimeSlotsWithCapacityArray,
    );

    // let user choose number of people per table
    const numberOfPeople = await askForNumPeople(rl);

    // let guest enter name
    const guestName = await askForName(rl);

    // let guest enter phone number
    const guestPhoneNumber = await askForPhone(rl);

    // optional notes
    const notesAnswer = (await askQuestion(
      rl,
      'Any notes? (press Enter to skip): ',
    )) as string;

    let reservationDraft: ReservationDraft = {
      date,
      slot,
      numberOfPeople,
      guestName,
      guestPhoneNumber,
      notes: notesAnswer || undefined,
    };

    while (true) {
      printSummary(reservationDraft);

      let action = (await askQuestion(
        rl,
        '\nType "yes" to confirm, "edit" to change details, or "cancel" to cancel: ',
      )) as string;

      action = action.trim().toLowerCase();

      if (action == 'cancel') {
        console.log('\n❕ Reservation cancelled before creation.\n');

        return;
      }

      if (action === 'edit' || action === 'modify') {
        console.log('\n✏️  Okay, let’s update your reservation details.\n');

        reservationDraft = await editReservationDraft(rl, reservationDraft);

        continue;
      }

      if (action == 'yes' || action == 'y' || action == 'confirm') {
        const payload: CreateReservationDTO = {
          guestPhoneNumber: reservationDraft.guestPhoneNumber,
          guestName: reservationDraft.guestName,
          date: reservationDraft.date,
          slot: reservationDraft.slot,
          numberOfPeople: reservationDraft.numberOfPeople,
          notes: reservationDraft.notes || undefined,
        };

        try {
          const reservation = await createReservation(payload);

          console.log('\n✅ Reservation confirmed!');
          console.log(`  ID   : ${reservation.id}`);
          console.log(`  Date : ${reservation.date}`);
          console.log(`  Time : ${reservation.slot}`);
          console.log(`  Size : ${reservation.numberOfPeople}\n`);

          return;
        } catch (err: any) {
          console.log('\n❌ Failed to create reservation.');
          console.log(err?.response?.data ?? err.message);
        }
      }

      console.log('❌ Invalid action. Please type "yes", "edit", or "cancel".');
    }
  }
}

function getReservationDateRange() {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const todayStr = today.toISOString().split('T')[0];
  const nextWeekStr = nextWeek.toISOString().split('T')[0];
  return { todayStr, nextWeekStr };
}

async function askForDate(rl: Interface): Promise<string> {
  const { todayStr, nextWeekStr } = getReservationDateRange();

  while (true) {
    const answer = (await askQuestion(
      rl,
      `Enter date (YYYY-MM-DD) between ${todayStr} and ${nextWeekStr}: `,
    )) as string;

    if (!isValidDate(answer)) {
      console.log('❌ Invalid date format. Please use YYYY-MM-DD.\n');

      continue;
    }

    return answer;
  }
}

async function askForTimeSlot(
  rl: Interface,
  availability: TimeSlotsWithCapacity,
  availableSlots: [string, number][],
): Promise<string> {
  while (true) {
    const answer = (await askQuestion(
      rl,
      `\nChoose a slot by number (1-${availableSlots.length}) or enter time (HH:mm): `,
    )) as string;

    // if user answered with a number
    if (/^\d+$/.test(answer)) {
      const index = parseInt(answer) - 1;

      if (index >= 0 && index < availableSlots.length) {
        return availableSlots[index][0];
      }

      console.log('Invalid choice.');
      continue;
    }

    // if user answered with HH:mm
    if (!isValidTime(answer)) {
      console.log('❌ Invalid time format. Please use HH:MM.\n');
      continue;
    }

    // check capacity of the chosen time slot
    if (!availability[answer] || availability[answer] <= 0) {
      console.log(
        '❌ That time is not available or has no remaining capacity.',
      );
      continue;
    }

    return answer;
  }
}

async function askForNumPeople(rl: Interface): Promise<number> {
  while (true) {
    const answer = (await askQuestion(rl, '\nHow many people? ')) as string;

    const qty = Number(answer);

    if (qty <= 0 || !Number.isInteger(qty)) {
      console.log('❌ Please enter a positive whole number.');
      continue;
    }

    if (qty > maxCapacityPerSlot) {
      console.log(
        `❌ You entered ${qty} people, but the maximum allowed per slot is ${maxCapacityPerSlot}.`,
      );
      continue;
    }

    return qty;
  }
}

async function askForName(rl: Interface): Promise<string> {
  while (true) {
    const answer = (await askQuestion(rl, '\nEnter your name: ')) as string;

    if (!answer.trim()) {
      console.log('❌ Name cannot be empty.');
      continue;
    }

    return answer.trim();
  }
}

async function askForPhone(rl: Interface): Promise<string> {
  while (true) {
    const answer = (await askQuestion(
      rl,
      'Enter your phone number: (e.g., +123456789000)',
    )) as string;

    if (!answer.trim()) {
      console.log('❌ Phone cannot be empty.');
      continue;
    }

    if (!/^\+[1-9]\d{6,14}$/.test(answer)) {
      console.log(
        '❌ Invalid phone number. Please enter a valid international number, e.g. +962791234567.\n',
      );
      continue;
    }

    return answer.trim();
  }
}

function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function isValidTime(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time);
}

function printSummary(draft: Partial<Reservation>): void {
  console.log('\n📋 Please confirm your reservation:');
  console.log(`  Date      : ${draft.date}`);
  console.log(`  Time      : ${draft.slot}`);
  console.log(`  Party size: ${draft.numberOfPeople}`);
  console.log(`  Name      : ${draft.guestName}`);
  console.log(`  Phone     : ${draft.guestPhoneNumber}`);

  if (draft.notes) console.log(`  Notes     : ${draft.notes}`);
}

async function getAvailableTimeSlotsForSpecificDate(date: string) {
  let availableTimeSlotsWithCapacityObj: TimeSlotsWithCapacity;
  const { todayStr, nextWeekStr } = getReservationDateRange();

  try {
    availableTimeSlotsWithCapacityObj = await fetchAvailability(date);
  } catch (err) {
    console.log(
      `❌ Cannot make a reservation for ${date}. You can only book from ${todayStr} until ${nextWeekStr}.`,
    );

    return;
  }

  const availableTimeSlotsWithCapacityArray = Object.entries(
    availableTimeSlotsWithCapacityObj,
  ).filter(([, value]) => value > 0);

  if (!availableTimeSlotsWithCapacityArray.length) {
    console.log(`Sorry!, We are fully booked for this date: ${date} \n`);

    return;
  }

  console.log('\nAvailable time slots:');

  availableTimeSlotsWithCapacityArray.forEach(([key, value], index) =>
    console.log(`${index + 1}) ${key} remaining: ${value}`),
  );

  return {
    availableTimeSlotsWithCapacityObj,
    availableTimeSlotsWithCapacityArray,
  };
}

export async function editReservationDraft(
  rl: Interface,
  draft: ReservationDraft,
): Promise<ReservationDraft> {
  while (true) {
    console.log('\nWhat would you like to edit?');
    console.log('  1) Date');
    console.log('  2) Time');
    console.log('  3) Number of people');
    console.log('  4) Name');
    console.log('  5) Phone');
    console.log('  6) Notes');
    console.log('  7) Done editing');

    const answer = (await askQuestion(
      rl,
      '\nEnter a number (1-7): ',
    )) as string;

    const choice = answer.trim();

    if (choice === '7') {
      return draft;
    }

    switch (choice) {
      case '1': {
        const newDate = await askForDate(rl);

        draft.date = newDate;

        break;
      }

      case '2': {
        const res = await getAvailableTimeSlotsForSpecificDate(draft.date);

        if (!res) break;

        const {
          availableTimeSlotsWithCapacityObj,
          availableTimeSlotsWithCapacityArray,
        } = res;

        // let user choose a time slot to reserve
        const slot = await askForTimeSlot(
          rl,
          availableTimeSlotsWithCapacityObj,
          availableTimeSlotsWithCapacityArray,
        );
        draft.slot = slot;
        break;
      }

      case '3': {
        draft.numberOfPeople = await askForNumPeople(rl);
        break;
      }

      case '4': {
        draft.guestName = await askForName(rl);
        break;
      }

      case '5': {
        draft.guestPhoneNumber = await askForPhone(rl);
        break;
      }

      case '6': {
        const notes = (await askQuestion(
          rl,
          'Any notes? (press Enter to clear): ',
        )) as string;
        draft.notes = notes;
        break;
      }

      default:
        console.log('❌ Invalid choice. Please pick a number from 1 to 7.');
    }
  }
}
