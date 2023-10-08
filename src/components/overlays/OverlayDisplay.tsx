import classNames from "classnames";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Transition } from "@/components/Transition";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";

export interface OverlayProps {
  id: string;
  children?: ReactNode;
  darken?: boolean;
}

export function OverlayDisplay(props: { children: ReactNode }) {
  return <div className="popout-location">{props.children}</div>;
}

export function Overlay(props: OverlayProps) {
  const router = useOverlayRouter(props.id);
  const [portalElement, setPortalElement] = useState<Element | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef<Element | null>(null);

  useEffect(() => {
    function listen(e: MouseEvent) {
      target.current = e.target as Element;
    }
    document.addEventListener("mousedown", listen);
    return () => {
      document.removeEventListener("mousedown", listen);
    };
  });

  const click = useCallback(
    (e: React.MouseEvent) => {
      const startedTarget = target.current;
      target.current = null;
      if (e.currentTarget !== e.target) return;
      if (!startedTarget) return;
      if (!startedTarget.isEqualNode(e.currentTarget as Element)) return;
      router.close();
    },
    [router]
  );

  useEffect(() => {
    const element = ref.current?.closest(".popout-location");
    setPortalElement(element ?? document.body);
  }, []);

  return (
    <div ref={ref}>
      {portalElement
        ? createPortal(
            <Transition show={router.isOverlayActive()} animation="none">
              <div className="popout-wrapper pointer-events-auto fixed inset-0 z-[999] select-none">
                <Transition animation="fade" isChild>
                  <div
                    onClick={click}
                    className={classNames({
                      "absolute inset-0": true,
                      "bg-black opacity-90": props.darken,
                    })}
                  />
                </Transition>
                <Transition animation="slide-up" className="h-0" isChild>
                  {props.children}
                </Transition>
              </div>
            </Transition>,
            portalElement
          )
        : null}
    </div>
  );
}
