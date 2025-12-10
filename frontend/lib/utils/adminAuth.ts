// Utility functions for admin authentication

export function getAdminAuthHeader(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const adminPassword = sessionStorage.getItem('admin_password');
  if (!adminPassword) return {};
  return {
    'x-admin-secret': adminPassword,
  };
}

export function setAdminPassword(password: string): void {
  sessionStorage.setItem('admin_password', password);
  sessionStorage.setItem('admin_auth', 'true');
}

export function clearAdminAuth(): void {
  sessionStorage.removeItem('admin_password');
  sessionStorage.removeItem('admin_auth');
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('admin_auth') === 'true' && 
         Boolean(sessionStorage.getItem('admin_password'));
}
