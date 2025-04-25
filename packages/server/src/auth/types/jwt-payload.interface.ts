// packages/server/src/auth/types/jwt-payload.interface.ts
export interface JwtPayload {
  sub: string; // Subject (usually the user ID)
  email?: string; // Optional email
  roles?: string[]; // Optional roles
  // Add other properties present in your JWT payload
}

// Extend JwtPayload to include the 'id' property explicitly added by the guard
export interface UserPayload extends JwtPayload {
    id: string;
} 