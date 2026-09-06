import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {clearStoredToken, fetchCurrentUser, getStoredToken, loginUser, registerUser, setStoredToken} from '../api/auth';
import type {User} from '../types/auth';

type AuthContextValue = {user: User | null; isLoading: boolean; login: (email: string, password: string) => Promise<void>; register: (email: string, password: string) => Promise<void>; logout: () => void};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
  const client = useQueryClient();
  const [hasToken, setHasToken] = useState(() => Boolean(getStoredToken()));
  const current = useQuery({queryKey: ['current-user'], queryFn: fetchCurrentUser, enabled: hasToken, retry: false, staleTime: 60000});
  const logout = useCallback(() => {clearStoredToken(); setHasToken(false); void client.cancelQueries(); client.clear();}, [client]);
  useEffect(() => {
    window.addEventListener('preppilot:session-expired', logout);
    return () => window.removeEventListener('preppilot:session-expired', logout);
  }, [logout]);
  const login = useCallback(async (email: string, password: string) => {
    const response = await loginUser(email.trim(), password);
    await client.cancelQueries(); client.clear();
    setStoredToken(response.access_token);
    try {const user = await fetchCurrentUser(); client.setQueryData(['current-user'], user); setHasToken(true);}
    catch (error) {logout(); throw error;}
  }, [client, logout]);
  const register = useCallback(async (email: string, password: string) => {await registerUser(email.trim(), password); await login(email, password);}, [login]);
  const user = hasToken ? current.data ?? null : null;
  const isLoading = hasToken && current.isPending;
  const value = useMemo(() => ({user, isLoading, login, register, logout}), [user, isLoading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Sharing the context hook alongside its provider is intentional.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
