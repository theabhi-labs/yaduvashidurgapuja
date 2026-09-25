import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { liveDarshanService } from '../services/liveDarshanService';
import { ChatComment } from '../types';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChatEnabled, setIsChatEnabled] = useState<boolean>(initialChatEnabled);
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);

  // Sync initialChatEnabled when prop updates
  useEffect(() => {
    setIsChatEnabled(initialChatEnabled);
  }, [initialChatEnabled]);

  // Fetch recent ephemeral comments from Redis on initial load
  const loadInitialComments = useCallback(async (room: string) => {
    try {
      setIsLoading(true);
      const res = await liveDarshanService.getRoomComments(room);
      if (res.success && Array.isArray(res.data)) {
        setComments(res.data);
      }
    } catch {
      // Quiet fallback if server is starting or redis is empty
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!roomName) {
      setComments([]);
      setIsLoading(false);
      return;
    }

    const socket = getSocket();

    // 1. Join room
    socket.emit('join-arti-room', { roomName });

    // 2. Fetch initial messages
    loadInitialComments(roomName);

    // 3. Listen for new incoming broadcast comments
    const handleNewComment = (newComment: ChatComment) => {
      setComments((prev) => {
        // Prevent duplicates
        if (newComment.id && prev.some((c) => c.id === newComment.id)) {
          return prev;
        }
        return [...prev.slice(-199), newComment];
      });
    };

    const handleRateLimited = (data: { message: string }) => {
      setRateLimitWarning(data?.message || 'Please slow down (wait 2 seconds between messages)');
      setTimeout(() => {
        setRateLimitWarning(null);
      }, 2500);
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
    socket.on('chat-rate-limited', handleRateLimited);
    socket.on('chat-status-changed', handleChatStatusChanged);
    socket.on('chat-disabled', handleChatDisabled);

    return () => {
      socket.emit('leave-arti-room', { roomName });
      socket.off('new-comment', handleNewComment);
      socket.off('chat-rate-limited', handleRateLimited);
      socket.off('chat-status-changed', handleChatStatusChanged);
      socket.off('chat-disabled', handleChatDisabled);
    };
  }, [roomName, loadInitialComments]);

  // Send comment via Socket.io
  const sendComment = useCallback(
    (message: string, customName?: string) => {
      if (!roomName || !message.trim()) return;

      if (!isChatEnabled) {
        setRateLimitWarning('Live chat is currently disabled by administrator');
        setTimeout(() => setRateLimitWarning(null), 2500);
        return;
      }

      const socket = getSocket();
      const senderName = customName?.trim() || defaultName || 'Devotee';

      socket.emit('send-comment', {
        roomName,
        message: message.trim(),
        name: senderName,
      });
    },
    [roomName, defaultName, isChatEnabled]
  );

  return {
    comments,
    isLoading,
    isChatEnabled,
    rateLimitWarning,
    sendComment,
  };
};
