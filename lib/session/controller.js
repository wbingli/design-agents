const createId = () => `sess-${Math.random().toString(36).slice(2)}-${Date.now()}`;

function now() {
  return new Date();
}

function iso(date) {
  if (!date) return null;
  return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
}

function clone(obj) {
  if (obj === null || obj === undefined) return obj;
  return JSON.parse(JSON.stringify(obj));
}

export class SessionController {
  constructor({ sessionId, scenarioId, segments = [], metadata = {} } = {}) {
    this.sessionId = sessionId || createId();
    this.scenarioId = scenarioId || null;
    this.metadata = metadata;

    this._handlers = new Map();
    this._state = 'idle';
    this._startedAt = null;
    this._endedAt = null;
    this._exitReason = null;
    this._chatLog = [];
    this._summary = null;

    this._segments = segments.map((segment, index) => {
      const normalized = typeof segment === 'number'
        ? { durationSeconds: segment }
        : segment || {};

      const plannedMs = normalized.durationMs
        || (normalized.durationSeconds != null ? normalized.durationSeconds * 1000 : null);

      return {
        id: normalized.id || `segment-${index + 1}`,
        name: normalized.name || `Segment ${index + 1}`,
        plannedDurationMs: plannedMs,
        startedAt: null,
        endedAt: null,
        elapsedMs: 0,
        status: 'pending',
        meta: normalized.meta || {},
        _activeTimestamp: null,
      };
    });

    this._currentSegmentIndex = -1;
  }

  /** Register a listener for a specific event. */
  on(eventName, handler) {
    if (!this._handlers.has(eventName)) {
      this._handlers.set(eventName, new Set());
    }
    this._handlers.get(eventName).add(handler);
    return () => this.off(eventName, handler);
  }

  /** Remove an event listener. */
  off(eventName, handler) {
    const handlers = this._handlers.get(eventName);
    if (!handlers) return;
    handlers.delete(handler);
    if (handlers.size === 0) {
      this._handlers.delete(eventName);
    }
  }

  /** Remove all listeners for an event or the entire controller. */
  removeAllListeners(eventName) {
    if (eventName) {
      this._handlers.delete(eventName);
      return;
    }
    this._handlers.clear();
  }

  _emit(eventName, payload) {
    const handlers = this._handlers.get(eventName);
    if (!handlers) return;
    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`SessionController handler for "${eventName}" failed`, error);
      }
    });
  }

  get state() {
    return this._state;
  }

  get chatLog() {
    return [...this._chatLog];
  }

  get segments() {
    return this._segments.map((segment) => ({
      id: segment.id,
      name: segment.name,
      plannedDurationMs: segment.plannedDurationMs,
      startedAt: segment.startedAt,
      endedAt: segment.endedAt,
      elapsedMs: segment.elapsedMs,
      status: segment.status,
      meta: clone(segment.meta),
    }));
  }

  begin() {
    if (this._state !== 'idle') {
      return;
    }
    this._startedAt = now();
    this._state = 'running';
    this._emit('session:start', {
      sessionId: this.sessionId,
      scenarioId: this.scenarioId,
      startedAt: iso(this._startedAt),
      metadata: clone(this.metadata),
    });
  }

  /**
   * Move to the next segment in the configured flow. Automatically completes any
   * currently active segment.
   */
  advance() {
    if (this._state !== 'running') return null;

    if (this._currentSegmentIndex >= 0) {
      const active = this._segments[this._currentSegmentIndex];
      if (active && active.status === 'in-progress') {
        this._completeCurrentSegmentInternal('completed');
      }
    }

    const nextIndex = this._currentSegmentIndex + 1;
    if (nextIndex >= this._segments.length) {
      this.finish();
      return null;
    }

    this._currentSegmentIndex = nextIndex;
    const segment = this._segments[this._currentSegmentIndex];
    if (!segment.startedAt) {
      const timestamp = now();
      segment.startedAt = iso(timestamp);
      segment._activeTimestamp = timestamp.getTime();
      segment.status = 'in-progress';
    }
    this._emit('segment:start', {
      sessionId: this.sessionId,
      scenarioId: this.scenarioId,
      segment: this._serializeSegment(segment),
      index: this._currentSegmentIndex,
    });
    return this._serializeSegment(segment);
  }

  /** Mark the current segment as completed and optionally move to the next. */
  completeCurrentSegment({ status = 'completed', advance = true } = {}) {
    if (this._state !== 'running') return null;
    const segment = this._completeCurrentSegmentInternal(status);
    if (!segment) return null;
    if (advance) {
      this.advance();
    }
    return segment;
  }

  _completeCurrentSegmentInternal(status) {
    if (this._currentSegmentIndex < 0 || this._currentSegmentIndex >= this._segments.length) {
      return null;
    }
    const segment = this._segments[this._currentSegmentIndex];
    const endTime = now();
    if (!segment.startedAt) {
      segment.startedAt = iso(endTime);
    }
    if (segment._activeTimestamp) {
      segment.elapsedMs += Math.max(0, endTime.getTime() - segment._activeTimestamp);
    }
    segment._activeTimestamp = null;
    segment.endedAt = iso(endTime);
    segment.status = status;

    const payload = {
      sessionId: this.sessionId,
      scenarioId: this.scenarioId,
      segment: this._serializeSegment(segment),
      index: this._currentSegmentIndex,
    };
    this._emit('segment:end', payload);
    return payload.segment;
  }

  /** Append a message to the session chat log. */
  recordMessage({ role, content, metadata = {} }) {
    if (!role || !content) {
      throw new Error('role and content are required to record a message.');
    }
    const timestamp = iso(now());
    const entry = {
      id: metadata.id || `msg-${this._chatLog.length + 1}`,
      role,
      content,
      timestamp,
      metadata: clone(metadata),
    };
    this._chatLog.push(entry);
    this._emit('chat:message', {
      sessionId: this.sessionId,
      scenarioId: this.scenarioId,
      message: entry,
    });
    return entry;
  }

  /** Finish the session normally and emit a summary payload. */
  finish() {
    if (this._state === 'completed' || this._state === 'aborted') {
      return this._summary;
    }
    if (this._state === 'running') {
      this._completeCurrentSegmentInternal('completed');
    }
    this._state = 'completed';
    this._endedAt = now();
    const summary = this._buildSummary('completed');
    this._summary = summary;
    this._emit('summary', summary);
    this._emit('session:finished', summary);
    return summary;
  }

  /** Exit the session early with a reason and emit a summary payload. */
  exitEarly(reason = 'interrupted') {
    if (this._state === 'completed' || this._state === 'aborted') {
      return this._summary;
    }
    if (this._state === 'running') {
      this._completeCurrentSegmentInternal('interrupted');
    }
    this._state = 'aborted';
    this._exitReason = reason;
    this._endedAt = now();
    const summary = this._buildSummary('aborted');
    this._summary = summary;
    this._emit('summary', summary);
    this._emit('session:finished', summary);
    return summary;
  }

  _serializeSegment(segment) {
    return {
      id: segment.id,
      name: segment.name,
      plannedDurationMs: segment.plannedDurationMs,
      startedAt: segment.startedAt,
      endedAt: segment.endedAt,
      elapsedMs: segment.elapsedMs,
      status: segment.status,
      meta: clone(segment.meta),
    };
  }

  _buildSummary(status) {
    const completedAt = this._endedAt || now();
    const segments = this._segments.map((segment) => this._serializeSegment(segment));
    const totalElapsedMs = segments.reduce((sum, segment) => sum + (segment.elapsedMs || 0), 0);
    const totalPlannedMs = segments.reduce((sum, segment) => sum + (segment.plannedDurationMs || 0), 0);

    const summary = {
      sessionId: this.sessionId,
      scenarioId: this.scenarioId,
      status,
      exitReason: status === 'aborted' ? this._exitReason : null,
      startedAt: iso(this._startedAt),
      endedAt: iso(completedAt),
      totalDurationMs: this._startedAt ? completedAt.getTime() - this._startedAt.getTime() : totalElapsedMs,
      timing: {
        segments,
        totalElapsedMs,
        totalPlannedMs,
      },
      chatLog: this.chatLog,
      messageCount: this._chatLog.length,
      metadata: clone(this.metadata),
      generatedAt: iso(now()),
    };

    return summary;
  }

  reset() {
    this._state = 'idle';
    this._startedAt = null;
    this._endedAt = null;
    this._exitReason = null;
    this._summary = null;
    this._chatLog = [];
    this._segments.forEach((segment) => {
      segment.startedAt = null;
      segment.endedAt = null;
      segment.elapsedMs = 0;
      segment.status = 'pending';
      segment._activeTimestamp = null;
    });
    this._currentSegmentIndex = -1;
    this._emit('session:reset', {
      sessionId: this.sessionId,
      scenarioId: this.scenarioId,
    });
  }
}

export default SessionController;
