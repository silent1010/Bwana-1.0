import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { SidebarDrawer } from '../components/layout/SidebarDrawer';
import { ThemeProvider } from '../context/ThemeContext';
import { LocationArea } from '../types';

const mockLocation: LocationArea = {
  id: 'loc-kitwe',
  city: 'Kitwe',
  district: 'Kitwe',
  province: 'Copperbelt',
  country: 'Zambia',
  countryCode: 'ZM',
  name: 'Kitwe Central',
  coordinates: { latitude: -12.8024, longitude: 28.2132 },
};

describe('Sidebar Drawer & Navbar Search Bar Isolation', () => {
  it('does NOT contain a search input or search button inside the Navbar', () => {
    const onOpenSearch = vi.fn();
    render(
      <ThemeProvider>
        <Navbar
          currentTab="discover"
          setCurrentTab={() => {}}
          currentLocation={mockLocation}
          onOpenLocationModal={() => {}}
          onOpenSearch={onOpenSearch}
          onOpenNotifications={() => {}}
          unreadCount={0}
        />
      </ThemeProvider>
    );

    // Search bar/button must NOT be in the navbar
    const searchInput = screen.queryByPlaceholderText(/search/i);
    expect(searchInput).toBeNull();

    const searchDirectoryBtn = screen.queryByTitle(/search bwana directory/i);
    expect(searchDirectoryBtn).toBeNull();
  });

  it('provides a hamburger menu button in the Navbar that triggers onOpenSidebar', () => {
    const onOpenSidebar = vi.fn();
    render(
      <ThemeProvider>
        <Navbar
          currentTab="discover"
          setCurrentTab={() => {}}
          currentLocation={mockLocation}
          onOpenLocationModal={() => {}}
          onOpenSidebar={onOpenSidebar}
          onOpenNotifications={() => {}}
          unreadCount={0}
        />
      </ThemeProvider>
    );

    const menuBtn = screen.getByLabelText(/open sidebar menu/i);
    expect(menuBtn).toBeDefined();

    fireEvent.click(menuBtn);
    expect(onOpenSidebar).toHaveBeenCalledTimes(1);
  });

  it('renders the SidebarDrawer with navigation channels and responds to navigation clicks', () => {
    const setCurrentTab = vi.fn();
    const onClose = vi.fn();

    render(
      <ThemeProvider>
        <SidebarDrawer
          isOpen={true}
          onClose={onClose}
          currentTab="discover"
          setCurrentTab={setCurrentTab}
          currentLocation={mockLocation}
          onOpenLocationModal={() => {}}
          onOpenNotifications={() => {}}
          unreadCount={2}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Bwana Menu')).toBeDefined();
    expect(screen.getByText('Discovery Home')).toBeDefined();
    expect(screen.getByText('Businesses Directory')).toBeDefined();

    // Click navigation channel
    fireEvent.click(screen.getByText('Businesses Directory'));
    expect(setCurrentTab).toHaveBeenCalledWith('businesses');
    expect(onClose).toHaveBeenCalled();
  });
});
