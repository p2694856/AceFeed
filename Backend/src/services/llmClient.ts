import { pipeline, TextGenerationPipeline } from '@xenova/transformers';

// 1. Define exactly what text-generation returns
export type TextGenOutput = Array<{
  generated_text: string
}>;

let generator: TextGenerationPipeline | null = null;

/**
 * Initialize (once) and return the local GPT-2 generator.
 */
export async function initGenerator(): Promise<TextGenerationPipeline> {
  if (generator) {
    return generator;
  }

  // Cast the result of pipeline() to TextGenerationPipeline
  generator = (await pipeline(
    'text-generation',
    'gpt2'
  )) as TextGenerationPipeline;

  return generator;
}