import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './Button';
import { LogOut, User, LayoutDashboard, Calendar, Clock, Briefcase, Palette } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const professionalLinks = [
    { path: '/professional/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/professional/appointments', label: 'Turnos', icon: Calendar },
    { path: '/professional/schedule', label: 'Agenda', icon: Clock },
    { path: '/professional/services', label: 'Servicios', icon: Briefcase },
    { path: '/professional/customization', label: 'Personalización', icon: Palette }
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            TurnoApp
          </Link>

          <div className="flex items-center gap-6">
            {/* Navigation Links for Professional */}
            {user?.role === 'professional' && (
              <div className="hidden md:flex items-center gap-1">
                {professionalLinks.map(link => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(link.path)
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={16} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <User size={20} />
                  <span className="text-sm hidden sm:inline">{user.email}</span>
                  <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                    {user.role === 'professional' ? 'Profesional' : 'Cliente'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Salir</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu for Professional */}
        {user?.role === 'professional' && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              {professionalLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
