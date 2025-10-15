import { addDays, format, parseISO, setHours, setMinutes, isAfter, isBefore, startOfDay } from 'date-fns';
import { SCHEDULE } from '../data/schedule';
import { APPOINTMENTS } from '../data/appointments';
import { Service } from '../types';

/**
 * Calculate available time slots for a specific date and service
 */
export const getAvailableSlots = (date: Date, service: Service): string[] => {
  const dayOfWeek = date.getDay();
  const dateString = format(date, 'yyyy-MM-dd');

  // Get schedule for this day of week
  const daySchedule = SCHEDULE.filter(
    slot => slot.dayOfWeek === dayOfWeek && slot.active
  );

  if (daySchedule.length === 0) {
    return [];
  }

  // Get existing appointments for this date (from both hardcoded and localStorage)
  const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  const allAppointments = [...APPOINTMENTS, ...storedAppointments];

  const existingAppointments = allAppointments.filter(
    apt => apt.date === dateString && apt.status !== 'CANCELLED'
  );

  const availableSlots: string[] = [];

  // For each schedule block
  daySchedule.forEach(schedule => {
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);

    let currentTime = setMinutes(setHours(date, startHour), startMin);
    const endTime = setMinutes(setHours(date, endHour), endMin);

    // Generate slots every service.durationMinutes
    while (isBefore(currentTime, endTime)) {
      const slotStartTime = format(currentTime, 'HH:mm');

      // Calculate end time for this slot
      const slotEndDate = new Date(currentTime.getTime() + service.durationMinutes * 60000);
      const slotEndTime = format(slotEndDate, 'HH:mm');

      // Check if slot doesn't exceed schedule end time
      if (!isAfter(slotEndDate, endTime)) {
        // Check if slot doesn't overlap with existing appointments
        const hasConflict = existingAppointments.some(apt => {
          return !(slotEndTime <= apt.startTime || slotStartTime >= apt.endTime);
        });

        if (!hasConflict) {
          availableSlots.push(slotStartTime);
        }
      }

      // Move to next slot
      currentTime = slotEndDate;
    }
  });

  return availableSlots;
};

/**
 * Get next available dates (next days with availability, up to maxDays)
 */
export const getAvailableDates = (service: Service, maxDays: number = 14): Date[] => {
  const availableDates: Date[] = [];
  const today = new Date();
  const todayStart = startOfDay(today);

  // Check up to 30 days to find maxDays days with availability
  for (let i = 0; i < 30 && availableDates.length < maxDays; i++) {
    const checkDate = addDays(todayStart, i);
    const slots = getAvailableSlots(checkDate, service);

    if (slots.length > 0) {
      availableDates.push(checkDate);
    }
  }

  return availableDates;
};

/**
 * Calculate end time based on start time and duration
 */
export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  const endDate = new Date(date.getTime() + durationMinutes * 60000);
  return format(endDate, 'HH:mm');
};
