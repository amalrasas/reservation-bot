import { createInterface } from 'readline';
import { askQuestion } from './askQuestion';
import { newReservationFlow } from './newReservationFlow';
import { cancelReservationFlow } from './cancelReservationFlow';
import { modifyReservationFlow } from './modifyReservationFlow';

const rl = createInterface({ input: process.stdin, output: process.stdout });

async function mainMenu() {
  try {
    console.log('==============================================');
    console.log(' 🍽  Welcome to the Restaurant Reservation Bot');
    console.log('==============================================\n');
    console.log('How can I help you?');

    let exit = false;

    while (!exit) {
      console.log('  1) Book a new reservation');
      console.log('  2) Modify a reservation');
      console.log('  3) Cancel a reservation');
      console.log('  4) Exit\n');

      const choice = (
        (await askQuestion(rl, 'Choose an option (1-4): ')) as string
      )
        .trim()
        .toLowerCase();

      switch (choice) {
        case '1':
          await newReservationFlow(rl);
          console.log('Is there anything else I can help you with?');
          break;

        case '2':
          await modifyReservationFlow(rl);
          console.log('Is there anything else I can help you with?');
          break;

        case '3':
          await cancelReservationFlow(rl);
          console.log('Is there anything else I can help you with?');
          break;

        case '4':
        case 'exit':
          exit = true;
          break;

        default:
          console.log('Invalid Choice, please choose a number from 1-4');
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    rl.close();
    console.log('\n👋 Goodbye!\n');
  }
}

mainMenu()
  .then()
  .catch((e) => console.error(e));
