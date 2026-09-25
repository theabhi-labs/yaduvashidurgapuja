import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { liveDarshanService } from '../services/liveDarshanService';
import { ChatComment } from '../types';

interface UseArtiChatOptions {
  roomName?: string;
  defaultName?: string;
}

export const useArtiChat = ({ roomName, defaultName = 'भक्त' }: UseArtiChatOptions) => {
  const [comments, setComments] = useState<ChatComment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);

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
      setRateLimitWarning(data?.message || 'कृपया धीरे-धीरे संदेश भेजें (2 सेकंड प्रतीक्षा करें)');
      setTimeout(() => {
        setRateLimitWarning(null);
      }, 2500);
    };

    socket.on('new-comment', handleNewComment);
    socket.on('chat-rate-limited', handleRateLimited);

    return () => {
      socket.emit('leave-arti-room', { roomName });
      socket.off('new-comment', handleNewComment);
      socket.off('chat-rate-limited', handleRateLimited);
    };
  }, [roomName, loadInitialComments]);

  // Send comment via Socket.io
  const sendComment = useCallback(
    (message: string, customName?: string) => {
      if (!roomName || !message.trim()) return;

      const socket = getSocket();
      const senderName = customName?.trim() || defaultName || 'भक्त';

      socket.emit('send-comment', {
        roomName,
        message: message.trim(),
        name: senderName,
      });
    },
    [roomName, defaultName]
  );

  return {
    comments,
    isLoading,
    rateLimitWarning,
    sendComment,
  };
};
