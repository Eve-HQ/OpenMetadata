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
import { NavLink, NavLinkProps } from 'react-router-dom';
import { getBasePath } from '../../../utils/HistoryUtils';

/**
 * Custom NavLink component that automatically prepends BASE_PATH to the 'to' prop
 * This ensures navigation stays within OpenMetadata routes when integrated in a host app
 */
export const CustomNavLink = ({ to, ...props }: NavLinkProps) => {
  const basePath = getBasePath() || '';
  
  // Normalize the 'to' prop
  let normalizedTo: string | Partial<Location>;
  
  if (typeof to === 'string') {
    // If path already includes basePath, use it as-is
    if (to.startsWith(basePath)) {
      normalizedTo = to;
    } else if (to.startsWith('/')) {
      // If path is absolute (starts with /), prepend basePath
      normalizedTo = `${basePath}${to}`;
    } else {
      // Relative paths stay as-is
      normalizedTo = to;
    }
  } else if (to && typeof to === 'object' && 'pathname' in to) {
    // Handle object form: { pathname: '/path', search: '?query', hash: '#hash' }
    const pathname = to.pathname || '';
    const normalizedPathname = pathname.startsWith('/') && !pathname.startsWith(basePath)
      ? `${basePath}${pathname}`
      : pathname;
    
    normalizedTo = {
      ...to,
      pathname: normalizedPathname,
    };
  } else {
    normalizedTo = to;
  }

  return <NavLink to={normalizedTo} {...props} />;
};

export default CustomNavLink;
