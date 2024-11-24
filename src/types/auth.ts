export type AuthChangeEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'PASSWORD_RECOVERY'
  | 'TOKEN_REFRESHED';

export interface Session {
  user: {
    id: string;
    email: string;
    // ... other user properties
  };
  // ... other session properties
} 