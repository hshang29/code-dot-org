/* eslint-disable jsx-a11y/no-noninteractive-element-interactions -- Modal containers handle Tab and Escape to manage focus. */
import {useLayoutEffect, useRef, type HTMLAttributes} from 'react';

import {OCEANS_UI_CONTAINER_ID} from '@/oceans/constants';

interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  modal?: boolean;
  onDismiss?: () => void;
  returnFocusId?: string;
}

export default function Dialog({
  modal = true,
  onDismiss,
  returnFocusId,
  children,
  ...props
}: DialogProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => {
      queueMicrotask(() => {
        if (
          document.querySelector(
            `#${OCEANS_UI_CONTAINER_ID} [aria-modal="true"]`,
          )
        )
          return;
        const target = returnFocusId
          ? document.getElementById(returnFocusId)
          : previous;
        if (target?.isConnected && !target.closest('[inert]')) target.focus();
        else
          document
            .querySelector<HTMLElement>(
              `#${OCEANS_UI_CONTAINER_ID} .ocean-scene-heading`,
            )
            ?.focus();
      });
    };
  }, [modal, returnFocusId]);

  if (!modal)
    return (
      <section {...props} ref={ref}>
        {children}
      </section>
    );

  return (
    <div
      {...props}
      ref={ref}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={event => {
        if (!modal) return;
        if (event.key === 'Escape' && onDismiss) {
          event.preventDefault();
          event.stopPropagation();
          onDismiss();
        }
        if (event.key !== 'Tab') return;
        const controls = Array.from(
          ref.current!.querySelectorAll<HTMLElement>(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
          ),
        );
        const first = controls[0];
        const last = controls.at(-1);
        if (!first) {
          event.preventDefault();
          ref.current?.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      {children}
    </div>
  );
}
