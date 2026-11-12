import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  ChevronDown,
  ChevronUp,
  Send,
  Store,
  ShieldCheck,
  Search,
  Volume2,
  VolumeX,
  CheckCheck,
  ArrowLeft
} from 'lucide-react';
import {
  getConversationsForUser,
  getConversationsForBusiness,
  getMessages,
  sendMessage,
  markConversationAsRead,
  getTotalUnreadCount
} from '../../services/messagingService';
import { playMessagePop } from '../../utils/audioAlerts';
import { ChatConversation, ChatMessage, UserRole } from '../../types';

interface DockedChatDrawerProps {
  currentRole?: UserRole;
  currentUserId?: string;
  currentUserName?: string;
  activeBusinessId?: string;
}

export const DockedChatDrawer: React.FC<DockedChatDrawerProps> = ({
  currentRole = 'user',
  currentUserId = 'current_user',
  currentUserName = 'Customer',
  activeBusinessId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isBusiness = currentRole === 'business' || currentRole === 'business_owner';

  const refreshData = () => {
    const list = isBusiness && activeBusinessId
      ? getConversationsForBusiness(activeBusinessId)
      : getConversationsForUser(currentUserId);
    setConversations(list);

    const count = getTotalUnreadCount(isBusiness ? 'business' : 'user', activeBusinessId);
    setUnreadCount(count);

    if (activeConversation) {
      setMessages(getMessages(activeConversation.id));
    }
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('bwana_chat_updated', handleUpdate);
    return () => window.removeEventListener('bwana_chat_updated', handleUpdate);
  }, [currentRole, currentUserId, activeBusinessId, isBusiness]);

  useEffect(() => {
    if (activeConversation) {
      setMessages(getMessages(activeConversation.id));
      markConversationAsRead(activeConversation.id, isBusiness ? 'business' : 'user');
      setUnreadCount(getTotalUnreadCount(isBusiness ? 'business' : 'user', activeBusinessId));
    }
  }, [activeConversation, isBusiness, activeBusinessId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeConversation) return;

    try {
      if (soundEnabled) playMessagePop();
      sendMessage(
        activeConversation.id,
        currentUserId,
        currentUserName,
        isBusiness ? 'business' : 'user',
        inputText
      );
      setInputText('');
      setMessages(getMessages(activeConversation.id));
    } catch (err) {
      console.error('Failed to send message in docked drawer', err);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end print:hidden">
      {/* Minimized Pill Bar */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            refreshData();
          }}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl transition-transform hover:scale-105 duration-200 cursor-pointer border border-emerald-400/40"
          aria-label="Open messages drawer"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-stone-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs font-bold tracking-tight">Messages</span>
          <ChevronUp className="w-4 h-4 opacity-80" />
        </button>
      )}

      {/* Expanded Drawer Card */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[520px] max-h-[85vh] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
          {/* Header */}
          <div className="p-3.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeConversation && (
                <button
                  onClick={() => setActiveConversation(null)}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer mr-1"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 leading-tight">
                  {activeConversation
                    ? (isBusiness ? activeConversation.userName : activeConversation.businessName)
                    : 'Bwana In-App Chat'}
                </h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">
                  {activeConversation ? 'Active Conversation' : `${conversations.length} conversations`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title={soundEnabled ? 'Mute audio' : 'Enable audio'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                aria-label="Minimize drawer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body View: Conversation List OR Active Chat Thread */}
          {!activeConversation ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-stone-50/50 dark:bg-stone-950/40">
              {/* Search bar */}
              <div className="p-2.5 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 border-none rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/80">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-stone-400 text-xs">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">No messages found</p>
                    <p className="text-[11px] mt-1 text-stone-400">
                      Click "Chat with Business" on any profile to start an inquiry.
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const hasUnread = isBusiness ? conv.unreadCountForBusiness > 0 : conv.unreadCountForUser > 0;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConversation(conv)}
                        className={`w-full p-3 text-left flex items-start gap-3 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors cursor-pointer ${
                          hasUnread ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center shrink-0 overflow-hidden">
                          {conv.businessLogo ? (
                            <img src={conv.businessLogo} alt={conv.businessName} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                              {isBusiness ? conv.userName : conv.businessName}
                            </h5>
                            <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-1">
                              {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                            {conv.lastMessage}
                          </p>
                        </div>
                        {hasUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 self-center"></span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            // Active Conversation View
            <div className="flex-1 flex flex-col overflow-hidden bg-stone-100/50 dark:bg-stone-950/40">
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                {messages.map((m) => {
                  const isCurrent = isBusiness ? m.senderRole === 'business' : m.senderRole === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isCurrent ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-2xl shadow-xs leading-relaxed ${
                          isCurrent
                            ? 'bg-emerald-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-bl-xs'
                        }`}
                      >
                        <p>{m.text}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[9px] text-stone-400 px-1 font-mono">
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isCurrent && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
