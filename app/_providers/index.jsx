import { ContactModalProvider } from '@/components';

import { BalancerProvider } from './balancer';
import { StyledComponentsRegistry } from './styled-components';

/** @param {import('react').PropsWithChildren<unknown>} */
export function Providers({ children }) {
  return (
    <StyledComponentsRegistry>
      <BalancerProvider>
        <ContactModalProvider>{children}</ContactModalProvider>
      </BalancerProvider>
    </StyledComponentsRegistry>
  );
}
