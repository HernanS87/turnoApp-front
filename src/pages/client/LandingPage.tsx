import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PROFESSIONAL } from '../../data/professional';
import { SERVICES } from '../../data/services';
import { Calendar, Clock, MapPin, Phone, Mail, Instagram, Facebook, Linkedin } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { siteConfig } = PROFESSIONAL;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {PROFESSIONAL.firstName} {PROFESSIONAL.lastName}
            </h1>
            <p className="text-xl mb-2">{PROFESSIONAL.profession}</p>
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
                <MapPin className="text-primary mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">Dirección</p>
                  <p className="text-sm">{siteConfig.address}</p>
                  <p className="text-sm">{siteConfig.city}, {siteConfig.province}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="text-primary mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">Horario de atención</p>
                  <p className="text-sm">{siteConfig.businessHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="text-primary mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-sm">{PROFESSIONAL.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="text-primary mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm">{PROFESSIONAL.email}</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            {(siteConfig.socialMedia.instagram || siteConfig.socialMedia.facebook || siteConfig.socialMedia.linkedin) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="font-medium text-gray-700 mb-3">Redes sociales</p>
                <div className="flex gap-4">
                  {siteConfig.socialMedia.instagram && (
                    <a href={`https://instagram.com/${siteConfig.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80">
                      <Instagram size={24} />
                    </a>
                  )}
                  {siteConfig.socialMedia.facebook && (
                    <a href={`https://facebook.com/${siteConfig.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80">
                      <Facebook size={24} />
                    </a>
                  )}
                  {siteConfig.socialMedia.linkedin && (
                    <a href={`https://linkedin.com/in/${siteConfig.socialMedia.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-80">
                      <Linkedin size={24} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Services Section */}
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Servicios</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {SERVICES.filter(s => s.status === 'ACTIVE').map((service) => (
              <Card key={service.id} hover>
                <div className="flex flex-col h-full">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 flex-grow">{service.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock size={16} className="text-primary" />
                      <span className="text-sm">{service.durationMinutes} minutos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {service.price === 0 ? 'Gratis' : `$${service.price.toLocaleString()}`}
                      </span>
                      {service.requiresDeposit && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Requiere seña {service.depositPercentage}%
                        </span>
                      )}
                    </div>
                  </div>

                  <Button fullWidth onClick={() => navigate(`/book-appointment/${service.id}`)}>
                    Agendar turno
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="bg-primary text-white text-center">
            <Calendar size={48} className="mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">¿Listo para agendar tu turno?</h3>
            <p className="mb-6 opacity-90">Elegí el servicio que necesitás y reservá tu horario</p>
            <Button
              variant="outline"
              className="bg-white text-primary hover:bg-gray-100"
              onClick={() => navigate(`/book-appointment/${SERVICES[0]?.id || 1}`)}
            >
              Ver disponibilidad
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
