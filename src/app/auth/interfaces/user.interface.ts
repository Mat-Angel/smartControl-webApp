export interface AuthResponse {
  uid:             string;
  email:           string;
  emailVerified:   boolean;
  isAnonymous:     boolean;
  providerData:    ProviderDatum[];
  stsTokenManager: StsTokenManager;
  createdAt:       string;
  lastLoginAt:     string;
  apiKey:          string;
  appName:         string;
}

export interface ProviderDatum {
  providerId:  string;
  uid:         string;
  displayName: null;
  email:       string;
  phoneNumber: null;
  photoURL:    null;
}

export interface StsTokenManager {
  refreshToken:   string;
  accessToken:    string;
  expirationTime: number;
}

export type AuthStatus = 'checking'|'authenticated'|'not-authenticated'
