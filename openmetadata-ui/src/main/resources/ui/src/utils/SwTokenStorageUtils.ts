/*
 *  Copyright 2025 Collate.
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

import { swTokenStorage } from './SwTokenStorage';

// Internal keys for the AppState JSON - obscured for security
const APP_STATE_KEY = 'app_state';
const OIDC_TOKEN_KEY = 'primary';
const REFRESH_TOKEN_KEY = 'secondary';

// In-memory token cache as fallback when storage isn't ready
// This ensures the token is available immediately after login
let memoryTokenCache: string = '';
let memoryRefreshTokenCache: string = '';

interface AppState {
  [OIDC_TOKEN_KEY]?: string;
  [REFRESH_TOKEN_KEY]?: string;
}

export const isServiceWorkerAvailable = (): boolean => {
  // Always return false to force localStorage usage
  return false;
};

const getAppState = (): AppState => {
  try {
    // Always use localStorage for token storage (synchronous)
    const stateStr = localStorage.getItem(APP_STATE_KEY);
    return stateStr ? JSON.parse(stateStr) : {};
  } catch {
    return {};
  }
};

const setAppState = (state: AppState): void => {
  try {
    const stateStr = JSON.stringify(state);
    // Always use localStorage for token storage (synchronous)
    localStorage.setItem(APP_STATE_KEY, stateStr);
  } catch (error) {
    // Storage failures are intentionally ignored to prevent auth flows from breaking.
    // Token persistence is treated as "best effort" - if storage fails, the user
    // may need to re-authenticate, but core functionality continues working.
    console.warn('Failed to store token in localStorage:', error);
  }
};

const clearAppState = (): void => {
  // Clear memory cache
  memoryTokenCache = '';
  memoryRefreshTokenCache = '';
  
  try {
    // Always use localStorage for token storage (synchronous)
    localStorage.removeItem(APP_STATE_KEY);
  } catch (error) {
    // Storage failures are intentionally ignored to prevent auth flows from breaking.
    // Token persistence is treated as "best effort" - if storage fails, the user
    // may need to re-authenticate, but core functionality continues working.
    console.warn('Failed to clear token from localStorage:', error);
  }
};

export const getOidcToken = async (): Promise<string> => {
  try {
    // localStorage is synchronous, but keep async signature for compatibility
    const state = getAppState();
    const storedToken = state[OIDC_TOKEN_KEY] || '';
    
    // If storage token is available, use it and update memory cache
    if (storedToken) {
      memoryTokenCache = storedToken;
      return storedToken;
    }
    
    // Fallback to memory cache if storage doesn't have it yet
    if (memoryTokenCache) {
      return memoryTokenCache;
    }
    
    return '';
  } catch {
    // Fallback to memory cache on error
    return memoryTokenCache || '';
  }
};

export const setOidcToken = async (token: string): Promise<void> => {
  // Always update memory cache first for immediate availability
  memoryTokenCache = token;
  
  try {
    // localStorage is synchronous, but keep async signature for compatibility
    const state = getAppState();
    state[OIDC_TOKEN_KEY] = token;
    setAppState(state);
  } catch (error) {
    // Storage failures are intentionally ignored to prevent auth flows from breaking.
    // Token persistence is treated as "best effort" - if storage fails, the user
    // may need to re-authenticate, but core functionality continues working.
    // Memory cache is already set, so token will work for this session
    console.warn('Failed to store token in localStorage:', error);
  }
};

export const getRefreshToken = async (): Promise<string> => {
  try {
    // localStorage is synchronous, but keep async signature for compatibility
    const state = getAppState();
    const storedToken = state[REFRESH_TOKEN_KEY] || '';
    
    // If storage token is available, use it and update memory cache
    if (storedToken) {
      memoryRefreshTokenCache = storedToken;
      return storedToken;
    }
    
    // Fallback to memory cache if storage doesn't have it yet
    if (memoryRefreshTokenCache) {
      return memoryRefreshTokenCache;
    }
    
    return '';
  } catch {
    // Fallback to memory cache on error
    return memoryRefreshTokenCache || '';
  }
};

export const setRefreshToken = async (token: string): Promise<void> => {
  // Always update memory cache first for immediate availability
  memoryRefreshTokenCache = token;
  
  try {
    // localStorage is synchronous, but keep async signature for compatibility
    const state = getAppState();
    state[REFRESH_TOKEN_KEY] = token;
    setAppState(state);
  } catch (error) {
    // Storage failures are intentionally ignored to prevent auth flows from breaking.
    // Token persistence is treated as "best effort" - if storage fails, the user
    // may need to re-authenticate, but core functionality continues working.
    // Memory cache is already set, so token will work for this session
    console.warn('Failed to store refresh token in localStorage:', error);
  }
};

export const clearOidcToken = async (): Promise<void> => {
  try {
    // localStorage is synchronous, but keep async signature for compatibility
    clearAppState();
  } catch (error) {
    // Storage failures are intentionally ignored to prevent auth flows from breaking.
    // Token persistence is treated as "best effort" - if storage fails, the user
    // may need to re-authenticate, but core functionality continues working.
    console.warn('Failed to clear token from localStorage:', error);
  }
};
