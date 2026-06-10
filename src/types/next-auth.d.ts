import { DefaultSession, DefaultJWT } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id:          string;
      role:        string;
      permissions: string[];
    };
  }

  interface User {
    role:        string;
    permissions: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id:          string;
    role:        string;
    permissions: string[];
  }
}