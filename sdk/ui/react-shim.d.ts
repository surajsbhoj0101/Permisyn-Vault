declare module "react" {
  export type ReactNode = unknown;
  export type CSSProperties = Record<string, string | number | undefined>;

  export interface ChangeEvent<T = Element> {
    currentTarget: T;
    target: T;
  }

  export interface MouseEvent<T = Element> {
    currentTarget: T;
  }

  export interface ButtonHTMLAttributes<T> {
    className?: string;
    disabled?: boolean;
    onClick?: (event: MouseEvent<T>) => void | Promise<void>;
    style?: CSSProperties;
    type?: "button" | "submit" | "reset";
  }

  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;

  export function useState<S>(
    initialState: S | (() => S),
  ): [S, (value: S | ((previous: S) => S)) => void];
}

declare module "react/jsx-runtime" {
  export const Fragment: unique symbol;
  export function jsx(type: unknown, props: unknown, key?: unknown): unknown;
  export function jsxs(type: unknown, props: unknown, key?: unknown): unknown;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>;
  }
}
