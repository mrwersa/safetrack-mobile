// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock matchmedia
window.matchMedia = window.matchMedia || function() {
  return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
  };
};

interface MockComponentProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  icon?: string;
  size?: string;
}

// Mock Ionic components
vi.mock('@ionic/react', () => ({
  IonCard: ({ children, className }: MockComponentProps) => (
    React.createElement('div', { role: 'button', className }, children)
  ),
  IonCardHeader: ({ children }: MockComponentProps) => (
    React.createElement('div', null, children)
  ),
  IonCardTitle: ({ children }: MockComponentProps) => (
    React.createElement('div', null, children)
  ),
  IonCardSubtitle: ({ children }: MockComponentProps) => (
    React.createElement('div', null, children)
  ),
  IonCardContent: ({ children }: MockComponentProps) => (
    React.createElement('div', null, children)
  ),
  IonIcon: ({ icon, size }: MockComponentProps) => (
    React.createElement('span', { className: `icon-${icon}`, 'data-size': size })
  ),
  IonButton: ({ children, onClick }: MockComponentProps) => (
    React.createElement('button', { onClick }, children)
  ),
  IonRippleEffect: () => null,
}));

// Mock Ionicons
vi.mock('ionicons/icons', () => ({
  warning: 'warning',
  call: 'call',
  location: 'location',
  people: 'people',
  information: 'information',
  medkit: 'medkit',
  flashlight: 'flashlight',
  volumeHigh: 'volume-high',
  wifi: 'wifi',
  batteryFull: 'battery-full',
  settings: 'settings',
  menu: 'menu',
}));
