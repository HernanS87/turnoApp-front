import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateSelectorProps {
  availableDates: Date[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export const DateSelector = ({ availableDates, selectedDate, onSelectDate }: DateSelectorProps) => {
  if (availableDates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay fechas disponibles para este servicio</p>
        <p className="text-sm mt-2">Por favor, intenta más tarde o contacta al profesional</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Seleccioná una fecha
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {availableDates.map((date) => {
          const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

          return (
            <button
              key={date.toISOString()}
              onClick={() => onSelectDate(date)}
              className={`
                p-3 rounded-lg border-2 text-center transition-all
                ${isSelected
                  ? 'border-primary bg-primary text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:bg-primary hover:bg-opacity-5'
                }
              `}
            >
              <div className={`text-xs font-medium uppercase ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                {format(date, 'EEE', { locale: es })}
              </div>
              <div className={`text-2xl font-bold my-1 ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                {format(date, 'dd')}
              </div>
              <div className={`text-xs ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                {format(date, 'MMM', { locale: es })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
