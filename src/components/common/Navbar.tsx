import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './Button';
import { LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          TurnoApp
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="flex items-center gap-2 text-gray-700">
                <User size={20} />
                <span className="text-sm">{user.email}</span>
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
                Salir
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
