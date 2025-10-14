import { ScheduleSlot } from '../types';

export const SCHEDULE: ScheduleSlot[] = [
  { id: 1, dayOfWeek: 1, startTime: "09:00", endTime: "13:00", active: true }, // Monday AM
  { id: 2, dayOfWeek: 1, startTime: "15:00", endTime: "19:00", active: true }, // Monday PM
  { id: 3, dayOfWeek: 2, startTime: "09:00", endTime: "13:00", active: true }, // Tuesday AM
  { id: 4, dayOfWeek: 2, startTime: "15:00", endTime: "19:00", active: true }, // Tuesday PM
  { id: 5, dayOfWeek: 3, startTime: "09:00", endTime: "13:00", active: true }, // Wednesday AM
  { id: 6, dayOfWeek: 3, startTime: "15:00", endTime: "19:00", active: false }, // Wednesday PM (inactive)
  { id: 7, dayOfWeek: 4, startTime: "09:00", endTime: "13:00", active: true }, // Thursday AM
  { id: 8, dayOfWeek: 4, startTime: "15:00", endTime: "19:00", active: true }, // Thursday PM
  { id: 9, dayOfWeek: 5, startTime: "09:00", endTime: "13:00", active: true }, // Friday AM
  { id: 10, dayOfWeek: 5, startTime: "15:00", endTime: "18:00", active: true } // Friday PM (until 6pm)
];

// Days of week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
