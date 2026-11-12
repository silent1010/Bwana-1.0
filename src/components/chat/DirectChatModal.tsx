import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldCheck, CheckCheck, MapPin, Store, Sparkles } from 'lucide-react';
import {
  getMessages,
  sendMessage,
  startOrGetConversation,
  markConversationAsRead
} from '../../services/messagingService';
import { playMessagePop } from '../../utils/audioAlerts';
import { ChatMessage, ChatConversation } from '../../types';

interface DirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  businessLogo?: string;
  businessCity?: string;
  currentUserId?: string;
  currentUserName?: string;
  userPhone?: string;
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({
  isOpen,
  onClose,
  businessId,
  businessName,
  businessLogo,
  businessCity,
  currentUserId = 'current_user',
  currentUserName = 'Customer',
  userPhone,
}) => {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or fetch conversation
  useEffect(() => {
    if (!isOpen || !businessId) return;

    const conv = startOrGetConversation(
      currentUserId,
      currentUserName,
      businessId,
      businessName,
      businessLogo,
      businessCity,
      userPhone
    );
    setConversation(conv);
    setMessages(getMessages(conv.id));
    markConversationAsRead(conv.id, 'user');

    const handleChatUpdate = () => {
      if (conv) {
        setMessages(getMessages(conv.id));
      }
    };

    window.addEventListener('bwana_chat_updated', handleChatUpdate);
    return () => {
      window.removeEventListener('bwana_chat_updated', handleChatUpdate);
    };
  }, [isOpen, businessId, businessName, businessLogo, businessCity, currentUserId, currentUserName, userPhone]);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !conversation) return;

    try {
      playMessagePop();
      sendMessage(conversation.id, currentUserId, currentUserName, 'user', text);
      setInputText('');
      setMessages(getMessages(conversation.id));

      // Simulate typing indicator while waiting for response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  const quickInquiries = [
    'Is this product available in stock today?',
    'What are your courier delivery rates?',
    'Can I pay using MTN or Airtel Mobile Money?',
    'What are your operating hours today?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col h-[580px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center overflow-hidden shrink-0">
              {businessLogo ? (
                <img src={businessLogo} alt={businessName} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm leading-tight">
                  {businessName}
                </h3>
                <span title="Verified Zambian Merchant" className="inline-flex items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  {businessCity || 'Zambia'}
                </span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Replies in ~5 mins
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-100/50 dark:bg-stone-950/40 text-xs">
          {/* Trust Banner */}
          <div className="p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center text-[11px] text-emerald-800 dark:text-emerald-300">
            <span className="font-semibold">Direct Merchant Channel:</span> Inquiries, product specifications, bulk orders, and delivery coordination with verified officers.
          </div>

          {messages.map((m) => {
            const isUser = m.senderRole === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl shadow-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-400 px-1 font-mono">
                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isUser && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 w-fit text-[11px] text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{businessName} is typing a response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Inquiries */}
        <div className="px-3 pt-2 pb-1 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
          {quickInquiries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-[10px] whitespace-nowrap hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${businessName}...`}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
