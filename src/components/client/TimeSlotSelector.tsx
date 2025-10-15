import { Clock } from 'lucide-react';

interface TimeSlotSelectorProps {
  availableSlots: string[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

export const TimeSlotSelector = ({ availableSlots, selectedTime, onSelectTime }: TimeSlotSelectorProps) => {
  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock size={48} className="mx-auto mb-3 opacity-50" />
        <p>No hay horarios disponibles para esta fecha</p>
        <p className="text-sm mt-2">Por favor, seleccioná otra fecha</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Seleccioná un horario
      </label>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {availableSlots.map((time) => {
          const isSelected = selectedTime === time;

          return (
            <button
              key={time}
              onClick={() => onSelectTime(time)}
              className={`
                py-2.5 px-3 rounded-lg border-2 text-center font-medium transition-all
                ${isSelected
                  ? 'border-primary bg-primary text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:bg-primary hover:bg-opacity-5'
                }
              `}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
};
