import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { AvailabilityCalendar } from 'src/common/types';

const AVAILABILITY_FILE_PATH = join(process.cwd(), 'availability.json');

export function loadAvailabilityFromFile(): AvailabilityCalendar | null {
  if (!existsSync(AVAILABILITY_FILE_PATH)) return null;

  try {
    const raw = readFileSync(AVAILABILITY_FILE_PATH, 'utf8');
    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') return null;

    return parsed as AvailabilityCalendar;
  } catch (e) {
    console.error('Failed to load availability from file', e);

    return null;
  }
}

export function saveAvailabilityToFile(
  availability: AvailabilityCalendar,
): void {
  try {
    writeFileSync(
      AVAILABILITY_FILE_PATH,
      JSON.stringify(availability, null, 2),
      'utf8',
    );
  } catch (e) {
    console.error('Failed to save availability to file', e);
  }
}
