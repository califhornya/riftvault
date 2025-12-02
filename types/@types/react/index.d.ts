declare namespace React {
  type Key = string | number;
  type ReactText = string | number;
  type ReactChild = ReactElement | ReactText;
  type ReactNode = ReactChild | ReactNode[] | boolean | null | undefined;

  interface Attributes {
    key?: Key | null;
  }

  interface ReactElement<T = any, P = any> {
    type: T;
    props: P;
    key: Key | null;
  }

  interface FunctionComponent<P = {}> {
    (props: P & { children?: ReactNode }): ReactElement | null;
  }
  type FC<P = {}> = FunctionComponent<P>;

  interface CSSProperties {
    [key: string]: string | number | undefined;
  }

  interface FormEvent<T = any> {
    preventDefault(): void;
    target: T;
    currentTarget: T;
  }

  function createElement(type: any, props?: any, ...children: any[]): ReactElement;
  function useState<S>(initialState: S | (() => S)): [S, (value: S) => void];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useMemo<T>(factory: () => T, deps: any[]): T;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
}

declare module 'react' {
  export = React;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
