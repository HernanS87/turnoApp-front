import { ScheduleSlot } from '../types';
import { SCHEDULE } from '../data/schedule';

const getStorageKey = (professionalId: number) => `schedule_${professionalId}`;

/**
 * Get all schedule slots (hardcoded + stored in localStorage)
 */
export const getAllScheduleSlots = (professionalId: number = 1): ScheduleSlot[] => {
  const stored = localStorage.getItem(getStorageKey(professionalId));
  const storedSlots = stored ? JSON.parse(stored) : [];

  // If there are stored slots, use them; otherwise use hardcoded (only for María)
  if (storedSlots.length > 0) {
    return storedSlots;
  }

  // Only María (professionalId=1) has hardcoded schedule, others start empty
  return professionalId === 1 ? SCHEDULE : [];
};

/**
 * Get schedule slots for a specific day
 */
export const getScheduleByDay = (dayOfWeek: number, professionalId: number = 1): ScheduleSlot[] => {
  return getAllScheduleSlots(professionalId).filter(slot => slot.dayOfWeek === dayOfWeek);
};

/**
 * Get active schedule slots for a specific day
 */
export const getActiveScheduleByDay = (dayOfWeek: number, professionalId: number = 1): ScheduleSlot[] => {
  return getAllScheduleSlots(professionalId).filter(slot => slot.dayOfWeek === dayOfWeek && slot.active);
};

/**
 * Create a new schedule slot
 */
export const createScheduleSlot = (slotData: Omit<ScheduleSlot, 'id'>, professionalId: number = 1): ScheduleSlot => {
  const allSlots = getAllScheduleSlots(professionalId);

  // Generate new ID
  const maxId = allSlots.reduce((max, slot) => Math.max(max, slot.id), 0);

  const newSlot: ScheduleSlot = {
    ...slotData,
    id: maxId + 1
  };

  const updatedSlots = [...allSlots, newSlot];

  // Save to localStorage
  localStorage.setItem(getStorageKey(professionalId), JSON.stringify(updatedSlots));

  return newSlot;
};

/**
 * Update a schedule slot
 */
export const updateScheduleSlot = (id: number, updates: Partial<ScheduleSlot>, professionalId: number = 1): ScheduleSlot | null => {
  const allSlots = getAllScheduleSlots(professionalId);
  const index = allSlots.findIndex(slot => slot.id === id);

  if (index !== -1) {
    allSlots[index] = { ...allSlots[index], ...updates };
    localStorage.setItem(getStorageKey(professionalId), JSON.stringify(allSlots));
    return allSlots[index];
  }

  return null;
};

/**
 * Delete a schedule slot
 */
export const deleteScheduleSlot = (id: number, professionalId: number = 1): boolean => {
  const allSlots = getAllScheduleSlots(professionalId);
  const filteredSlots = allSlots.filter(slot => slot.id !== id);

  if (filteredSlots.length < allSlots.length) {
    localStorage.setItem(getStorageKey(professionalId), JSON.stringify(filteredSlots));
    return true;
  }

  return false;
};

/**
 * Toggle active status of a schedule slot
 */
export const toggleScheduleSlotActive = (id: number, professionalId: number = 1): boolean => {
  const allSlots = getAllScheduleSlots(professionalId);
  const slot = allSlots.find(s => s.id === id);

  if (slot) {
    const updated = updateScheduleSlot(id, { active: !slot.active }, professionalId);
    return updated !== null;
  }

  return false;
};

/**
 * Replace entire schedule (useful for bulk updates)
 */
export const replaceSchedule = (newSchedule: ScheduleSlot[], professionalId: number = 1): void => {
  localStorage.setItem(getStorageKey(professionalId), JSON.stringify(newSchedule));
};

/**
 * Reset schedule to hardcoded defaults
 */
export const resetScheduleToDefaults = (professionalId: number = 1): void => {
  localStorage.removeItem(getStorageKey(professionalId));
};

/**
 * Validate time slot doesn't overlap with existing slots for the same day
 */
export const validateNoOverlap = (
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  excludeId?: number,
  professionalId: number = 1
): boolean => {
  const daySlots = getAllScheduleSlots(professionalId).filter(
    slot => slot.dayOfWeek === dayOfWeek && slot.id !== excludeId && slot.active
  );

  for (const slot of daySlots) {
    // Check if times overlap
    if (
      (startTime >= slot.startTime && startTime < slot.endTime) ||
      (endTime > slot.startTime && endTime <= slot.endTime) ||
      (startTime <= slot.startTime && endTime >= slot.endTime)
    ) {
      return false;
    }
  }

  return true;
};
