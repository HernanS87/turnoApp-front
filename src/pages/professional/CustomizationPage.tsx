import { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { professionalService } from '../../services/professionalService';
import { Palette, FileText, Save, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { SiteConfig, Professional } from '../../types';

const defaultConfig: SiteConfig = {
  logoUrl: "",
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  professionalDescription: "",
  address: "",
  city: "",
  province: "",
  country: "Argentina",
  businessHours: "",
  welcomeMessage: "Bienvenido",
  socialMedia: {}
};

export const CustomizationPage = () => {
  const [loading, setLoading] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [previewMode, setPreviewMode] = useState(false);

  // Cargar configuración al montar
  useEffect(() => {
    loadSiteConfig();
  }, []);

  const loadSiteConfig = async () => {
    try {
      setLoading(true);
      const prof = await professionalService.getMyProfile();
      setProfessional(prof);
      if (prof.siteConfig) {
        // Merge con valores por defecto para asegurar que todos los campos estén presentes
        // Convertir null/undefined a strings vacíos o valores por defecto
        const mergedConfig: SiteConfig = {
          ...defaultConfig,
          logoUrl: prof.siteConfig.logoUrl || '',
          primaryColor: prof.siteConfig.primaryColor || defaultConfig.primaryColor,
          secondaryColor: prof.siteConfig.secondaryColor || defaultConfig.secondaryColor,
          professionalDescription: prof.siteConfig.professionalDescription || '',
          address: prof.siteConfig.address || '',
          city: prof.siteConfig.city || '',
          province: prof.siteConfig.province || '',
          country: prof.siteConfig.country || defaultConfig.country,
          businessHours: prof.siteConfig.businessHours || '',
          welcomeMessage: prof.siteConfig.welcomeMessage || defaultConfig.welcomeMessage,
          socialMedia: {
            ...defaultConfig.socialMedia,
            ...(prof.siteConfig.socialMedia || {})
          }
        };
        setConfig(mergedConfig);
      } else {
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error loading site config:', error);
      toast.error('Error al cargar la configuración');
      // Usar valores por defecto en caso de error
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updatedProfessional = await professionalService.updateSiteConfig({
        logoUrl: config.logoUrl,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        professionalDescription: config.professionalDescription,
        address: config.address,
        city: config.city,
        province: config.province,
        country: config.country,
        businessHours: config.businessHours,
        welcomeMessage: config.welcomeMessage,
        socialMedia: config.socialMedia
      });
      setProfessional(updatedProfessional);
      if (updatedProfessional.siteConfig) {
        setConfig(updatedProfessional.siteConfig);
      }
      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving site config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };


  const handleColorChange = (field: 'primaryColor' | 'secondaryColor', value: string) => {
    setConfig({ ...config, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Personalización del Sitio</h1>
              <p className="text-gray-600">Personalizá la apariencia de tu sitio profesional</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                <Eye size={16} className="inline mr-2" />
                {previewMode ? 'Ocultar' : 'Vista'} Previa
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={loading}>
                <Save size={16} className="inline mr-2" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Colors */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="text-primary" size={20} />
                <h2 className="text-xl font-bold text-gray-800">Colores</h2>
              </div>

              <div className="space-y-4">
                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Primario
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={config.primaryColor || defaultConfig.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={config.primaryColor || ''}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      placeholder="#6366f1"
                      className="flex-grow"
                    />
                  </div>
                  <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: config.primaryColor || defaultConfig.primaryColor }}>
                    <p className="text-white text-sm font-medium text-center">Vista previa</p>
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Secundario
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={config.secondaryColor || defaultConfig.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={config.secondaryColor || ''}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      placeholder="#8b5cf6"
                      className="flex-grow"
                    />
                  </div>
                  <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: config.secondaryColor || defaultConfig.secondaryColor }}>
                    <p className="text-white text-sm font-medium text-center">Vista previa</p>
                  </div>
                </div>

                {/* Preset Colors */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Combinaciones predefinidas</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'Indigo', primary: '#6366f1', secondary: '#8b5cf6' },
                      { name: 'Azul', primary: '#3b82f6', secondary: '#06b6d4' },
                      { name: 'Verde', primary: '#10b981', secondary: '#14b8a6' },
                      { name: 'Naranja', primary: '#f97316', secondary: '#f59e0b' },
                      { name: 'Rosa', primary: '#ec4899', secondary: '#f43f5e' },
                      { name: 'Violeta', primary: '#8b5cf6', secondary: '#a855f7' }
                    ].map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          setConfig({ ...config, primaryColor: preset.primary, secondaryColor: preset.secondary });
                        }}
                        className="p-2 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
                        title={preset.name}
                      >
                        <div className="flex gap-1">
                          <div className="w-full h-6 rounded" style={{ backgroundColor: preset.primary }} />
                          <div className="w-full h-6 rounded" style={{ backgroundColor: preset.secondary }} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{preset.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Professional Info */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-primary" size={20} />
                <h2 className="text-xl font-bold text-gray-800">Información Profesional</h2>
              </div>

              <div className="space-y-4">
                {/* Welcome Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje de Bienvenida
                  </label>
                  <Input
                    value={config.welcomeMessage || ''}
                    onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                    placeholder="Ej: Bienvenido a mi consultorio virtual"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción Profesional
                  </label>
                  <textarea
                    value={config.professionalDescription || ''}
                    onChange={(e) => setConfig({ ...config, professionalDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={4}
                    placeholder="Describe tu experiencia y especialidad..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(config.professionalDescription || '').length} caracteres
                  </p>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <Input
                    value={config.address || ''}
                    onChange={(e) => setConfig({ ...config, address: e.target.value })}
                    placeholder="Ej: San Martín 1234, Piso 3"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <Input
                    value={config.city || ''}
                    onChange={(e) => setConfig({ ...config, city: e.target.value })}
                    placeholder="Ej: Godoy Cruz"
                  />
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provincia
                  </label>
                  <Input
                    value={config.province || ''}
                    onChange={(e) => setConfig({ ...config, province: e.target.value })}
                    placeholder="Ej: Mendoza"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <Input
                    value={config.country || ''}
                    onChange={(e) => setConfig({ ...config, country: e.target.value })}
                    placeholder="Ej: Argentina"
                  />
                </div>

                {/* Business Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horario de Atención
                  </label>
                  <Input
                    value={config.businessHours || ''}
                    onChange={(e) => setConfig({ ...config, businessHours: e.target.value })}
                    placeholder="Ej: Lunes a Viernes 9:00 - 18:00"
                  />
                </div>

                {/* Social Media */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Redes Sociales
                  </label>
                  <div className="space-y-2">
                    <Input
                      value={config.socialMedia.instagram || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        socialMedia: { ...config.socialMedia, instagram: e.target.value }
                      })}
                      placeholder="Instagram: @usuario"
                    />
                    <Input
                      value={config.socialMedia.facebook || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        socialMedia: { ...config.socialMedia, facebook: e.target.value }
                      })}
                      placeholder="Facebook: usuario"
                    />
                    <Input
                      value={config.socialMedia.linkedin || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        socialMedia: { ...config.socialMedia, linkedin: e.target.value }
                      })}
                      placeholder="LinkedIn: usuario"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Preview */}
          {previewMode && (
            <div className="lg:sticky lg:top-8 lg:self-start">
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="text-primary" size={20} />
                  <h2 className="text-xl font-bold text-gray-800">Vista Previa</h2>
                </div>

                {/* Preview Landing Page Mockup */}
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  {/* Hero Section */}
                  <div
                    className="text-white p-6"
                    style={{
                      background: `linear-gradient(to right, ${config.primaryColor || defaultConfig.primaryColor}, ${config.secondaryColor || defaultConfig.secondaryColor})`
                    }}
                  >
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold">
                        {professional?.firstName} {professional?.lastName}
                      </h3>
                      <p className="text-sm opacity-90">{professional?.profession}</p>
                    </div>
                    <p className="text-lg font-medium">{config.welcomeMessage || 'Bienvenido'}</p>
                  </div>

                  {/* Description */}
                  <div className="p-6 bg-white">
                    <h4 className="font-semibold text-gray-800 mb-2">Sobre mí</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {config.professionalDescription || 'Sin descripción'}
                    </p>
                  </div>

                  {/* Info Cards */}
                  <div className="p-6 bg-gray-50 space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500">Dirección</p>
                      <p className="text-sm font-medium text-gray-800">{config.address || 'No especificada'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500">Horario</p>
                      <p className="text-sm font-medium text-gray-800">{config.businessHours || 'No especificado'}</p>
                    </div>
                  </div>

                  {/* Sample Service Card */}
                  <div className="p-6 bg-white border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Servicios</h4>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-1">Consulta de ejemplo</h5>
                      <p className="text-sm text-gray-600 mb-3">Descripción del servicio</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">$8.000</span>
                        <button
                          className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                          style={{ backgroundColor: config.primaryColor || defaultConfig.primaryColor }}
                        >
                          Agendar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
