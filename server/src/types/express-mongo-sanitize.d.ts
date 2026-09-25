declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'express';

  interface Options {
    replaceWith?: string;
    onSanitize?: (data: { req: any; key: string }) => void;
    dryRun?: boolean;
    allowDots?: boolean;
  }

  function mongoSanitize(options?: Options): RequestHandler;

  namespace mongoSanitize {
    function sanitize<T>(target: T, options?: Options): T;
    function has<T>(target: T, allowDots?: boolean): boolean;
  }

  export = mongoSanitize;
}
