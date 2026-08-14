/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IslandsCanvas } from './components/IslandsCanvas';
import { ToastProvider } from './components/ToastContext';

export default function App() {
  return (
    <ToastProvider>
      <IslandsCanvas />
    </ToastProvider>
  );
}

