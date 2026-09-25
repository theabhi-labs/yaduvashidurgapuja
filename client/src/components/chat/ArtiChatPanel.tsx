import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User as UserIcon,
  Flame,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useArtiChat } from '../../hooks/useArtiChat';
import { useAuth } from '../../context/AuthContext';

interface ArtiChatPanelProps {
  roomName: string;
  className?: string;
  defaultExpanded?: boolean;
  initialChatEnabled?: boolean;
}

const QUICK_DEVOTIONS = [
  'जय माता दी! 🚩',
  'माँ दुर्गा की जय! 🌸',
  'जय दुर्गे दुर्गति नाशिनी! ✨',
  'प्रणाम माँ भगवती 🙏',
  'कपूरिपुर दुर्गा पूजा की जय! 🕉️',
];

export const ArtiChatPanel: React.FC<ArtiChatPanelProps> = ({
  roomName,
  className = '',
  defaultExpanded = true,
  initialChatEnabled = true,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [message, setMessage] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [showNameField, setShowNameField] = useState<boolean>(false);

  const effectiveName = isAuthenticated && user?.name ? user.name : (guestName.trim() || 'भक्त');

  const { comments, isLoading, isChatEnabled, rateLimitWarning, sendComment } = useArtiChat({
    roomName,
    defaultName: effectiveName,
    initialChatEnabled,
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when new comment arrives
  useEffect(() => {
    if (isExpanded) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, isExpanded]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isChatEnabled) return;

    sendComment(message, effectiveName);
    setMessage('');
  };

  const handleQuickDevotion = (quickText: string) => {
    if (!isChatEnabled) return;
    sendComment(quickText, effectiveName);
  };

  const formatTime = (timestampStr: string) => {
    try {
      const d = new Date(timestampStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`bg-cream-100 rounded-2xl border border-gold-500/30 shadow-lg overflow-hidden flex flex-col transition-all duration-300 ${className}`}
    >
      {/* Panel Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-maroon-900 via-maroon-950 to-maroon-900 text-gold-200 px-4 py-3 flex items-center justify-between border-b border-gold-500/20 select-none cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gold-500/20 flex items-center justify-center text-gold-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-devanagari-heading font-bold text-cream-50 leading-tight">
              लाइव आरती संवाद (Live Chat)
            </h3>
            <p className="text-[10px] text-gold-300/80 font-devanagari-body">
              {comments.length} पावन जयकारे • 1 घंटे में स्वतः विलीन
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gold-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isChatEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
            }`}
          />
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable Chat Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col h-[400px] sm:h-[460px]"
          >
            {/* Chat Disabled Info Banner */}
            {!isChatEnabled && (
              <div className="bg-red-900/10 border-b border-red-500/30 px-3 py-2 text-xs text-red-900 flex items-center gap-1.5 font-devanagari-body font-semibold">
                <Lock className="w-3.5 h-3.5 text-red-700 shrink-0" />
                <span>व्यवस्थापक द्वारा संवाद (Chat) अस्थायी रूप से बंद किया गया है।</span>
              </div>
            )}

            {/* Rate Limit Warning Banner */}
            {rateLimitWarning && (
              <div className="bg-amber-100 border-b border-amber-300 px-3 py-1.5 text-xs text-amber-900 flex items-center gap-1.5 font-devanagari-body animate-shake">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{rateLimitWarning}</span>
              </div>
            )}

            {/* Comments Scroll View */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-cream-50/80">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted text-xs font-devanagari-body">
                  <span>लाइव संवाद लोड हो रहा है...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted space-y-2">
                  <div className="w-12 h-12 rounded-full bg-maroon-900/10 text-maroon-800 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-gold-600" />
                  </div>
                  <p className="text-xs font-devanagari-body text-dark-800 font-semibold">
                    अभी कोई जयकारा नहीं लिखा गया है।
                  </p>
                  <p className="text-[11px] text-muted font-devanagari-body">
                    माँ दुर्गा की आरती में पहला जयकारा आप लिखें! 🙏
                  </p>
                </div>
              ) : (
                comments.map((cmt, idx) => (
                  <motion.div
                    key={cmt.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 rounded-xl bg-cream-100/90 border border-cream-300/80 shadow-xs text-xs font-devanagari-body"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-maroon-900 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-gold-600 fill-gold-600" />
                        {cmt.name}
                      </span>
                      {cmt.timestamp && (
                        <span className="text-[10px] text-muted font-mono">
                          {formatTime(cmt.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-dark-900 break-words leading-relaxed pl-4 text-[12.5px]">
                      {cmt.message}
                    </p>
                  </motion.div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Devotion Pills */}
            <div className="px-3 py-2 bg-cream-100 border-t border-cream-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_DEVOTIONS.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={!isChatEnabled}
                  onClick={() => handleQuickDevotion(phrase)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-cream-50 hover:bg-gold-500/15 text-maroon-900 text-[11px] font-semibold border border-cream-300 hover:border-gold-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-devanagari-body"
                >
                  {phrase}
                </button>
              ))}
            </div>

            {/* Message Input Footer */}
            <div className="p-3 bg-cream-100 border-t border-cream-300 space-y-2">
              {/* Optional Guest Name Toggle for non-logged in users */}
              {!isAuthenticated && isChatEnabled && (
                <div className="flex items-center justify-between text-[11px] text-muted font-devanagari-body px-1">
                  <span>
                    नाम:{' '}
                    <strong className="text-maroon-900 font-semibold">
                      {guestName.trim() || 'भक्त (Guest)'}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNameField(!showNameField)}
                    className="text-maroon-800 hover:underline font-semibold"
                  >
                    {showNameField ? 'छिपाएं' : 'नाम बदलें'}
                  </button>
                </div>
              )}

              {showNameField && !isAuthenticated && isChatEnabled && (
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="अपना शुभ नाम लिखें..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    maxLength={30}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-1 focus:ring-maroon-700"
                  />
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    disabled={!isChatEnabled}
                    placeholder={
                      isChatEnabled
                        ? 'माँ दुर्गा के लिए जयकारा / टिप्पणी लिखें...'
                        : 'चैट सेवा वर्तमान में बंद है...'
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={200}
                    className="w-full pl-3 pr-12 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs font-devanagari-body focus:outline-none focus:ring-2 focus:ring-maroon-700/20 focus:border-maroon-700 disabled:opacity-50 disabled:bg-cream-200/50"
                  />
                  {isChatEnabled && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted font-mono">
                      {200 - message.length}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!message.trim() || !isChatEnabled}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-maroon-800 to-maroon-950 text-gold-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-maroon-900 hover:to-dark-950 border border-gold-500/30 shadow-sm transition-all"
                  aria-label="Send Comment"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
