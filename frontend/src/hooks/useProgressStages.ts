import { useState, useEffect, useRef } from 'react';

export interface ProgressStage {
  readonly delay: number;
  readonly key: string;
}

export function useProgressStages(
  isActive: boolean,
  stages: readonly ProgressStage[],
): string | null {
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!isActive) {
      setCurrentStage(null);
      return;
    }

    setCurrentStage(stages[0]?.key ?? null);

    timersRef.current = stages.slice(1).map(({ delay, key }) =>
      setTimeout(() => setCurrentStage(key), delay),
    );

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [isActive, stages]);

  return currentStage;
}
