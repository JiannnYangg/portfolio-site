'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AnimatePresence } from 'framer-motion';

import { ContactModal } from './modal';

const ContactModalContext = createContext({
  isOpen: false,
  open: () => {},
  close: () => {},
});

/**
 * Owns the "Let's talk" popup. It is mounted once (see app/_providers), so any
 * button on the site can open it with `const { open } = useContactModal()`.
 * It remembers which element opened it and gives the focus back once the popup
 * has finished closing.
 *
 * @param {import('react').PropsWithChildren<unknown>} props
 */
export function ContactModalProvider({ children }) {
  const [isOpen, setOpen] = useState(false);
  const triggerRef = useRef(null);

  const open = useCallback(() => {
    triggerRef.current = document.activeElement;
    //? the mobile menu may be open behind the popup: close it
    window.dispatchEvent(new Event('offcanvas:close'));
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const restoreFocus = useCallback(() => {
    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger && typeof trigger.focus === 'function') {
      trigger.focus({ preventScroll: true });
    }
  }, []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      <AnimatePresence onExitComplete={restoreFocus}>
        {isOpen ? <ContactModal key='contact-modal' onClose={close} /> : null}
      </AnimatePresence>
    </ContactModalContext.Provider>
  );
}

export function useContactModal() {
  return useContext(ContactModalContext);
}
