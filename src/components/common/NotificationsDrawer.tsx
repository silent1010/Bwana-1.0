import React from 'react';
import { X, Bell, Flame, Star, MessageSquare, ShieldCheck, Check } from 'lucide-react';
import { BwanaNotification } from '../../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: BwanaNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: BwanaNotification) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col border-l border-stone-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-sm text-stone-900">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[11px] text-stone-500 hover:text-stone-900 font-medium"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  onSelectNotification(notif);
                  onClose();
                }}
                className={`p-4 hover:bg-stone-50 cursor-pointer transition-colors flex gap-3 text-xs ${
                  !notif.read ? 'bg-emerald-50/40' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {notif.iconType === 'promotion' ? (
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                  ) : notif.iconType === 'review' ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Star className="w-3.5 h-3.5" />
                    </div>
                  ) : notif.iconType === 'verification' ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-stone-900 truncate">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-stone-400 shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-stone-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] font-mono uppercase text-stone-400 mt-1 block">
                    Channel: {notif.recipientType}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footnote */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-[11px] text-stone-400">
          Delivery via In-App, WhatsApp Webhooks & Push
        </div>
      </div>
    </div>
  );
};
