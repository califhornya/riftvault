declare module 'react-dom' {
  import type { ReactElement } from 'react';

  export function render(element: ReactElement, container: any): void;
  export function createPortal(children: any, container: any): any;
}
