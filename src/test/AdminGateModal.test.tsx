import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { AdminGateModal } from '../components/auth/AdminGateModal';
import { UserRole } from '../types';

describe('AdminGateModal Authentication & Authorization Flow', () => {
  const mockOnClose = vi.fn();
  const mockOnAdminAuthSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <AdminGateModal
        isOpen={true}
        onClose={mockOnClose}
        onAdminAuthSuccess={mockOnAdminAuthSuccess}
      />
    );

    expect(screen.getByText('Admin Verification Gate')).toBeInTheDocument();
    expect(screen.getByText('Restricted')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter admin passkey/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Verify Administrative Key/i })
    ).toBeInTheDocument();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(
      <AdminGateModal
        isOpen={false}
        onClose={mockOnClose}
        onAdminAuthSuccess={mockOnAdminAuthSuccess}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('rejects empty passkey submission and shows validation error', async () => {
    const user = userEvent.setup();
    render(
      <AdminGateModal
        isOpen={true}
        onClose={mockOnClose}
        onAdminAuthSuccess={mockOnAdminAuthSuccess}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Verify Administrative Key/i });
    await user.click(submitBtn);

    expect(
      screen.getByText(/Please input the Bwana Platform administrative passkey/i)
    ).toBeInTheDocument();
    expect(mockOnAdminAuthSuccess).not.toHaveBeenCalled();
  });

  it('rejects unauthorized short/invalid passkeys and denies clearance', async () => {
    const user = userEvent.setup();
    render(
      <AdminGateModal
        isOpen={true}
        onClose={mockOnClose}
        onAdminAuthSuccess={mockOnAdminAuthSuccess}
      />
    );

    const input = screen.getByPlaceholderText(/Enter admin passkey/i);
    await user.type(input, 'bad');

    const submitBtn = screen.getByRole('button', { name: /Verify Administrative Key/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid administrative security key. Access denied./i)
      ).toBeInTheDocument();
    });

    expect(mockOnAdminAuthSuccess).not.toHaveBeenCalled();
  });

  it('successfully authorizes with valid security key and completes TOTP flow to elevate to admin', async () => {
    const user = userEvent.setup();
    render(
      <AdminGateModal
        isOpen={true}
        onClose={mockOnClose}
        onAdminAuthSuccess={mockOnAdminAuthSuccess}
      />
    );

    // Step 1: Input valid passkey
    const keyInput = screen.getByPlaceholderText(/Enter admin passkey/i);
    await user.type(keyInput, 'admin');

    const verifyKeyBtn = screen.getByRole('button', { name: /Verify Administrative Key/i });
    await user.click(verifyKeyBtn);

    // Step 2: Transition to TOTP verification step
    await waitFor(() => {
      expect(
        screen.getByText(/Security Key verified. Enter 2FA \/ TOTP confirmation./i)
      ).toBeInTheDocument();
    });

    const totpInput = screen.getByPlaceholderText('654321');
    expect(totpInput).toBeInTheDocument();
    await user.type(totpInput, '123456');

    // Step 3: Final Authorization
    const confirmBtn = screen.getByRole('button', {
      name: /Open Admin Verification Console/i,
    });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockOnAdminAuthSuccess).toHaveBeenCalledWith(
        'admin@bwana.africa',
        'admin',
        'Bwana Platform Administrator'
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('authorizes successfully using bwana-root root passkey', async () => {
    const user = userEvent.setup();
    render(
      <AdminGateModal
        isOpen={true}
        onClose={mockOnClose}
        onAdminAuthSuccess={mockOnAdminAuthSuccess}
      />
    );

    const keyInput = screen.getByPlaceholderText(/Enter admin passkey/i);
    await user.type(keyInput, 'bwana-root');

    const verifyKeyBtn = screen.getByRole('button', { name: /Verify Administrative Key/i });
    await user.click(verifyKeyBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Security Key verified. Enter 2FA \/ TOTP confirmation./i)
      ).toBeInTheDocument();
    });
  });

  it('supports 1-Click Authorized Officer Sandbox Fast-Track access', async () => {
    const user = userEvent.setup();
    render(
      <AdminGateModal
        isOpen={true}
        onClose={mockOnClose}
        onAdminAuthSuccess={mockOnAdminAuthSuccess}
      />
    );

    const fastTrackBtn = screen.getByRole('button', {
      name: /1-Click Authorized Officer Sandbox Access/i,
    });
    await user.click(fastTrackBtn);

    expect(mockOnAdminAuthSuccess).toHaveBeenCalledWith(
      'admin@bwana.africa',
      'admin',
      'Bwana Platform Administrator'
    );
    expect(mockOnClose).toHaveBeenCalled();
  });
});

describe('Integration Test: Access Control & Navigation to Admin Dashboard', () => {
  // Harness component simulating the app root access control & navigation
  const TestAppContainer: React.FC = () => {
    const [currentRole, setCurrentRole] = useState<UserRole>('user');
    const [currentTab, setCurrentTab] = useState<string>('discover');
    const [isAdminGateOpen, setIsAdminGateOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    return (
      <div>
        <header>
          <span data-testid="current-role">{currentRole}</span>
          <span data-testid="current-tab">{currentTab}</span>
          <span data-testid="user-email">{userEmail || 'none'}</span>

          <button
            data-testid="open-admin-gate-btn"
            onClick={() => setIsAdminGateOpen(true)}
          >
            Admin Gate
          </button>
        </header>

        <main>
          {currentTab === 'discover' && (
            <div data-testid="discover-view">Public Consumer Discovery Mode</div>
          )}

          {currentTab === 'admin_dashboard' && currentRole === 'admin' ? (
            <div data-testid="admin-dashboard-view">
              <h2>PACRA & ZRA Statutory Verification Desk</h2>
              <p>Platform Management Active</p>
            </div>
          ) : currentTab === 'admin_dashboard' && currentRole !== 'admin' ? (
            <div data-testid="unauthorized-view">403 Forbidden - Admin Privilege Required</div>
          ) : null}
        </main>

        <AdminGateModal
          isOpen={isAdminGateOpen}
          onClose={() => setIsAdminGateOpen(false)}
          onAdminAuthSuccess={(email, role, name) => {
            // Mock server session response and privilege upgrade
            setUserEmail(email);
            setCurrentRole(role);
            setCurrentTab('admin_dashboard');
          }}
        />
      </div>
    );
  };

  it('guarantees that unauthenticated users remain in discovery and cannot view admin dashboard', () => {
    render(<TestAppContainer />);

    expect(screen.getByTestId('current-role')).toHaveTextContent('user');
    expect(screen.getByTestId('current-tab')).toHaveTextContent('discover');
    expect(screen.getByTestId('discover-view')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-dashboard-view')).not.toBeInTheDocument();
  });

  it('executes full end-to-end flow: opens gate, validates credentials, mocks login, and navigates to admin dashboard', async () => {
    const user = userEvent.setup();
    render(<TestAppContainer />);

    // 1. Open the Admin Gate
    const openGateBtn = screen.getByTestId('open-admin-gate-btn');
    await user.click(openGateBtn);

    expect(screen.getByText('Admin Verification Gate')).toBeInTheDocument();

    // 2. Submit credentials
    const passkeyInput = screen.getByPlaceholderText(/Enter admin passkey/i);
    await user.type(passkeyInput, 'admin');

    const verifyBtn = screen.getByRole('button', { name: /Verify Administrative Key/i });
    await user.click(verifyBtn);

    // 3. Confirm 2FA
    await waitFor(() => {
      expect(
        screen.getByText(/Security Key verified/i)
      ).toBeInTheDocument();
    });

    const submitTotpBtn = screen.getByRole('button', {
      name: /Open Admin Verification Console/i,
    });
    await user.click(submitTotpBtn);

    // 4. Verify privilege elevation and view transition
    await waitFor(() => {
      expect(screen.getByTestId('current-role')).toHaveTextContent('admin');
      expect(screen.getByTestId('current-tab')).toHaveTextContent('admin_dashboard');
      expect(screen.getByTestId('user-email')).toHaveTextContent('admin@bwana.africa');
      expect(screen.getByTestId('admin-dashboard-view')).toBeInTheDocument();
      expect(screen.queryByTestId('discover-view')).not.toBeInTheDocument();
    });
  });

  it('prevents navigation if authorization is aborted or canceled', async () => {
    const user = userEvent.setup();
    render(<TestAppContainer />);

    // Open gate
    await user.click(screen.getByTestId('open-admin-gate-btn'));
    expect(screen.getByText('Admin Verification Gate')).toBeInTheDocument();

    // Close gate without authenticating
    const closeBtn = screen.getByRole('button', { name: '' }); // Modal close 'X'
    await user.click(closeBtn);

    // Verify still in discovery view with user role
    expect(screen.getByTestId('current-role')).toHaveTextContent('user');
    expect(screen.getByTestId('current-tab')).toHaveTextContent('discover');
    expect(screen.getByTestId('discover-view')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-dashboard-view')).not.toBeInTheDocument();
  });
});
