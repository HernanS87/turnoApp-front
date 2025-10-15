import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/common/Navbar';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/client/LandingPage';
import { ClientDashboardPage } from './pages/client/ClientDashboardPage';
import { BookAppointmentPage } from './pages/client/BookAppointmentPage';
import { PayDepositPage } from './pages/client/PayDepositPage';
import { DashboardPage } from './pages/professional/DashboardPage';
import { ReactNode } from 'react';
import { PROFESSIONAL } from './data/professional';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'professional' | 'client';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Professional Landing Wrapper
const ProfessionalLandingWrapper = () => {
  const { professionalUrl } = useParams<{ professionalUrl: string }>();

  // Validate professional exists
  if (professionalUrl !== PROFESSIONAL.customUrl) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      {/* Public navbar - no auth required */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">TurnoApp</div>
          <a href="/login" className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90">
            Iniciar Sesión
          </a>
        </div>
      </nav>
      <LandingPage />
    </div>
  );
};

// Routes Component (needs to be inside Router but can use useAuth)
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        user ? (
          user.role === 'professional' ?
            <Navigate to="/professional/dashboard" replace /> :
            <Navigate to="/client/dashboard" replace />
        ) : (
          <LoginPage />
        )
      } />

      {/* Public Professional Landing */}
      <Route path="/:professionalUrl" element={<ProfessionalLandingWrapper />} />

      {/* Public Booking Route */}
      <Route path="/book-appointment/:serviceId" element={<BookAppointmentPage />} />

      {/* Client Routes */}
      <Route path="/client/dashboard" element={
        <ProtectedRoute requiredRole="client">
          <>
            <Navbar />
            <ClientDashboardPage />
          </>
        </ProtectedRoute>
      } />

      <Route path="/pay-deposit" element={
        <ProtectedRoute requiredRole="client">
          <PayDepositPage />
        </ProtectedRoute>
      } />

      {/* Professional Routes */}
      <Route path="/professional/dashboard" element={
        <ProtectedRoute requiredRole="professional">
          <>
            <Navbar />
            <DashboardPage />
          </>
        </ProtectedRoute>
      } />

      {/* Default Route */}
      <Route path="/" element={
        user ? (
          user.role === 'professional' ?
            <Navigate to="/professional/dashboard" replace /> :
            <Navigate to="/client/dashboard" replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
