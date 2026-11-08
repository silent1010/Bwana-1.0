import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  CheckCheck,
  ShieldCheck,
  Clock,
  Phone,
  Building2,
  Sparkles,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Business, ChatMessage, UserAccount } from '../../types';
import {
  sendMessageToBusiness,
  subscribeToMessages,
  markConversationAsRead,
  getDeterministicConversationId
} from '../../services/firebase';

interface DirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
  currentUser: UserAccount | null;
  onCall?: (phone: string, e: React.MouseEvent) => void;
}

const QUICK_INQUIRIES = [
  '👋 Hello! Is this service or item currently available?',
  '🚚 Do you offer delivery to my area?',
  '🕒 What are your consultation or business hours today?',
  '📍 What is your exact landmark or physical location?',
  '💰 Could you please provide a price quotation or estimate?'
];

export const DirectChatModal: React.FC<DirectChatModalProps> = ({
  isOpen,
  onClose,
  business,
  currentUser,
  onCall
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('bwana_chat_guest_name') || '';
  });
  const [guestPhone, setGuestPhone] = useState(() => {
    return localStorage.getItem('bwana_chat_guest_phone') || '';
  });
  const [showIdentityPrompt, setShowIdentityPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derive unique user identifier
  const effectiveUserId = React.useMemo(() => {
    if (currentUser?.id) return currentUser.id;
    let storedId = localStorage.getItem('bwana_chat_guest_id');
    if (!storedId) {
      storedId = `usr_guest_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('bwana_chat_guest_id', storedId);
    }
    return storedId;
  }, [currentUser]);

  const effectiveUserName = React.useMemo(() => {
    if (currentUser?.name) return currentUser.name;
    if (guestName.trim()) return guestName.trim();
    return 'Customer (Bwana Visitor)';
  }, [currentUser, guestName]);

  const conversationId = React.useMemo(() => {
    if (!business) return '';
    return getDeterministicConversationId(business.id, effectiveUserId);
  }, [business, effectiveUserId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!isOpen || !conversationId) return;

    const unsubscribe = subscribeToMessages(conversationId, (liveMsgs) => {
      setMessages(liveMsgs);
    });

    // Mark as read for user
    markConversationAsRead(conversationId, 'user').catch(() => {});

    return () => {
      unsubscribe();
    };
  }, [isOpen, conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen || !business) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending || !business) return;

    // If unauthenticated and no guest name set, prompt optionally
    if (!currentUser && !guestName && !showIdentityPrompt) {
      // Allow sending, but save default
      localStorage.setItem('bwana_chat_guest_name', 'Customer');
    }

    setIsSending(true);

    const optimisticMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      conversationId,
      senderId: effectiveUserId,
      senderName: effectiveUserName,
      senderRole: 'user',
      text,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, optimisticMessage]);
    if (!textToSend) setInputText('');

    try {
      await sendMessageToBusiness(
        {
          businessId: business.id,
          businessName: business.name,
          businessLogo: business.logoUrl || business.photos?.[0] || '',
          businessPhone: business.phone,
          businessCity: business.city,
          businessArea: business.area,
          businessIsOpenNow: business.isOpenNow,
          userId: effectiveUserId,
          userName: effectiveUserName,
          userPhone: currentUser?.phone || guestPhone || ''
        },
        {
          senderId: effectiveUserId,
          senderName: effectiveUserName,
          senderRole: 'user',
          text
        }
      );
    } catch (err) {
      console.error('Failed to send direct chat message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] h-[680px] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-modal-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {business.logoUrl || business.photos?.[0] ? (
                <img
                  src={business.logoUrl || business.photos?.[0]}
                  alt={business.name}
                  className="w-11 h-11 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shadow-2xs"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <Building2 className="w-5 h-5" />
                </div>
              )}
              {business.isOpenNow && (
                <span
                  title="Open Now"
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-stone-900 rounded-full"
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2
                  id="chat-modal-title"
                  className="font-bold text-stone-900 dark:text-white text-base truncate font-display"
                >
                  {business.name}
                </h2>
                {business.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                <span>{business.categoryName}</span>
                <span>•</span>
                <span>{business.area}, {business.city}</span>
                {business.isOpenNow ? (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Open Now
                    </span>
                  </>
                ) : (
                  <>
                    <span>•</span>
                    <span className="text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Closed
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {business.phone && onCall && (
              <button
                onClick={(e) => onCall(business.phone, e)}
                title={`Call ${business.phone}`}
                className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security & Direct In-App Banner */}
        <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 px-4 py-2 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">
              Direct Bwana In-App Chat — Messages delivered directly to merchant dashboard
            </span>
          </div>
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 hidden sm:inline">
            Zero external WhatsApp required
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50 dark:bg-stone-900/40">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 dark:text-stone-400">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-inner">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
                Direct In-App Conversation with {business.name}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mt-1 mb-4 leading-relaxed">
                Send an inquiry directly through Bwana. Business representatives receive notifications immediately on their merchant portal.
              </p>

              {/* Quick Inquiry Suggestions */}
              <div className="w-full max-w-md text-left space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span>Suggested Inquiries</span>
                </div>
                {QUICK_INQUIRIES.map((inquiry, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(inquiry)}
                    className="w-full text-left text-xs bg-white dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700/80 text-stone-700 dark:text-stone-200 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 transition-colors shadow-2xs flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate mr-2">{inquiry}</span>
                    <Send className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="text-center my-2">
                <span className="text-[10px] text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                  Direct In-App Chat Active
                </span>
              </div>

              {messages.map((msg) => {
                const isMe = msg.senderRole === 'user' || msg.senderId === effectiveUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {!isMe && (
                      <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1 ml-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-emerald-600" />
                        {business.name} (Official)
                      </span>
                    )}
                    <div
                      className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-2xs text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-[10px] text-stone-400 mt-1 ${
                        isMe ? 'mr-1' : 'ml-1'
                      }`}
                    >
                      <span>{formatMessageTime(msg.timestamp)}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Guest Identity Drawer / Banner if not logged in */}
        {!currentUser && showIdentityPrompt && (
          <div className="bg-stone-100 dark:bg-stone-800/90 border-t border-stone-200 dark:border-stone-700 p-3 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-200 mb-2">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                Contact Info for Merchant Callback (Optional)
              </span>
              <button
                onClick={() => setShowIdentityPrompt(false)}
                className="text-stone-400 hover:text-stone-600 text-[11px]"
              >
                Dismiss
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Your Name (e.g. Mwamba Banda)"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  localStorage.setItem('bwana_chat_guest_name', e.target.value);
                }}
                className="text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="tel"
                placeholder="Your Phone / WhatsApp (+260...)"
                value={guestPhone}
                onChange={(e) => {
                  setGuestPhone(e.target.value);
                  localStorage.setItem('bwana_chat_guest_phone', e.target.value);
                }}
                className="text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-1.5 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Input Composer */}
        <div className="p-3 sm:p-4 bg-white dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 shrink-0">
          {!currentUser && !showIdentityPrompt && (
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                Chatting as <strong className="text-stone-700 dark:text-stone-300">{effectiveUserName}</strong>
              </span>
              <button
                onClick={() => setShowIdentityPrompt(true)}
                className="text-[11px] text-emerald-600 hover:underline font-medium"
              >
                Edit name or phone
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${business.name} about products, availability, or consultations...`}
                rows={1}
                className="w-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none max-h-32"
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isSending}
              className="p-2.5 sm:px-4 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 dark:disabled:bg-stone-800 text-white rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1.5 px-1">
            Press <kbd className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">Enter</kbd> to send directly. Shift + Enter for new line.
          </p>
        </div>
      </div>
    </div>
  );
};
