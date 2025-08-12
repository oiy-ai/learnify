import { useCallback, useState } from 'react';

import type { AIGenerationProgress } from './index';

export interface UseAIGenerationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

export const useAIGeneration = (options?: UseAIGenerationOptions) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<AIGenerationProgress>({
    stage: 'preparing',
    percentage: 0,
    message: '',
  });
  const [error, setError] = useState<Error | null>(null);

  const updateProgress = useCallback(
    (
      stage: AIGenerationProgress['stage'],
      percentage: number,
      message?: string
    ) => {
      setProgress(prev => ({
        ...prev, // Keep totalItems, currentItem, currentItemName
        stage,
        percentage,
        message: message || '',
      }));
    },
    []
  );

  const startGeneration = useCallback(
    async (generateFn: () => Promise<any>) => {
      setIsGenerating(true);
      setError(null);
      setProgress(prev => ({
        ...prev, // Keep totalItems, currentItem, currentItemName
        stage: 'preparing' as const,
        percentage: 0,
        message: '',
      }));

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            // Auto-increment progress based on stage
            let newPercentage = prev.percentage;
            switch (prev.stage) {
              case 'preparing':
                newPercentage = Math.min(prev.percentage + 5, 20);
                break;
              case 'preprocessing':
                newPercentage = Math.min(prev.percentage + 2, 45);
                break;
              case 'generating':
                newPercentage = Math.min(prev.percentage + 3, 90);
                break;
              case 'finalizing':
                newPercentage = Math.min(prev.percentage + 8, 99);
                break;
            }
            return { ...prev, percentage: newPercentage };
          });
        }, 200);

        // Stage 1: Preparing
        await new Promise(resolve => setTimeout(resolve, 500));
        updateProgress('preprocessing', 25);

        // Stage 2: Preprocessing (actual AI call)
        const result = await generateFn();

        // Stage 3: Generating
        updateProgress('generating', 75);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Stage 4: Finalizing
        updateProgress('finalizing', 90);
        await new Promise(resolve => setTimeout(resolve, 800));

        // Complete
        clearInterval(progressInterval);
        setProgress({
          stage: 'finalizing',
          percentage: 100,
          message: '',
        });

        // Wait a bit before closing
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsGenerating(false);
        options?.onSuccess?.();

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Generation failed'));
        options?.onError?.(
          err instanceof Error ? err : new Error('Generation failed')
        );
        return null;
      } finally {
        // Ensure interval is cleared
        setIsGenerating(false);
      }
    },
    [updateProgress, options]
  );

  const cancel = useCallback(() => {
    setIsGenerating(false);
    setError(null);
    setProgress({
      stage: 'preparing',
      percentage: 0,
      message: '',
    });
    options?.onCancel?.();
  }, [options]);

  const retry = useCallback(
    (generateFn: () => Promise<any>) => {
      setError(null);
      return startGeneration(generateFn);
    },
    [startGeneration]
  );

  return {
    isGenerating,
    progress,
    error,
    startGeneration,
    updateProgress,
    setProgress,
    cancel,
    retry,
  };
};
