import { Interface } from 'readline';

export function askQuestion(rl: Interface, question: string) {
  return new Promise((resolve) =>
    rl.question(question, (answer) => resolve(answer.trim())),
  );
}
