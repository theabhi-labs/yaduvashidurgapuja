import { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';

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

  useEffect(() => {
    const socket = getSocket();

    if (roomName) {
      socket.emit('join-arti-room', { roomName });
      socket.emit('join_room', roomName);
    }

    const handleDonation = (donation: DonationEvent) => {
      setLatestDonation(donation);
      setDonationQueue((prev) => [...prev.slice(-10), donation]);
    };

    socket.on('donation', handleDonation);
    socket.on('donation_global', handleDonation);

    return () => {
      socket.off('donation', handleDonation);
      socket.off('donation_global', handleDonation);
    };
  }, [roomName]);

  const clearLatestDonation = () => {
    setLatestDonation(null);
  };

  return { latestDonation, donationQueue, clearLatestDonation };
};
