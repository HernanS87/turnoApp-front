import { format, startOfDay, addDays, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DateAvailability } from '../../types/api';

interface DateSelectorProps {
  availability: DateAvailability[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export const DateSelector = ({ availability, selectedDate, onSelectDate }: DateSelectorProps) => {
  // Generate 30 days starting from today
  const today = startOfDay(new Date());
  const calendarDays: Date[] = [];
  for (let i = 0; i < 30; i++) {
    calendarDays.push(addDays(today, i));
  }

  // Create lookup map for availability
  const availabilityMap = new Map<string, boolean>();
  availability.forEach(a => {
    availabilityMap.set(a.date, a.hasAvailability);
  });

  // Check if any date has availability
  const hasAnyAvailability = availability.some(a => a.hasAvailability);

  if (!hasAnyAvailability) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No hay fechas disponibles para este servicio</p>
        <p className="mt-2 text-sm">Por favor, intenta más tarde o contacta al profesional</p>
      </div>
    );
  }

  // Group days into weeks (starting Monday)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Add empty cells for days before the first day
  const firstDayOfWeek = calendarDays[0].getDay(); // 0 = Sunday, 1 = Monday, ...
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Monday-based (0 = Monday)

  for (let i = 0; i < offset; i++) {
    currentWeek.push(addDays(calendarDays[0], -(offset - i)));
  }

  // Add all calendar days
  calendarDays.forEach((day, index) => {
    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Add remaining days to complete last week
  if (currentWeek.length > 0) {
    const remaining = 7 - currentWeek.length;
    for (let i = 1; i <= remaining; i++) {
      currentWeek.push(addDays(calendarDays[calendarDays.length - 1], i));
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Seleccioná una fecha
      </label>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="py-2 text-xs font-semibold text-gray-500 uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((date, dayIndex) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const hasAvailability = availabilityMap.get(dateStr) || false;
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              const isInRange = date >= today && date < addDays(today, 30);
              const isClickable = hasAvailability && isInRange;

              return (
                <button
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => isClickable && onSelectDate(date)}
                  disabled={!isClickable}
                  className={`
                    relative p-3 rounded-lg text-center transition-all border-2
                    ${isSelected
                      ? 'border-primary bg-primary text-white shadow-md'
                      : isClickable
                        ? 'border-gray-200 bg-white text-gray-800 hover:border-primary hover:bg-primary hover:bg-opacity-10 cursor-pointer'
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }
                    ${isCurrentDay && !isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''}
                  `}
                >
                  <div className={`text-sm font-semibold ${
                    isSelected ? 'text-white' : isClickable ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {format(date, 'd')}
                  </div>
                  
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
