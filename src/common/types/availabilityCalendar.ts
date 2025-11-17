//{ "12:00": 5, "12:30": 20 }
export type TimeSlotsWithCapacity = Record<string, number>;

/* 

{
  "2025-11-14": { "12:00": 5, "12:30": 20 },
  "2025-11-15": { "12:00": 3, "12:30": 10 },
  ...
}
*/
export type AvailabilityCalendar = Record<string, TimeSlotsWithCapacity>;
