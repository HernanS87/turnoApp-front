import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Search, MapPin, Briefcase, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { professionalService } from '../../services/professionalService';
import { getErrorMessage } from '../../utils/errorHandler';
import { toast } from 'react-toastify';
import type { Professional } from '../../types';

export const FindProfessionalsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [professionFilter, setProfessionFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // All Argentine provinces (hardcoded list)
  const allProvinces = [
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán'
  ];

  // Unique values for filters
  const [availableProfessions, setAvailableProfessions] = useState<string[]>([]);
  const [availableProvinces] = useState<string[]>(allProvinces); // Initialize with all provinces (hardcoded)
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Track if province has been initialized from user
  const provinceInitialized = useRef(false);

  const pageSize = 12;

  // Load filter options from all professionals
  const loadFilterOptions = async () => {
    try {
      console.log('Loading filter options...');
      const options = await professionalService.getFilterOptions();
      console.log('Filter options loaded:', {
        professions: options.professions.length,
        provinces: options.provinces.length,
        cities: options.cities.length,
        provincesList: options.provinces
      });
      setAvailableProfessions(options.professions);
      // Provinces are hardcoded (all Argentine provinces), so we don't update them
      setAvailableCities(options.cities);
    } catch (error) {
      console.error('Error al cargar opciones de filtros:', error);
      toast.error(getErrorMessage(error, 'Error al cargar opciones de filtros'));
    }
  };

  // Load professionals with filters
  const loadProfessionals = async (page: number = 0) => {
    setLoading(true);
    try {
      const filters = {
        profession: professionFilter || undefined,
        province: provinceFilter || undefined,
        city: cityFilter || undefined,
        search: searchTerm || undefined,
        page,
        size: pageSize,
      };
      console.log('Loading professionals with filters:', filters);
      const result = await professionalService.searchProfessionals(filters);

      console.log('Professionals loaded:', result.content.length, 'total:', result.totalElements);
      setProfessionals(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
      setCurrentPage(result.number);
    } catch (error) {
      console.error('Error loading professionals:', error);
      toast.error(getErrorMessage(error, 'Error al buscar profesionales'));
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Track if initial load has been done
  const initialLoadDone = useRef(false);

  // Set province filter from user when user is loaded (only once)
  useEffect(() => {
    if (user?.province && !provinceInitialized.current) {
      console.log('Setting province filter from user:', user.province);
      setProvinceFilter(user.province);
      provinceInitialized.current = true;
    }
  }, [user]);

  // Load professionals when filters change (including initial load with user's province)
  useEffect(() => {
    // Skip initial load if province hasn't been set yet (wait for user province to be set)
    if (!provinceInitialized.current && user?.province) {
      console.log('Waiting for province to be set from user...');
      return;
    }
    
    console.log('Filters changed, loading professionals. Province filter:', provinceFilter);
    loadProfessionals(0);
    initialLoadDone.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionFilter, provinceFilter, cityFilter, searchTerm]);

  const handleSearch = () => {
    setCurrentPage(0);
    loadProfessionals(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setProfessionFilter('');
    setProvinceFilter('');
    setCityFilter('');
    setCurrentPage(0);
    setTimeout(() => loadProfessionals(0), 100);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadProfessionals(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Buscar Profesionales</h1>
          <p className="text-gray-600">Encuentra el profesional que necesitas</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button onClick={handleSearch} className="whitespace-nowrap">
              Buscar
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="whitespace-nowrap"
            >
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <Briefcase size={16} className="inline mr-2" />
                  Profesión
                </label>
                <select
                  value={professionFilter}
                  onChange={(e) => setProfessionFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todas las profesiones</option>
                  {availableProfessions.map((prof) => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <MapPin size={16} className="inline mr-2" />
                  Provincia
                </label>
                <select
                  value={provinceFilter}
                  onChange={(e) => {
                    setProvinceFilter(e.target.value);
                    setCityFilter(''); // Reset city when province changes
                    provinceInitialized.current = true; // Mark as manually changed
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todas las provincias</option>
                  {availableProvinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  <MapPin size={16} className="inline mr-2" />
                  Ciudad
                </label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todas las ciudades</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {(professionFilter || provinceFilter || cityFilter || searchTerm) && (
                <div className="md:col-span-3">
                  <Button variant="secondary" onClick={handleClearFilters} className="w-full md:w-auto">
                    Limpiar Filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 text-gray-600">
            {totalElements > 0 ? (
              <p>
                Mostrando {professionals.length} de {totalElements} profesional{totalElements !== 1 ? 'es' : ''}
              </p>
            ) : (
              <p>No se encontraron profesionales</p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
              <p className="text-gray-600">Buscando profesionales...</p>
            </div>
          </div>
        )}

        {/* Professionals Grid */}
        {!loading && professionals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {professionals.map((professional) => (
              <Card
                key={professional.id}
                hover
                className="transition-all border-2 border-transparent cursor-pointer hover:border-primary"
                onClick={() => navigate(`/${professional.customUrl}`)}
              >
                <div className="flex flex-col h-full">
                  {/* Avatar/Initials */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white rounded-full bg-primary">
                      {professional.firstName[0]}
                      {professional.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">
                        {professional.firstName} {professional.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Briefcase size={14} />
                        {professional.profession}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {(professional.siteConfig?.city || professional.siteConfig?.province) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <MapPin size={14} />
                      <span>
                        {[professional.siteConfig.city, professional.siteConfig.province]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Description Preview */}
                  {professional.siteConfig?.professionalDescription && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                      {professional.siteConfig.professionalDescription}
                    </p>
                  )}

                  {/* Action Button */}
                  <Button className="mt-auto" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/${professional.customUrl}`);
                  }}>
                    Ver perfil y agendar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && professionals.length === 0 && (
          <Card>
            <div className="py-12 text-center">
              <User size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">No se encontraron profesionales</p>
              <p className="text-gray-600 mb-4">
                Intenta ajustar tus filtros de búsqueda o limpiar los filtros para ver más resultados.
              </p>
              <Button onClick={handleClearFilters}>Limpiar Filtros</Button>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="flex items-center gap-2"
            >
              Siguiente
              <ChevronRight size={20} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

