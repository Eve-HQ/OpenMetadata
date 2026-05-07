/*
 *  Copyright 2026 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/*
 * NoAuthProvider - Bypasses authentication when API does not require tokens.
 * Used when VITE_OPENMETADATA_NO_AUTH=true (e.g. OpenMetadata embedded in host app with public API).
 */
import { ReactNode, useEffect } from 'react';
import { User } from '../../../generated/entity/teams/user';
import { useApplicationStore } from '../../../hooks/useApplicationStore';
import APIClient from '../../../rest';
import { AuthContext } from './AuthProvider';

const noOp = () => {};
const noOpAsync = async () => {};

const FALLBACK_USER: User = {
  id: 'no-auth-admin',
  name: 'admin',
  displayName: 'Admin',
  email: 'admin@open-metadata.org',
  isAdmin: true,
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
    const init = async () => {
      setIsAuthenticating(true);
      try {
        const { data } = await APIClient.get<User>(
          '/users/name/admin?fields=teams,roles,personas'
        );
        setCurrentUser(data);
      } catch {
        setCurrentUser(FALLBACK_USER);
      } finally {
        setIsAuthenticated(true);
        setApplicationLoading(false);
        setIsAuthenticating(false);
      }
    };
    init();
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
