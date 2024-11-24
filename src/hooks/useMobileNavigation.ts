import { useLocation, useNavigate } from 'react-router-dom';
import { useMobile } from '../contexts/MobileContext';

export function useMobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useMobile();

  const navigateWithAnimation = (to: string, options?: { replace?: boolean }) => {
    if (isMobile) {
      // Add page transition animation
      document.documentElement.classList.add('page-transition');
      setTimeout(() => {
        navigate(to, options);
        setTimeout(() => {
          document.documentElement.classList.remove('page-transition');
        }, 300);
      }, 150);
    } else {
      navigate(to, options);
    }
  };

  return {
    navigateWithAnimation,
    currentPath: location.pathname,
    isMobile
  };
} 