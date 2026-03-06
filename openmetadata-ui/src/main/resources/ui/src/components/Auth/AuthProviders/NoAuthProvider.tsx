/*
 * NoAuthProvider - Bypasses authentication when API does not require tokens.
 * Used when VITE_OPENMETADATA_NO_AUTH=true (e.g. OpenMetadata embedded in host app with public API).
 */
import { ReactNode, useEffect } from 'react';
import { User } from '../../../generated/entity/teams/user';
import { useApplicationStore } from '../../../hooks/useApplicationStore';
import { AuthContext } from './AuthProvider';

const noOp = () => {};
const noOpAsync = async () => {};

const GUEST_USER: User = {
  id: 'no-auth-guest',
  name: 'guest',
  displayName: 'Guest',
  email: 'guest@localhost',
  isAdmin: false,
  teams: [],
  roles: [],
};

const noAuthContextValue = {
  onLoginHandler: noOp,
  onLogoutHandler: noOp,
  handleSuccessfulLogin: noOpAsync,
  handleFailedLogin: noOp,
  handleSuccessfulLogout: noOp,
  updateAxiosInterceptors: noOp,
};

interface NoAuthProviderProps {
  children: ReactNode;
}

export const NoAuthProvider = ({ children }: NoAuthProviderProps) => {
  const {
    setCurrentUser,
    setIsAuthenticated,
    setApplicationLoading,
    setIsAuthenticating,
  } = useApplicationStore();

  useEffect(() => {
    setCurrentUser(GUEST_USER);
    setIsAuthenticated(true);
    setApplicationLoading(false);
    setIsAuthenticating(false);
  }, [
    setCurrentUser,
    setIsAuthenticated,
    setApplicationLoading,
    setIsAuthenticating,
  ]);

  return (
    <AuthContext.Provider value={noAuthContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
