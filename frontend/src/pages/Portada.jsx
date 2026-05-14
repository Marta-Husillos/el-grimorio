import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroGrimorio from '../components/HeroGrimorio';

function Portada() {
  const navigate = useNavigate();

  // La portada es pantalla completa (canvas 100vh): ocultamos el scroll del
  // body mientras está montada, igual que hacía el antiguo Home.
  useEffect(() => {
    document.body.classList.add('grimorio-active');
    return () => document.body.classList.remove('grimorio-active');
  }, []);

  return <HeroGrimorio onEnter={() => navigate('/fichas', { replace: true })} />;
}

export default Portada;
