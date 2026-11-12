import { BusinessPost, BusinessFollow } from '../types';

const STORAGE_KEY_FOLLOWS = 'bwana_user_follows_v1';
const STORAGE_KEY_POSTS = 'bwana_business_posts_v1';

// Seed initial updates, new product drops, and promotions from top Zambian businesses
const INITIAL_POSTS: BusinessPost[] = [
  {
    id: 'post-1',
    businessId: 'biz-abc-hardware',
    businessName: 'ABC Hardware & Electrical',
    businessLogo: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=120&q=80',
    businessCity: 'Kitwe',
    title: '🚚 Fresh Consignment: Dangote Portland Cement 42.5N in Stock',
    content: 'A fresh bulk shipment of 1,200 bags of Dangote 42.5N high-strength structural cement has arrived at our Kitwe Town Centre depot. Special price of K145 per bag for 50+ bag orders with free delivery within Kitwe Central!',
    type: 'new_product',
    imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80',
    productId: 'prod-1',
    productPrice: 145,
    discountCode: 'CEMENT50',
    discountPercentage: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    likesCount: 38,
  },
  {
    id: 'post-2',
    businessId: 'biz-copper-pot',
    businessName: 'Copper Pot Kitchen & Bakery',
    businessLogo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=120&q=80',
    businessCity: 'Lusaka',
    title: '🍲 Weekend Village Chicken Nshima & Fried Kapenta Feast',
    content: 'Join us this weekend for traditional organic Village Chicken stewed in authentic tomato and onion gravy, served with piping hot Nshima, Chibwabwa with groundnut powder, and crispy Lake Tanganyika Kapenta. Order online for instant dispatch!',
    type: 'promotion',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    discountCode: 'VILLAGEFEAST',
    discountPercentage: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    likesCount: 64,
  },
  {
    id: 'post-3',
    businessId: 'biz-luangwa-safari',
    businessName: 'Luangwa Valley Organic Produce',
    businessLogo: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=120&q=80',
    businessCity: 'Lusaka',
    title: '🌱 Organic Honeycomb & Dried Mango Slices Harvest Available',
    content: 'Direct from community beekeepers and agro-forest orchards in Eastern Province. 100% raw unpasteurized Miombo woodland honey and organic sun-dried mangoes now packed in 500g and 1kg glass jars.',
    type: 'new_product',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    productPrice: 95,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    likesCount: 52,
  },
  {
    id: 'post-4',
    businessId: 'biz-abc-hardware',
    businessName: 'ABC Hardware & Electrical',
    businessLogo: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=120&q=80',
    businessCity: 'Kitwe',
    title: '⚡ Power Backup Solutions: Solar Inverters & Lithium Batteries',
    content: 'Don’t let load shedding disrupt your home or business. We have installed new hybrid 5kW / 10kW solar inverters with 5.12kWh wall-mount lithium iron phosphate batteries. Consult our licensed electrical engineers today.',
    type: 'announcement',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    likesCount: 89,
  },
];

// Default followed businesses for testing so the feed is lively
const INITIAL_FOLLOWS: BusinessFollow[] = [
  {
    id: 'follow-1',
    userId: 'current_user',
    businessId: 'biz-abc-hardware',
    followedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'follow-2',
    userId: 'current_user',
    businessId: 'biz-copper-pot',
    followedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

function loadFollows(): BusinessFollow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLLOWS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FOLLOWS, JSON.stringify(INITIAL_FOLLOWS));
      return INITIAL_FOLLOWS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse follows from storage', err);
    return INITIAL_FOLLOWS;
  }
}

function saveFollows(follows: BusinessFollow[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FOLLOWS, JSON.stringify(follows));
    window.dispatchEvent(new CustomEvent('bwana_follows_updated'));
  } catch (err) {
    console.error('Failed to save follows', err);
  }
}

function loadPosts(): BusinessPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POSTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse posts from storage', err);
    return INITIAL_POSTS;
  }
}

function savePosts(posts: BusinessPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent('bwana_posts_updated'));
  } catch (err) {
    console.error('Failed to save posts', err);
  }
}

/**
 * Checks if a user is following a specific business
 */
export function isFollowing(userId: string, businessId: string): boolean {
  const follows = loadFollows();
  return follows.some((f) => (f.userId === userId || f.userId === 'current_user') && f.businessId === businessId);
}

/**
 * Toggles follow state for a business
 */
export function toggleFollow(userId: string, businessId: string): boolean {
  const follows = loadFollows();
  const index = follows.findIndex(
    (f) => (f.userId === userId || f.userId === 'current_user') && f.businessId === businessId
  );

  if (index !== -1) {
    // Unfollow
    follows.splice(index, 1);
    saveFollows(follows);
    return false;
  } else {
    // Follow
    const newFollow: BusinessFollow = {
      id: `follow-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: userId || 'current_user',
      businessId,
      followedAt: new Date().toISOString(),
    };
    follows.unshift(newFollow);
    saveFollows(follows);
    return true;
  }
}

/**
 * Gets array of all business IDs followed by the user
 */
export function getFollowedBusinessIds(userId: string): string[] {
  const follows = loadFollows();
  return follows
    .filter((f) => f.userId === userId || f.userId === 'current_user')
    .map((f) => f.businessId);
}

/**
 * Retrieves the personalized following feed for a user
 */
export function getFollowingFeed(userId: string): BusinessPost[] {
  const followedIds = getFollowedBusinessIds(userId);
  const posts = loadPosts();

  // If user follows businesses, return posts from those businesses
  if (followedIds.length > 0) {
    return posts.filter((p) => followedIds.includes(p.businessId));
  }

  // If user has not followed anyone yet, return all active community posts as discovery
  return posts;
}

/**
 * Gets all posts across the platform
 */
export function getAllPosts(): BusinessPost[] {
  return loadPosts();
}

/**
 * Allows a business owner to create and publish a new post/deal for their followers
 */
export function createBusinessPost(
  businessId: string,
  businessName: string,
  businessLogo: string | undefined,
  businessCity: string | undefined,
  postData: {
    title: string;
    content: string;
    type: 'announcement' | 'promotion' | 'new_product' | 'flash_sale';
    imageUrl?: string;
    discountCode?: string;
    discountPercentage?: number;
    productId?: string;
    productPrice?: number;
  }
): BusinessPost {
  const posts = loadPosts();
  const newPost: BusinessPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    businessId,
    businessName,
    businessLogo,
    businessCity: businessCity || 'Zambia',
    title: postData.title,
    content: postData.content,
    type: postData.type,
    imageUrl: postData.imageUrl,
    discountCode: postData.discountCode,
    discountPercentage: postData.discountPercentage,
    productId: postData.productId,
    productPrice: postData.productPrice,
    createdAt: new Date().toISOString(),
    likesCount: 1,
  };

  posts.unshift(newPost);
  savePosts(posts);
  return newPost;
}
