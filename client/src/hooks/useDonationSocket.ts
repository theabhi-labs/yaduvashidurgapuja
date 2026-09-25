import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface DonationEvent {
  donorName: string;
  amount: number;
  message?: string;
  roomName?: string;
  timestamp: string;
}

export const useDonationSocket = (roomName?: string) => {
  const [latestDonation, setLatestDonation] = useState<DonationEvent | null>(null);
  const [donationQueue, setDonationQueue] = useState<DonationEvent[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Determine socket server URL
    const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
    let socketUrl = window.location.origin;
    if (apiUrl && apiUrl.startsWith('http')) {
      try {
        const parsed = new URL(apiUrl);
        socketUrl = parsed.origin;
      } catch {
        socketUrl = window.location.origin;
      }
    } else if (import.meta.env.DEV) {
      socketUrl = 'http://localhost:5000';
    }

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (roomName) {
        socket.emit('join_room', roomName);
      }
    });

    const handleDonation = (donation: DonationEvent) => {
      setLatestDonation(donation);
      setDonationQueue((prev) => [...prev.slice(-10), donation]);
    };

    socket.on('donation', handleDonation);
    socket.on('donation_global', handleDonation);

    return () => {
      if (roomName) {
        socket.emit('leave_room', roomName);
      }
      socket.off('donation', handleDonation);
      socket.off('donation_global', handleDonation);
      socket.disconnect();
    };
  }, [roomName]);

  const clearLatestDonation = () => {
    setLatestDonation(null);
  };

  return { latestDonation, donationQueue, clearLatestDonation };
};
