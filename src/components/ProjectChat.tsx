import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';

interface ProjectChatProps {
  projectId: string;
  token: string;
  currentUserId: string;
  receiverId?: string; // If PM is viewing, they select a contributor to chat with, or if it's the contributor, they chat with the PM (or we just use a broadcast/thread model).
}

// Since the user asked for 1-on-1 between user and PM, we need to handle who the receiver is.
// If the current user is a Contributor, they only chat with the PM who created the project.
// If the current user is a PM, they need a list of Contributors to select from, and then chat with them.
export default function ProjectChat({ projectId, projectName, token, currentUserId, receiverId, receiverName, receiverEmail, onBack }: any) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const prevCountRef = useRef(0);
  const initialScrollDone = useRef(false);
  const latestTimestampRef = useRef<string | null>(null);

  // Initial load and incremental cursor-based polling
  useEffect(() => {
    let isMounted = true;
    setMessages([]);
    setIsLoading(true);
    latestTimestampRef.current = null;
    initialScrollDone.current = false;

    const fetchInitial = async () => {
      try {
        const url = receiverId
          ? `/api/project-messages/${projectId}?limit=100&contributorId=${receiverId}`
          : `/api/project-messages/${projectId}?limit=100`;
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (isMounted) {
          const initialMsgs = data.messages || [];
          setMessages(initialMsgs);
          if (initialMsgs.length > 0) {
            latestTimestampRef.current = initialMsgs[initialMsgs.length - 1].createdAt;
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInitial();

    // Incremental polling every 5s fetching only new delta messages
    const pollInterval = setInterval(async () => {
      try {
        if (!latestTimestampRef.current) {
          // Retry initial fetch if no messages were present initially
          const url = receiverId
            ? `/api/project-messages/${projectId}?limit=100&contributorId=${receiverId}`
            : `/api/project-messages/${projectId}?limit=100`;
          const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (isMounted && data.messages && data.messages.length > 0) {
            setMessages(data.messages);
            latestTimestampRef.current = data.messages[data.messages.length - 1].createdAt;
          }
          return;
        }

        const pollUrl = receiverId
          ? `/api/project-messages/${projectId}?since=${encodeURIComponent(latestTimestampRef.current)}&contributorId=${receiverId}`
          : `/api/project-messages/${projectId}?since=${encodeURIComponent(latestTimestampRef.current)}`;
        const res = await fetch(pollUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (isMounted && data.messages && data.messages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m._id));
            const newDeltas = data.messages.filter((m: any) => !existingIds.has(m._id));
            if (newDeltas.length === 0) return prev;
            latestTimestampRef.current = newDeltas[newDeltas.length - 1].createdAt;
            return [...prev, ...newDeltas];
          });
        }
      } catch (pollErr) {
        // Silently swallow polling network drops
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [projectId, receiverId, token]);

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/project-messages/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ receiverId, content })
      });
      if (!res.ok) throw new Error('Failed to send');
      return res.json();
    },
    onSuccess: (data) => {
      setContent('');
      if (data?.message) {
        setMessages(prev => {
          if (prev.some(m => m._id === data.message._id)) return prev;
          latestTimestampRef.current = data.message.createdAt;
          return [...prev, data.message];
        });
      }
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
    }
  });

  // Filter messages safely for this specific 1-on-1 conversation
  const chatMessages = messages?.filter((m: any) => {
    if (!m?.senderId || !m?.receiverId) return false;
    const senderIdStr = String(m.senderId._id || m.senderId);
    const receiverIdStr = String(m.receiverId._id || m.receiverId);
    return (
      (senderIdStr === String(currentUserId) && receiverIdStr === String(receiverId)) ||
      (senderIdStr === String(receiverId) && receiverIdStr === String(currentUserId))
    );
  }) || [];

  useEffect(() => {
    if (!initialScrollDone.current || chatMessages.length > prevCountRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: initialScrollDone.current ? 'smooth' : 'auto' });
      initialScrollDone.current = true;
    }
    prevCountRef.current = chatMessages.length;
  }, [chatMessages.length]);

  useEffect(() => {
    // Mark messages as read when viewing the chat
    const markAsRead = async () => {
      try {
        await fetch(`/api/project-messages/${projectId}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderId: receiverId })
        });
        queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
      } catch (err) {
        console.error('Failed to mark messages as read', err);
      }
    };
    if (chatMessages.length > 0) {
      markAsRead();
    }
  }, [chatMessages.length, projectId, token, receiverId, queryClient]);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading messages...</div>;

  const renderMessageContent = (content: string) => {
    // Matches URLs with http/https/www OR domains ending in common TLDs
    const urlRegex = /((?:https?:\/\/|www\.)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)|(?:[-a-zA-Z0-9@:%_+~#=]{1,256}\.(?:com|org|net|io|co|in|us|uk|me|dev|ai|app)\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)))/gi;
    
    if (!content) return null;
    
    const parts = content.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        let href = part;
        if (!href.match(/^https?:\/\//i)) {
          href = `https://${href}`;
        }
        return (
          <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80 transition-opacity break-all font-medium">
            {part}
          </a>
        );
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-blue-50">
      {(onBack || receiverName || projectName) && (
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {onBack && (
              <button onClick={onBack} className="text-blue-600 font-bold text-sm hover:underline shrink-0">&larr; Back</button>
            )}
            {projectName && (
              <h3 className="font-bold text-slate-800 truncate">{projectName}</h3>
            )}
          </div>
          {(receiverName || receiverEmail) && (
            <div className="text-right shrink-0">
              <p className="font-bold text-slate-900">{receiverName}</p>
              {receiverEmail && <p className="text-xs text-slate-500">{receiverEmail}</p>}
            </div>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
        {chatMessages.map((msg: any) => {
          const isMe = msg.senderId?._id === currentUserId || String(msg.senderId) === currentUserId;
          const senderName = isMe ? 'You' : (msg.senderId?.fullName || 'User');
          return (
            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-2">
                <span className="text-xs font-bold text-slate-500">{senderName}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(msg.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
              <div className={`px-4 py-2 rounded-2xl max-w-[80%] break-words ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                {renderMessageContent(msg.content)}
              </div>
            </div>
          )
        })}
        {chatMessages.length === 0 && (
          <div className="text-center py-12 text-slate-400">No messages yet. Start the conversation!</div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => { e.preventDefault(); if (content.trim()) sendMessageMutation.mutate(); }}
          className="flex gap-2 items-end"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            className="flex-1 bg-blue-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-300 resize-y min-h-[44px]"
          />
          <button
            type="submit"
            disabled={!content.trim() || sendMessageMutation.isPending}
            className="p-3 mb-0.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shrink-0 h-[48px]"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
