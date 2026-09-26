import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Building2,
  User,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { UserRole, SystemUser } from '../../types';
import { SYSTEM_USERS } from '../../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, role: UserRole, name?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'quick_select' | 'manual'>('quick_select');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'business' | 'user'>('user');
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  // Form states
  const [phone, setPhone] = useState('+260 97 748 1920');
  const [email, setEmail] = useState('m.mumba8@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Michael Mumba');

  if (!isOpen) return null;

  const handleQuickLogin = (u: SystemUser) => {
    onLoginSuccess(u.email, u.role, u.name);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = method === 'email' ? email : phone;
    const finalName = fullName || (selectedRole === 'admin' ? 'Admin Officer' : selectedRole === 'business' ? 'Business Owner' : 'Verified User');
    onLoginSuccess(finalEmail, selectedRole, finalName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-900 text-white flex items-start justify-between border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-display text-white tracking-tight">
                Bwana
              </span>
              <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-semibold">
                Security & RBAC Access
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Select or authenticate with one of the 3 platform security profiles.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: 3 System Accounts vs Custom Credentials */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-5 pt-3">
          <button
            type="button"
            onClick={() => setAuthMode('quick_select')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              authMode === 'quick_select'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>3 Security Users (1-Click)</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('manual')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              authMode === 'manual'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Custom Credentials Login</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {authMode === 'quick_select' ? (
            <div className="space-y-3">
              <div className="text-xs text-stone-600 mb-1">
                Authenticate as one of the 3 isolated platform users:
              </div>

              {SYSTEM_USERS.map((user) => {
                const isAdmin = user.role === 'admin';
                const isBiz = user.role === 'business';
                const isUser = user.role === 'user';

                return (
                  <div
                    key={user.id}
                    className={`p-4 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isAdmin
                        ? 'border-rose-200 bg-rose-50/50 hover:border-rose-400'
                        : isBiz
                        ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400'
                        : 'border-sky-200 bg-sky-50/50 hover:border-sky-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center shrink-0 shadow-xs ${
                          isAdmin
                            ? 'bg-rose-700'
                            : isBiz
                            ? 'bg-emerald-700'
                            : 'bg-sky-700'
                        }`}
                      >
                        {isAdmin ? (
                          <ShieldAlert className="w-5 h-5 text-white" />
                        ) : isBiz ? (
                          <Building2 className="w-5 h-5 text-white" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{user.name}</span>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                              isAdmin
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : isBiz
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-sky-100 text-sky-800 border-sky-300'
                            }`}
                          >
                            {user.badge} SIDE
                          </span>
                        </div>
                        <div className="text-stone-500 font-mono text-[11px]">{user.email}</div>
                        <p className="text-stone-600 text-[11px] leading-relaxed pt-1">
                          {user.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin(user)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                        isAdmin
                          ? 'bg-rose-600 hover:bg-rose-500'
                          : isBiz
                          ? 'bg-emerald-600 hover:bg-emerald-500'
                          : 'bg-sky-600 hover:bg-sky-500'
                      }`}
                    >
                      <span>Sign In as {user.badge}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Custom Manual Form */
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                  Select User Role Profile *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('admin');
                      setEmail('admin@bwana.africa');
                      setFullName('Platform Admin');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold ring-1 ring-rose-500'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 mx-auto mb-1 text-rose-600" />
                    <div className="text-xs">Admin Side</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('business');
                      setEmail('owner@abchardware.co.zm');
                      setFullName('Business Owner');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'business'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <div className="text-xs">Business Side</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('user');
                      setEmail('m.mumba8@gmail.com');
                      setFullName('Michael Mumba');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'user'
                        ? 'border-sky-600 bg-sky-50 text-sky-950 font-bold ring-1 ring-sky-500'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <User className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                    <div className="text-xs">User Side</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Authorize & Sign In ({selectedRole.toUpperCase()} SIDE)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Security footnote */}
        <div className="p-3.5 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Role-Based Access Control: 3 Users (Admin, Business, User). Session verified.</span>
        </div>
      </div>
    </div>
  );
};
