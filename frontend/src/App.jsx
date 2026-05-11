import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ImportModal from './components/ImportModal';
import Home from './pages/Home';
import CreateNpc from './pages/CreateNpc';
import NpcDetail from './pages/NpcDetail';
import EditNpc from './pages/EditNpc';
import Combate from './pages/Combate';
import Login from './pages/Login';
import Registro from './pages/Registro';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MisGrupos from './pages/MisGrupos';
import Perfil from './pages/Perfil';

function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return null;
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return null;
  if (usuario) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const handle = () => setShowImportModal(true);
    window.addEventListener('open-import-modal', handle);
    return () => window.removeEventListener('open-import-modal', handle);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Rutas públicas (sin navbar) */}
        <Route path="/login"            element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/registro"         element={<PublicRoute><Registro /></PublicRoute>} />
        <Route path="/recuperar-contrasena" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password"   element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* Rutas protegidas (con navbar) */}
        <Route path="/*" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/"               element={<Home />} />
                  <Route path="/crear"          element={<CreateNpc />} />
                  <Route path="/npc/:id"        element={<NpcDetail />} />
                  <Route path="/npc/:id/editar" element={<EditNpc />} />
                  <Route path="/combate"        element={<Combate />} />
                  <Route path="/mis-grupos"     element={<MisGrupos />} />
                  <Route path="/perfil"         element={<Perfil />} />
                </Routes>
              </main>
            </>
          </ProtectedRoute>
        } />
      </Routes>
      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}

export default App;
