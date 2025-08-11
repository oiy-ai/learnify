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
      setProgress({
        stage,
        percentage,
        message: message || '',
      });
    },
    []
  );

  const startGeneration = useCallback(
    async (generateFn: () => Promise<any>) => {
      setIsGenerating(true);
      setError(null);
      setProgress({
        stage: 'preparing',
        percentage: 0,
        message: '正在准备材料...',
      });

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
              case 'generating':
                newPercentage = Math.min(prev.percentage + 2, 70);
                break;
              case 'processing':
                newPercentage = Math.min(prev.percentage + 3, 90);
                break;
              case 'finalizing':
                newPercentage = Math.min(prev.percentage + 5, 95);
                break;
            }
            return { ...prev, percentage: newPercentage };
          });
        }, 200);

        // Stage 1: Preparing
        await new Promise(resolve => setTimeout(resolve, 500));
        updateProgress('generating', 25, 'AI 正在分析材料并生成内容...');

        // Stage 2: Generating (actual AI call)
        const result = await generateFn();

        // Stage 3: Processing
        updateProgress('processing', 75, '正在处理生成的内容...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Stage 4: Finalizing
        updateProgress('finalizing', 90, '即将完成...');
        await new Promise(resolve => setTimeout(resolve, 300));

        // Complete
        clearInterval(progressInterval);
        setProgress({
          stage: 'finalizing',
          percentage: 100,
          message: '完成！',
        });

        // Wait a bit before closing
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsGenerating(false);
        options?.onSuccess?.();

        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('生成失败'));
        options?.onError?.(err instanceof Error ? err : new Error('生成失败'));
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
    cancel,
    retry,
  };
};
