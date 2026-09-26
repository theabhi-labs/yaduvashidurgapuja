import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { liveDarshanService } from '../services/liveDarshanService';
import { ChatComment } from '../types';

export interface SuperChatItem {
  id: string;
  name: string;
  amount: number;
  message: string;
  timestamp: string;
  expiresAt: number;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  leftOffset: number;
}

interface UseArtiChatOptions {
  roomName?: string;
  defaultName?: string;
  initialChatEnabled?: boolean;
}

export const useArtiChat = ({
  roomName,
  defaultName = 'Devotee',
  initialChatEnabled = true,
}: UseArtiChatOptions) => {
  const [comments, setComments] = useState<ChatComment[]>([]);
  const [activeSuperChats, setActiveSuperChats] = useState<SuperChatItem[]>([]);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChatEnabled, setIsChatEnabled] = useState<boolean>(initialChatEnabled);
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);

  // Sync initialChatEnabled when prop updates
  useEffect(() => {
    setIsChatEnabled(initialChatEnabled);
  }, [initialChatEnabled]);

  // Clean expired Super Chats periodically
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setActiveSuperChats((prev) => prev.filter((sc) => sc.expiresAt > now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch recent ephemeral comments from Redis on initial load
  const loadInitialComments = useCallback(async (room: string) => {
    try {
      setIsLoading(true);
      const res = await liveDarshanService.getRoomComments(room);
      if (res.success && Array.isArray(res.data)) {
        setComments(res.data);
      }
    } catch {
      // Quiet fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!roomName) {
      setComments([]);
      setActiveSuperChats([]);
      setReactions([]);
      setIsLoading(false);
      return;
    }

    const socket = getSocket();

    // 1. Join room
    socket.emit('join-arti-room', { roomName });

    // 2. Fetch initial messages
    loadInitialComments(roomName);

    // 3. Listen for new incoming broadcast comments
    const handleNewComment = (newComment: any) => {
      setComments((prev) => {
        if (newComment.id && prev.some((c) => c.id === newComment.id)) {
          return prev;
        }
        return [...prev.slice(-199), newComment];
      });
    };

    // 4. Listen for Super Chat / Divine Seva Highlights
    const handleSuperChat = (data: any) => {
      if (!data) return;
      const amount = data.amount || 0;
      // Duration based on donation size: 15s to 60s
      const durationMs = Math.min(60000, Math.max(15000, amount * 100));
      const newItem: SuperChatItem = {
        id: data.id || `sc_${Date.now()}`,
        name: data.name || data.donorName || 'भक्त',
        amount,
        message: data.message || 'माँ के चरणों में पावन दान एवं सेवा समर्पण',
        timestamp: data.timestamp || new Date().toISOString(),
        expiresAt: Date.now() + durationMs,
      };

      setActiveSuperChats((prev) => [newItem, ...prev.slice(0, 4)]);
    };

    // 5. Listen for Floating Devotional Reactions
    const handleNewReaction = (data: { id: string; emoji: string }) => {
      if (!data?.emoji) return;
      const newReaction: FloatingReaction = {
        id: data.id || `react_${Date.now()}_${Math.random()}`,
        emoji: data.emoji,
        leftOffset: Math.floor(Math.random() * 60) + 20, // 20% to 80% on reaction column
      };

      setReactions((prev) => [...prev.slice(-15), newReaction]);

      // Remove after floating animation completes (2.5s)
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
      }, 2500);
    };

    const handleRateLimited = () => {
      // Backend handles rate-limiting smoothly without bothering devotee with blocking alerts
    };

    const handleChatStatusChanged = (data: { roomName: string; isChatEnabled: boolean }) => {
      if (data?.roomName === roomName) {
        setIsChatEnabled(Boolean(data.isChatEnabled));
      }
    };

    const handleChatDisabled = (data: { message: string }) => {
      setIsChatEnabled(false);
      setRateLimitWarning(data?.message || 'Live chat is currently disabled by administrator');
      setTimeout(() => {
        setRateLimitWarning(null);
      }, 3500);
    };

    socket.on('new-comment', handleNewComment);
    socket.on('super-chat', handleSuperChat);
    socket.on('new-reaction', handleNewReaction);
    socket.on('chat-rate-limited', handleRateLimited);
    socket.on('chat-status-changed', handleChatStatusChanged);
    socket.on('chat-disabled', handleChatDisabled);

    return () => {
      socket.emit('leave-arti-room', { roomName });
      socket.off('new-comment', handleNewComment);
      socket.off('super-chat', handleSuperChat);
      socket.off('new-reaction', handleNewReaction);
      socket.off('chat-rate-limited', handleRateLimited);
      socket.off('chat-status-changed', handleChatStatusChanged);
      socket.off('chat-disabled', handleChatDisabled);
    };
  }, [roomName, loadInitialComments]);

  // Send comment via Socket.io with immediate optimistic UI update
  const sendComment = useCallback(
    (
      messageText: string,
      customName?: string,
      userMeta?: { username?: string; avatar?: string; userId?: string }
    ) => {
      if (!roomName || !messageText.trim()) return;

      if (!isChatEnabled) return;

      const socket = getSocket();
      const senderName = customName?.trim() || defaultName || 'भक्त';
      const cleanMessage = messageText.trim().slice(0, 250);
      const generatedId = `cmt_opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const optimisticComment: ChatComment = {
        id: generatedId,
        name: senderName,
        username: userMeta?.username,
        avatar: userMeta?.avatar,
        message: cleanMessage,
        timestamp: new Date().toISOString(),
      };

      // Instantly show in local state (Optimistic UI)
      setComments((prev) => [...prev.slice(-199), optimisticComment]);

      socket.emit('send-comment', {
        roomName,
        message: cleanMessage,
        name: senderName,
        username: userMeta?.username,
        avatar: userMeta?.avatar,
        userId: userMeta?.userId,
      });
    },
    [roomName, defaultName, isChatEnabled]
  );

  // Send Devotional Reaction via Socket.io
  const sendReaction = useCallback(
    (emoji: string) => {
      if (!roomName || !emoji) return;
      const socket = getSocket();
      socket.emit('send-reaction', { roomName, emoji });
    },
    [roomName]
  );

  return {
    comments,
    activeSuperChats,
    reactions,
    isLoading,
    isChatEnabled,
    rateLimitWarning,
    sendComment,
    sendReaction,
  };
};
