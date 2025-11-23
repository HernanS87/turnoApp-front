import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import serviceService from '../../services/serviceService';
import { getErrorMessage } from '../../utils/errorHandler';
import { Clock, MapPin, Phone, Mail, Instagram, Facebook, Linkedin } from 'lucide-react';
import { toast } from 'react-toastify';
import { Professional, SiteConfig } from '../../types';
import type { ServiceResponse } from '../../types/api';

interface LandingPageProps {
  professional: Professional;
}

const getStorageKey = (professionalId: number) => `siteConfig_${professionalId}`;

export const LandingPage = ({ professional }: LandingPageProps) => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Load custom config from localStorage or use default
  const siteConfig: SiteConfig = (() => {
    const stored = localStorage.getItem(getStorageKey(professional.id));
    return stored ? JSON.parse(stored) : professional.siteConfig;
  })();

  // Load services from API on mount
  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const data = await serviceService.getPublicServicesByCustomUrl(professional.customUrl);
        // Backend already returns only ACTIVE services
        setServices(data);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Error al cargar servicios'));
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [professional.customUrl]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="text-white py-16"
        style={{
          background: `linear-gradient(to right, ${siteConfig.primaryColor}, ${siteConfig.secondaryColor})`
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {siteConfig.logoUrl && siteConfig.logoUrl !== '/assets/logo-default.png' && (
              <img
                src={siteConfig.logoUrl}
                alt="Logo"
                className="w-32 h-32 mx-auto mb-6 object-contain bg-white rounded-lg p-3 shadow-lg"
              />
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {professional.firstName} {professional.lastName}
            </h1>
            <p className="text-xl mb-2">{professional.profession}</p>
            <p className="text-lg opacity-90">{siteConfig.welcomeMessage}</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sobre mí</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {siteConfig.professionalDescription}
            </p>

            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 flex-shrink-0" size={20} style={{ color: siteConfig.primaryColor }} />
                <div>
                  <p className="font-medium">Dirección</p>
                  <p className="text-sm">{siteConfig.address}</p>
                  <p className="text-sm">{siteConfig.city}, {siteConfig.province}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="mt-1 flex-shrink-0" size={20} style={{ color: siteConfig.primaryColor }} />
                <div>
                  <p className="font-medium">Horario de atención</p>
                  <p className="text-sm">{siteConfig.businessHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-1 flex-shrink-0" size={20} style={{ color: siteConfig.primaryColor }} />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-sm">{professional.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-1 flex-shrink-0" size={20} style={{ color: siteConfig.primaryColor }} />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm">{professional.email}</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            {(siteConfig.socialMedia.instagram || siteConfig.socialMedia.facebook || siteConfig.socialMedia.linkedin) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="font-medium text-gray-700 mb-3">Redes sociales</p>
                <div className="flex gap-4">
                  {siteConfig.socialMedia.instagram && (
                    <a href={`https://instagram.com/${siteConfig.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80" style={{ color: siteConfig.primaryColor }}>
                      <Instagram size={24} />
                    </a>
                  )}
                  {siteConfig.socialMedia.facebook && (
                    <a href={`https://facebook.com/${siteConfig.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80" style={{ color: siteConfig.primaryColor }}>
                      <Facebook size={24} />
                    </a>
                  )}
                  {siteConfig.socialMedia.linkedin && (
                    <a href={`https://linkedin.com/in/${siteConfig.socialMedia.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80" style={{ color: siteConfig.primaryColor }}>
                      <Linkedin size={24} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Services Section */}
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Servicios</h2>
          {loading ? (
            <Card>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando servicios...</p>
              </div>
            </Card>
          ) : services.length === 0 ? (
            <Card>
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Este profesional aún no ha configurado sus servicios.</p>
                <p className="text-sm mt-2">Vuelva pronto para ver las opciones disponibles.</p>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {services.map((service) => (
                <Card key={service.id} hover>
                  <div className="flex flex-col h-full">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 flex-grow">{service.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={16} style={{ color: siteConfig.primaryColor }} />
                        <span className="text-sm">{service.duration} minutos</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold" style={{ color: siteConfig.primaryColor }}>
                          {service.price === 0 ? 'Gratis' : `$${service.price.toLocaleString()}`}
                        </span>
                        {service.depositPercentage > 0 && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Requiere seña {service.depositPercentage}%
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      className="w-full px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: siteConfig.primaryColor }}
                      onClick={() => navigate(`/${professional.customUrl}/book/${service.id}`)}
                    >
                      Agendar turno
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
