import { ChatConversation, ChatMessage } from '../types';

const STORAGE_KEY_CONVERSATIONS = 'bwana_chat_conversations_v2';
const STORAGE_KEY_MESSAGES = 'bwana_chat_messages_v2';

// Realistic initial Zambian merchant conversations
const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-abc-hardware',
    businessId: 'biz-abc-hardware',
    businessName: 'ABC Hardware & Electrical',
    businessLogo: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=120&q=80',
    businessCity: 'Kitwe',
    businessArea: 'Town Centre, Copperbelt',
    businessPhone: '+260 977 123456',
    businessIsOpenNow: true,
    userId: 'user-chileshe-1',
    userName: 'Chileshe Mulenga',
    userPhone: '+260 966 458921',
    lastMessage: 'Yes, we have 45 bags of Dangote 42.5N in stock. Delivery to Riverside is K120.',
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    unreadCountForUser: 1,
    unreadCountForBusiness: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'conv-mukwa-cafe',
    businessId: 'biz-copper-pot',
    businessName: 'Copper Pot Kitchen & Bakery',
    businessLogo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=120&q=80',
    businessCity: 'Lusaka',
    businessArea: 'Kabulonga',
    businessPhone: '+260 971 889900',
    businessIsOpenNow: true,
    userId: 'user-chileshe-1',
    userName: 'Chileshe Mulenga',
    userPhone: '+260 966 458921',
    lastMessage: 'Your Village Chicken lunch pack is ready for pickup or dispatch.',
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    unreadCountForUser: 0,
    unreadCountForBusiness: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-abc-hardware': [
    {
      id: 'msg-1',
      conversationId: 'conv-abc-hardware',
      senderId: 'user-chileshe-1',
      senderName: 'Chileshe Mulenga',
      senderRole: 'user',
      text: 'Muli bwanji! Do you have Dangote 42.5N cement in stock right now for delivery in Riverside Kitwe?',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      read: true,
    },
    {
      id: 'msg-2',
      conversationId: 'conv-abc-hardware',
      senderId: 'biz-abc-hardware',
      senderName: 'ABC Hardware & Electrical',
      senderRole: 'business',
      text: 'Bwino sana! Yes, we have 45 bags of Dangote 42.5N in stock. Delivery to Riverside is K120.',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      read: false,
    },
  ],
  'conv-copper-pot': [
    {
      id: 'msg-3',
      conversationId: 'conv-copper-pot',
      senderId: 'user-chileshe-1',
      senderName: 'Chileshe Mulenga',
      senderRole: 'user',
      text: 'Can I place an order for the Village Chicken Nshima special for lunch at 13:00?',
      timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      read: true,
    },
    {
      id: 'msg-4',
      conversationId: 'conv-copper-pot',
      senderId: 'biz-copper-pot',
      senderName: 'Copper Pot Kitchen & Bakery',
      senderRole: 'business',
      text: 'Your Village Chicken lunch pack is ready for pickup or dispatch.',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: true,
    },
  ],
};

function loadConversations(): ChatConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
      return INITIAL_CONVERSATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse conversations from storage', err);
    return INITIAL_CONVERSATIONS;
  }
}

function saveConversations(convs: ChatConversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(convs));
    window.dispatchEvent(new CustomEvent('bwana_chat_updated'));
  } catch (err) {
    console.error('Failed to save conversations to storage', err);
  }
}

function loadMessages(): Record<string, ChatMessage[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse messages from storage', err);
    return INITIAL_MESSAGES;
  }
}

function saveMessages(msgs: Record<string, ChatMessage[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(msgs));
    window.dispatchEvent(new CustomEvent('bwana_chat_updated'));
  } catch (err) {
    console.error('Failed to save messages to storage', err);
  }
}

/**
 * Get all conversations for a specific customer or for all
 */
export function getConversationsForUser(userId: string): ChatConversation[] {
  const all = loadConversations();
  return all.filter((c) => c.userId === userId || !c.userId || userId === 'current_user');
}

/**
 * Get all conversations for a specific business dashboard
 */
export function getConversationsForBusiness(businessId: string): ChatConversation[] {
  const all = loadConversations();
  return all.filter((c) => c.businessId === businessId);
}

/**
 * Retrieve messages for a given conversation
 */
export function getMessages(conversationId: string): ChatMessage[] {
  const all = loadMessages();
  return all[conversationId] || [];
}

/**
 * Starts or retrieves an existing conversation between a user and a business
 */
export function startOrGetConversation(
  userId: string,
  userName: string,
  businessId: string,
  businessName: string,
  businessLogo?: string,
  businessCity?: string,
  userPhone?: string
): ChatConversation {
  const convs = loadConversations();
  const existing = convs.find(
    (c) => c.businessId === businessId && (c.userId === userId || userId === 'current_user')
  );

  if (existing) {
    return existing;
  }

  const newConv: ChatConversation = {
    id: `conv-${businessId}-${Date.now().toString(36)}`,
    businessId,
    businessName,
    businessLogo,
    businessCity: businessCity || 'Zambia',
    userId,
    userName: userName || 'Customer',
    userPhone: userPhone || '+260 970 000000',
    lastMessage: 'Conversation started',
    lastMessageTimestamp: new Date().toISOString(),
    unreadCountForUser: 0,
    unreadCountForBusiness: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  convs.unshift(newConv);
  saveConversations(convs);

  // Initialize empty message thread
  const msgs = loadMessages();
  if (!msgs[newConv.id]) {
    msgs[newConv.id] = [
      {
        id: `msg-welcome-${Date.now()}`,
        conversationId: newConv.id,
        senderId: businessId,
        senderName: businessName,
        senderRole: 'business',
        text: `Muli bwanji! Welcome to ${businessName}. How can we assist you with our products and delivery today?`,
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];
    saveMessages(msgs);
  }

  return newConv;
}

/**
 * Sends a message in a conversation and triggers automated merchant replies if from a customer
 */
export function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: 'user' | 'business',
  text: string
): ChatMessage {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Message cannot be empty');

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    conversationId,
    senderId,
    senderName,
    senderRole,
    text: trimmed,
    timestamp: new Date().toISOString(),
    read: false,
  };

  // Append message
  const msgs = loadMessages();
  if (!msgs[conversationId]) msgs[conversationId] = [];
  msgs[conversationId].push(newMsg);
  saveMessages(msgs);

  // Update conversation record
  const convs = loadConversations();
  const convIndex = convs.findIndex((c) => c.id === conversationId);
  if (convIndex !== -1) {
    convs[convIndex].lastMessage = trimmed;
    convs[convIndex].lastMessageTimestamp = newMsg.timestamp;
    convs[convIndex].updatedAt = newMsg.timestamp;
    if (senderRole === 'user') {
      convs[convIndex].unreadCountForBusiness += 1;
    } else {
      convs[convIndex].unreadCountForUser += 1;
    }
    // Move to top of conversations list
    const [moved] = convs.splice(convIndex, 1);
    convs.unshift(moved);
    saveConversations(convs);
  }

  // If customer sent message, simulate prompt merchant auto-response after 1.5 seconds
  if (senderRole === 'user') {
    setTimeout(() => {
      simulateMerchantReply(conversationId);
    }, 1500);
  }

  return newMsg;
}

/**
 * Simulates a realistic merchant reply
 */
function simulateMerchantReply(conversationId: string) {
  const convs = loadConversations();
  const conv = convs.find((c) => c.id === conversationId);
  if (!conv) return;

  const responses = [
    `Thanks for reaching out! We have stock ready at our ${conv.businessCity || 'shop'} branch and can arrange courier delivery.`,
    `Received your inquiry! Our team is on standby. Would you like us to reserve this item for you?`,
    `Natotela sana for your message! Yes, we can process your order with payment via MTN MoMo or Airtel Money.`,
    `Hello! We are currently open. You can place your order directly through our profile, or let us know if you need customized quantities.`,
  ];
  const replyText = responses[Math.floor(Math.random() * responses.length)];

  const replyMsg: ChatMessage = {
    id: `msg-reply-${Date.now()}`,
    conversationId,
    senderId: conv.businessId,
    senderName: conv.businessName,
    senderRole: 'business',
    text: replyText,
    timestamp: new Date().toISOString(),
    read: false,
  };

  const msgs = loadMessages();
  if (!msgs[conversationId]) msgs[conversationId] = [];
  msgs[conversationId].push(replyMsg);
  saveMessages(msgs);

  // Update conversation
  const updatedConvs = loadConversations();
  const target = updatedConvs.find((c) => c.id === conversationId);
  if (target) {
    target.lastMessage = replyText;
    target.lastMessageTimestamp = replyMsg.timestamp;
    target.updatedAt = replyMsg.timestamp;
    target.unreadCountForUser += 1;
    saveConversations(updatedConvs);
  }
}

/**
 * Marks messages in a conversation as read
 */
export function markConversationAsRead(conversationId: string, readerRole: 'user' | 'business'): void {
  const convs = loadConversations();
  const conv = convs.find((c) => c.id === conversationId);
  if (conv) {
    if (readerRole === 'user') {
      conv.unreadCountForUser = 0;
    } else {
      conv.unreadCountForBusiness = 0;
    }
    saveConversations(convs);
  }

  const msgs = loadMessages();
  if (msgs[conversationId]) {
    msgs[conversationId].forEach((m) => {
      if ((readerRole === 'user' && m.senderRole === 'business') || (readerRole === 'business' && m.senderRole === 'user')) {
        m.read = true;
      }
    });
    saveMessages(msgs);
  }
}

/**
 * Returns total unread messages count for customer or business
 */
export function getTotalUnreadCount(role: 'user' | 'business', businessId?: string): number {
  const convs = loadConversations();
  if (role === 'business' && businessId) {
    return convs.filter((c) => c.businessId === businessId).reduce((sum, c) => sum + c.unreadCountForBusiness, 0);
  }
  return convs.reduce((sum, c) => sum + (c.unreadCountForUser || 0), 0);
}
