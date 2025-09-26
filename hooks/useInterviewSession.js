import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function normalizeSegments(rawSegments) {
  if (!Array.isArray(rawSegments)) {
    return [];
  }

  return rawSegments
    .map((segment, index) => {
      if (segment && typeof segment === 'object') {
        const duration = Number(segment.duration ?? segment.seconds ?? 0);
        return {
          id: segment.id ?? `segment-${index + 1}`,
          name: segment.name ?? `Segment ${index + 1}`,
          duration: Number.isFinite(duration) && duration > 0 ? duration : 0,
        };
      }

      const duration = Number(segment);
      return {
        id: `segment-${index + 1}`,
        name: `Segment ${index + 1}`,
        duration: Number.isFinite(duration) && duration > 0 ? duration : 0,
      };
    })
    .filter((segment) => segment.duration > 0);
}

export default function useInterviewSession(inputSegments) {
  const segments = useMemo(() => normalizeSegments(inputSegments), [inputSegments]);
  const segmentsRef = useRef(segments);
  const totalDurationRef = useRef(segments.reduce((sum, seg) => sum + seg.duration, 0));
  const intervalRef = useRef(null);
  const lastTickRef = useRef(null);
  const remainingSecondsRef = useRef(segments[0]?.duration ?? 0);

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(segments[0]?.duration ?? 0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isComplete, setIsComplete] = useState(segments.length === 0);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

  const isActiveRef = useRef(isActive);
  const isPausedRef = useRef(isPaused);
  const isCompleteRef = useRef(isComplete);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    segmentsRef.current = segments;
    totalDurationRef.current = segments.reduce((sum, seg) => sum + seg.duration, 0);
    remainingSecondsRef.current = segments[0]?.duration ?? 0;

    setCurrentSegmentIndex(0);
    setRemainingSeconds(segments[0]?.duration ?? 0);
    setIsActive(false);
    setIsPaused(true);
    setIsComplete(segments.length === 0);
    setTotalElapsedSeconds(0);
    lastTickRef.current = null;
    clearTimer();
  }, [segments, clearTimer]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds]);

  const advanceSegment = useCallback(() => {
    setCurrentSegmentIndex((index) => {
      const nextIndex = index + 1;
      if (nextIndex >= segmentsRef.current.length) {
        clearTimer();
        setIsComplete(true);
        setIsActive(false);
        setIsPaused(true);
        lastTickRef.current = null;
        remainingSecondsRef.current = 0;
        setRemainingSeconds(0);
        setTotalElapsedSeconds(totalDurationRef.current);
        isCompleteRef.current = true;
        isActiveRef.current = false;
        isPausedRef.current = true;
        return index;
      }

      const nextDuration = segmentsRef.current[nextIndex].duration;
      remainingSecondsRef.current = nextDuration;
      setRemainingSeconds(nextDuration);
      lastTickRef.current = Date.now();
      return nextIndex;
    });
  }, [clearTimer]);

  const tick = useCallback(() => {
    if (!isActiveRef.current || isPausedRef.current || isCompleteRef.current) {
      return;
    }

    const now = Date.now();
    const lastTick = lastTickRef.current ?? now;
    const deltaSeconds = (now - lastTick) / 1000;
    lastTickRef.current = now;

    if (deltaSeconds <= 0) {
      return;
    }

    setTotalElapsedSeconds((prev) => {
      const next = prev + deltaSeconds;
      const capped = Math.min(next, totalDurationRef.current);
      return Number.isFinite(capped) ? capped : 0;
    });

    const nextRemaining = remainingSecondsRef.current - deltaSeconds;

    if (nextRemaining <= 0) {
      remainingSecondsRef.current = 0;
      setRemainingSeconds(0);
      advanceSegment();
    } else {
      remainingSecondsRef.current = nextRemaining;
      setRemainingSeconds(nextRemaining);
    }
  }, [advanceSegment]);

  useEffect(() => {
    clearTimer();

    if (!isActive || isPaused || isComplete) {
      return;
    }

    intervalRef.current = setInterval(tick, 1000);

    return () => {
      clearTimer();
    };
  }, [isActive, isPaused, isComplete, tick, clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const start = useCallback(() => {
    if (!segmentsRef.current.length) {
      return;
    }

    const initialDuration = segmentsRef.current[0].duration;
    remainingSecondsRef.current = initialDuration;
    setCurrentSegmentIndex(0);
    setRemainingSeconds(initialDuration);
    setIsActive(true);
    setIsPaused(false);
    setIsComplete(false);
    setTotalElapsedSeconds(0);
    isActiveRef.current = true;
    isPausedRef.current = false;
    isCompleteRef.current = false;
    lastTickRef.current = Date.now();
  }, []);

  const pause = useCallback(() => {
    if (!isActiveRef.current || isPausedRef.current || isCompleteRef.current) {
      return;
    }

    setIsPaused(true);
    isPausedRef.current = true;
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!isActiveRef.current || !isPausedRef.current || isCompleteRef.current) {
      return;
    }

    setIsPaused(false);
    isPausedRef.current = false;
    lastTickRef.current = Date.now();
  }, []);

  const skip = useCallback(() => {
    if (!isActiveRef.current || isCompleteRef.current) {
      return;
    }

    advanceSegment();
  }, [advanceSegment]);

  const reset = useCallback(() => {
    clearTimer();
    remainingSecondsRef.current = segmentsRef.current[0]?.duration ?? 0;
    setCurrentSegmentIndex(0);
    setRemainingSeconds(segmentsRef.current[0]?.duration ?? 0);
    setIsActive(false);
    setIsPaused(true);
    setIsComplete(segmentsRef.current.length === 0);
    setTotalElapsedSeconds(0);
    isActiveRef.current = false;
    isPausedRef.current = true;
    isCompleteRef.current = segmentsRef.current.length === 0;
    lastTickRef.current = null;
  }, [clearTimer]);

  const currentSegment = segments[currentSegmentIndex] ?? null;
  const segmentProgress = useMemo(() => {
    if (!currentSegment || currentSegment.duration === 0) {
      return 0;
    }
    const progress = 1 - remainingSeconds / currentSegment.duration;
    return Math.min(Math.max(progress, 0), 1);
  }, [currentSegment, remainingSeconds]);

  const totalDurationSeconds = useMemo(
    () => segments.reduce((sum, seg) => sum + seg.duration, 0),
    [segments]
  );

  const overallProgress = useMemo(() => {
    if (totalDurationSeconds === 0) {
      return 0;
    }
    const progress = totalElapsedSeconds / totalDurationSeconds;
    return Math.min(Math.max(progress, 0), 1);
  }, [totalElapsedSeconds, totalDurationSeconds]);

  return {
    segments,
    currentSegmentIndex,
    currentSegment,
    remainingSeconds,
    isActive,
    isPaused,
    isComplete,
    totalElapsedSeconds,
    totalDurationSeconds,
    segmentProgress,
    overallProgress,
    start,
    pause,
    resume,
    skip,
    reset,
  };
}
