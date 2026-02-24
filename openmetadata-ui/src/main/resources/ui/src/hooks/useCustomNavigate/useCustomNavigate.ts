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
import { NavigateOptions, useNavigate as useReactRouterNavigate } from 'react-router-dom';
import { getBasePath } from '../../utils/HistoryUtils';

/**
 * Custom navigate hook that automatically prepends BASE_PATH to all navigation paths
 * This ensures navigation stays within OpenMetadata routes when integrated in a host app
 */
export const useCustomNavigate = () => {
  const navigate = useReactRouterNavigate();
  const basePath = getBasePath() || '';

  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === 'number') {
      // For relative navigation (e.g., navigate(-1), navigate(1))
      return navigate(to);
    }

    // If path already includes basePath, use it as-is
    if (to.startsWith(basePath)) {
      return navigate(to, options);
    }

    // If path is absolute (starts with /), prepend basePath
    if (to.startsWith('/')) {
      return navigate(`${basePath}${to}`, options);
    }

    // For relative paths, navigate as-is (React Router handles relative paths)
    return navigate(to, options);
  };
};

export default useCustomNavigate;
