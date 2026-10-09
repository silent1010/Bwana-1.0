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
  Sparkles,
  Users,
  Briefcase,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { UserRole, SystemUser } from '../../types';
import { SYSTEM_USERS } from '../../data/mockData';
import { getCapabilitiesForRole } from '../../services/rbacService';

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
  const [authMode, setAuthMode] = useState<'quick_select' | 'matrix'>('quick_select');
  const [inspectingRole, setInspectingRole] = useState<UserRole>('registered_user');

  if (!isOpen) return null;

  const handleQuickLogin = (u: SystemUser) => {
    onLoginSuccess(u.email, u.role, u.name);
    onClose();
  };

  const capabilities = getCapabilitiesForRole(inspectingRole);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldAlert className="w-5 h-5 text-white" />;
      case 'moderator':
        return <Shield className="w-5 h-5 text-white" />;
      case 'business_owner':
      case 'business':
        return <Building2 className="w-5 h-5 text-white" />;
      case 'business_staff':
        return <Briefcase className="w-5 h-5 text-white" />;
      case 'registered_user':
      case 'user':
        return <User className="w-5 h-5 text-white" />;
      case 'public_user':
      default:
        return <Users className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-900 text-white flex items-start justify-between border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-display text-white tracking-tight">
                Bwana Identity & RBAC
              </span>
              <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-semibold">
                6 Major User Types
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Switch roles to experience the platform from any user perspective or inspect permissions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: 6 Role Profiles vs Permissions Matrix */}
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
            <span>Switch Active Role (6 Profiles)</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('matrix')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              authMode === 'matrix'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>RBAC Capabilities Matrix</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {authMode === 'quick_select' ? (
            <div className="space-y-3">
              <div className="text-xs text-stone-600 mb-1 flex items-center justify-between">
                <span>Select a user type to switch identity:</span>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Public Discovery Requires No Registration
                </span>
              </div>

              {SYSTEM_USERS.map((user) => {
                const isAdmin = user.role === 'admin';
                const isMod = user.role === 'moderator';
                const isOwner = user.role === 'business_owner';
                const isStaff = user.role === 'business_staff';
                const isReg = user.role === 'registered_user';
                const isPub = user.role === 'public_user';

                return (
                  <div
                    key={user.id}
                    className={`p-3.5 rounded-2xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isAdmin
                        ? 'border-rose-200 bg-rose-50/40 hover:border-rose-400'
                        : isMod
                        ? 'border-amber-200 bg-amber-50/40 hover:border-amber-400'
                        : isOwner
                        ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400'
                        : isStaff
                        ? 'border-purple-200 bg-purple-50/40 hover:border-purple-400'
                        : isReg
                        ? 'border-sky-200 bg-sky-50/40 hover:border-sky-400'
                        : 'border-stone-200 bg-stone-50/60 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center shrink-0 shadow-xs ${
                          isAdmin
                            ? 'bg-rose-700'
                            : isMod
                            ? 'bg-amber-700'
                            : isOwner
                            ? 'bg-emerald-700'
                            : isStaff
                            ? 'bg-purple-700'
                            : isReg
                            ? 'bg-sky-700'
                            : 'bg-stone-600'
                        }`}
                      >
                        {getRoleIcon(user.role)}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{user.name}</span>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                              isAdmin
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : isMod
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : isOwner
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : isStaff
                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                : isReg
                                ? 'bg-sky-100 text-sky-800 border-sky-300'
                                : 'bg-stone-200 text-stone-800 border-stone-300'
                            }`}
                          >
                            {user.badge}
                          </span>
                        </div>
                        <div className="text-[11px] font-medium text-stone-600">
                          {user.roleLabel}
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                          {user.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleQuickLogin(user)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs ${
                          isAdmin
                            ? 'bg-rose-700 hover:bg-rose-800'
                            : isMod
                            ? 'bg-amber-700 hover:bg-amber-800'
                            : isOwner
                            ? 'bg-emerald-700 hover:bg-emerald-800'
                            : isStaff
                            ? 'bg-purple-700 hover:bg-purple-800'
                            : isReg
                            ? 'bg-sky-700 hover:bg-sky-800'
                            : 'bg-stone-800 hover:bg-stone-900'
                        }`}
                      >
                        <span>Select</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Permissions Matrix Inspection View */
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-500 mb-1.5">
                  Select Role to Inspect Configured Capabilities:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { role: 'public_user' as UserRole, label: 'A. Public User' },
                    { role: 'registered_user' as UserRole, label: 'B. Registered User' },
                    { role: 'business_owner' as UserRole, label: 'C. Business Owner' },
                    { role: 'business_staff' as UserRole, label: 'D. Business Staff' },
                    { role: 'moderator' as UserRole, label: 'E. Moderator' },
                    { role: 'admin' as UserRole, label: 'F. Administrator' },
                  ].map((item) => (
                    <button
                      key={item.role}
                      onClick={() => setInspectingRole(item.role)}
                      className={`p-2 rounded-xl text-left border font-semibold transition-all cursor-pointer ${
                        inspectingRole === item.role
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capabilities checklist */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
                <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider border-b border-stone-200 pb-2">
                  Configured System Capabilities for &laquo;{inspectingRole}&raquo;
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="space-y-1.5">
                    <div className="font-semibold text-stone-700 text-xs">Core Discovery (Public)</div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.searchBusinesses ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.searchBusinesses ? '✓' : '✗'}
                      </span>
                      <span>Search & browse businesses</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.viewLocationsAndHours ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.viewLocationsAndHours ? '✓' : '✗'}
                      </span>
                      <span>View locations, hours & contact</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.useMapDiscovery ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.useMapDiscovery ? '✓' : '✗'}
                      </span>
                      <span>Use map & list radius discovery</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="font-semibold text-stone-700 text-xs">Engagement & Reviews</div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.saveAndFavorite ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.saveAndFavorite ? '✓' : '✗'}
                      </span>
                      <span>Save & favorite businesses</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.writeReviewsAndRatings ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.writeReviewsAndRatings ? '✓' : '✗'}
                      </span>
                      <span>Write ratings & photo reviews</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.receiveNotifications ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.receiveNotifications ? '✓' : '✗'}
                      </span>
                      <span>Receive personal notifications</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.viewSearchHistory ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.viewSearchHistory ? '✓' : '✗'}
                      </span>
                      <span>View & persist search history</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-stone-200">
                    <div className="font-semibold text-stone-700 text-xs">Merchant Management</div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.manageBusinessProfile ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.manageBusinessProfile ? '✓' : '✗'}
                      </span>
                      <span>Manage profile & storefront</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.manageProductsAndServices ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.manageProductsAndServices ? '✓' : '✗'}
                      </span>
                      <span>Add products & kwacha services</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.manageEmployees ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.manageEmployees ? '✓' : '✗'}
                      </span>
                      <span>Manage staff (Owner only)</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-stone-200">
                    <div className="font-semibold text-stone-700 text-xs">Compliance & Administration</div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.reviewReportedContent ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.reviewReportedContent ? '✓' : '✗'}
                      </span>
                      <span>Review reported content & disputes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.fullPlatformAdministration ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.fullPlatformAdministration ? '✓' : '✗'}
                      </span>
                      <span>Full platform administration</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={capabilities.auditSystemActivity ? 'text-emerald-600 font-bold' : 'text-stone-300'}>
                        {capabilities.auditSystemActivity ? '✓' : '✗'}
                      </span>
                      <span>Immutable compliance audit logs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
