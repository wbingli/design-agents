import { useEffect, useMemo, useRef, useState } from 'react';

function mapInitialMessages(initialMessages) {
  if (!Array.isArray(initialMessages)) {
    return [];
  }

  return initialMessages
    .filter((message) => message && typeof message.content === 'string')
    .map((message, index) => ({
      id: message.id || `initial-${index}`,
      role: message.role === 'assistant' ? 'assistant' : message.role === 'system' ? 'system' : 'user',
      content: message.content,
      segmentId: message.segmentId || null,
      type: message.type || (message.role === 'system' ? 'notice' : message.role || 'user'),
      createdAt: message.createdAt || Date.now()
    }));
}

function getSegmentLabel(segment, fallback) {
  if (!segment) {
    return fallback;
  }
  return segment.label || segment.title || segment.name || fallback;
}

export default function ChatPanel({
  sessionId,
  activeSegmentId,
  segments,
  initialMessages
}) {
  const sanitizedInitialMessages = useMemo(() => mapInitialMessages(initialMessages), [initialMessages]);
  const normalizedSegments = useMemo(() => (Array.isArray(segments) ? segments : []), [segments]);

  const [thread, setThread] = useState(() => sanitizedInitialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);
  const previousSegmentRef = useRef(null);
  const threadRef = useRef(thread);

  useEffect(() => {
    threadRef.current = thread;
  }, [thread]);

  useEffect(() => {
    setThread(sanitizedInitialMessages);
  }, [sanitizedInitialMessages]);

  const segmentLookup = useMemo(() => {
    return new Map(normalizedSegments.map((segment) => [segment.id || segment.segmentId, segment]));
  }, [normalizedSegments]);

  useEffect(() => {
    if (!activeSegmentId) {
      return;
    }

    const previousSegmentId = previousSegmentRef.current;
    if (previousSegmentId === activeSegmentId) {
      return;
    }

    const segment = segmentLookup.get(activeSegmentId) || null;
    const label = getSegmentLabel(segment, activeSegmentId);
    const durationSeconds = segment && (segment.durationSeconds ?? segment.duration ?? null);
    const durationMinutes = durationSeconds ? Math.round(durationSeconds / 60) : null;

    const noticePrefix = previousSegmentId ? 'Timer advanced to' : 'Starting';
    const durationText = durationMinutes ? ` — approximately ${durationMinutes} minute${durationMinutes === 1 ? '' : 's'} remaining.` : '.';
    const noticeMessage = `${noticePrefix} ${label}${durationText}`;

    setThread((current) => [
      ...current,
      {
        id: `notice-${Date.now()}`,
        role: 'system',
        content: noticeMessage,
        segmentId: activeSegmentId,
        type: 'notice',
        createdAt: Date.now()
      }
    ]);

    previousSegmentRef.current = activeSegmentId;
  }, [activeSegmentId, segmentLookup]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread]);

  const hasActiveSegment = Boolean(activeSegmentId);
  const activeSegment = useMemo(() => segmentLookup.get(activeSegmentId) || null, [segmentLookup, activeSegmentId]);
  const activeSegmentLabel = getSegmentLabel(activeSegment, activeSegmentId || 'current segment');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();

    if (!trimmed || !sessionId || !hasActiveSegment) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      segmentId: activeSegmentId,
      type: 'user',
      createdAt: Date.now()
    };

    const conversationForRequest = [
      ...threadRef.current.filter((message) => message.role === 'assistant' || message.role === 'user'),
      userMessage
    ].map((message) => ({
      role: message.role,
      content: message.content,
      segmentId: message.segmentId
    }));

    setThread((current) => [...current, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await fetch('/api/session/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          segmentId: activeSegmentId,
          messages: conversationForRequest
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data || typeof data.reply !== 'string') {
        throw new Error('Malformed response from server');
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        segmentId: activeSegmentId,
        type: 'assistant',
        createdAt: Date.now()
      };

      setThread((current) => [...current, assistantMessage]);
    } catch (error) {
      setThread((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: 'system',
          content: `Unable to deliver your message. ${error.message}`,
          segmentId: activeSegmentId,
          type: 'error',
          createdAt: Date.now()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-900">Interview Chat</h2>
        <p className="text-xs text-slate-500">Currently in {activeSegmentLabel}.</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm text-slate-800">
        {thread.map((message) => {
          const isAssistant = message.role === 'assistant';
          const isUser = message.role === 'user';
          const isSystem = message.role === 'system';
          const bubbleClasses = isAssistant
            ? 'bg-indigo-50 border border-indigo-100 text-slate-900'
            : isUser
              ? 'bg-slate-900 text-white'
              : message.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-700'
                : 'bg-slate-100 text-slate-700';

          return (
            <div key={message.id} className="flex flex-col">
              <div className="mb-1 text-[0.65rem] uppercase tracking-wide text-slate-400">
                {isUser && 'You'}
                {isAssistant && 'Interviewer'}
                {isSystem && !isUser && !isAssistant && 'System'}
                {message.segmentId && (
                  <span className="ml-1 lowercase text-slate-300">
                    · {message.segmentId}
                  </span>
                )}
              </div>
              <div className={`max-w-full rounded-lg px-3 py-2 leading-relaxed ${bubbleClasses}`}>
                {message.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 px-4 py-3">
        <fieldset disabled={isSending || !hasActiveSegment} className="flex flex-col gap-2">
          <textarea
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={hasActiveSegment ? `Respond for the ${activeSegmentLabel} segment...` : 'Waiting for the next segment to begin'}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{hasActiveSegment ? `Tagging responses as ${activeSegmentLabel}.` : 'Input disabled until the next segment starts.'}</span>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
