import { describe, it, expect } from 'vitest';
import { getDeterministicConversationId } from '../services/firebase';

describe('User to Business Direct Chat Engine', () => {
  it('generates consistent, deterministic conversation IDs for any user and business', () => {
    const bizId = 'gmp-medland-hospital';
    const userId = 'usr_guest_82910';
    const convoId1 = getDeterministicConversationId(bizId, userId);
    const convoId2 = getDeterministicConversationId(bizId, userId);

    expect(convoId1).toBe(convoId2);
    expect(convoId1).toContain('gmp-medland-hospital');
    expect(convoId1).toContain('usr_guest_82910');
  });

  it('sanitizes special characters in IDs safely', () => {
    const dirtyBiz = 'biz@special#chars!';
    const dirtyUser = 'user.name+test';
    const convoId = getDeterministicConversationId(dirtyBiz, dirtyUser);

    expect(convoId).not.toContain('@');
    expect(convoId).not.toContain('#');
    expect(convoId).not.toContain('!');
    expect(convoId).not.toContain('+');
    expect(convoId.startsWith('convo_')).toBe(true);
  });
});
