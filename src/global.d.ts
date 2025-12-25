declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

/// <reference types="@testing-library/jest-dom" />

// Webpack require.context types
interface RequireContext {
  keys(): string[];
  (id: string): any;
  <T>(id: string): T;
  resolve(id: string): string;
  id: string;
}

declare var require: {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp,
    mode?: 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once'
  ): RequireContext;
} & NodeRequire;
