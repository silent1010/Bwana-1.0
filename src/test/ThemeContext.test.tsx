import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

const TestComponent = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-val">{theme}</span>
      <span data-testid="is-dark-val">{isDark ? 'true' : 'false'}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe('ThemeContext & Theme-Aware System', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  it('initializes default theme correctly and provides toggle', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const themeVal = screen.getByTestId('theme-val');
    expect(themeVal.textContent).toMatch(/light|dark/);

    const toggleBtn = screen.getByText('Toggle Theme');
    const initialTheme = themeVal.textContent;
    
    fireEvent.click(toggleBtn);
    const expectedTheme = initialTheme === 'dark' ? 'light' : 'dark';
    expect(screen.getByTestId('theme-val').textContent).toBe(expectedTheme);
    expect(localStorage.getItem('bwana_theme')).toBe(expectedTheme);
  });

  it('applies dark class and data-theme attribute on document root', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByText('Toggle Theme');
    const isInitiallyDark = screen.getByTestId('is-dark-val').textContent === 'true';

    if (!isInitiallyDark) {
      fireEvent.click(toggleBtn);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    } else {
      fireEvent.click(toggleBtn);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    }
  });
});
