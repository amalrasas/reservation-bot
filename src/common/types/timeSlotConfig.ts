export type TimeSlotDurationUnit = 'seconds' | 'minutes' | 'hours';

export interface TimeSlotConfig {
  slots: string[];
  slotDuration: number;
  durationUnit: TimeSlotDurationUnit;
}
