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
import { Navigate as ReactRouterNavigate, NavigateProps } from 'react-router-dom';
import { getBasePath } from '../../../utils/HistoryUtils';

/**
 * Custom Navigate component that automatically prepends BASE_PATH to the 'to' prop
 * This ensures navigation stays within OpenMetadata routes when integrated in a host app
 */
export const CustomNavigate = ({ to, ...props }: NavigateProps) => {
  const basePath = getBasePath() || '';
  
  // If to is a string and doesn't already include basePath, prepend it
  const normalizedTo = typeof to === 'string' && to.startsWith('/') && !to.startsWith(basePath)
    ? `${basePath}${to}`
    : to;

  return <ReactRouterNavigate to={normalizedTo} {...props} />;
};

export default CustomNavigate;
