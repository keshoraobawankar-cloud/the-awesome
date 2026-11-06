/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BugleProvider } from './context/BugleContext';
import { DropRadarApp } from './components/DropRadar/DropRadarApp';

export default function App() {
  return (
    <BugleProvider>
      <DropRadarApp />
    </BugleProvider>
  );
}
