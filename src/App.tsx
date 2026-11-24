/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BugleProvider } from './context/BugleContext';
import { DropDataProvider } from './context/DropDataContext';
import { NotificationProvider } from './context/NotificationContext';
import { DropRadarApp } from './components/DropRadar/DropRadarApp';

export default function App() {
  return (
    <BugleProvider>
      <DropDataProvider>
        <NotificationProvider>
          <DropRadarApp />
        </NotificationProvider>
      </DropDataProvider>
    </BugleProvider>
  );
}
