import { UserPayload } from "./user";
import { User } from "@prisma/client";

// Express.Request에 user 속성 추가

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

declare module "express-serve-static-core" {
  interface Request {
    log: typeof logger;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; 
      requestId?: string;
      log?: Logger;
    }
  }
}


export {};
