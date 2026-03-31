import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';

describe('App', () => {
  it('renders sign in panel when user is logged out', () => {
    localStorage.removeItem('dbmsToken');
    localStorage.removeItem('dbmsRole');
    render(<App />);

    expect(screen.getByText(/Academic Portal/i)).toBeTruthy();
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeTruthy();
  });
});
