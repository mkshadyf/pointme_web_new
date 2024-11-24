import { useMobile } from '../contexts/MobileContext';
import { MobileLayout } from '../components/layouts/MobileLayout';
import { MobileNavigation } from '../components/mobile/MobileNavigation';

export function withMobileLayout(Component: React.ComponentType, title?: string) {
  return function WrappedComponent(props: any) {
    const { isMobile } = useMobile();

    if (!isMobile) {
      return <Component {...props} />;
    }

    return (
      <MobileLayout title={title} showBackButton>
        <Component {...props} />
        <MobileNavigation />
      </MobileLayout>
    );
  };
} 