/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BugleProvider } from './context/BugleContext';
import { DropDataProvider } from './context/DropDataContext';
import { DropRadarApp } from './components/DropRadar/DropRadarApp';

export default function App() {
  return (
    <BugleProvider>
      <DropDataProvider>
        <DropRadarApp />
      </DropDataProvider>
    </BugleProvider>
  );
}
