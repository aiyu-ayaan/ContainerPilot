// Summarizes Docker container update logs using AI to extract and explain error messages.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeUpdateLogsInputSchema = z.object({
  logs: z
    .string()
    .describe('The raw Docker container update logs as a string.'),
});
export type SummarizeUpdateLogsInput = z.infer<typeof SummarizeUpdateLogsInputSchema>;

const SummarizeUpdateLogsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the update logs, especially focusing on any errors encountered.'
    ),
});
export type SummarizeUpdateLogsOutput = z.infer<typeof SummarizeUpdateLogsOutputSchema>;

export async function summarizeUpdateLogs(
  input: SummarizeUpdateLogsInput
): Promise<SummarizeUpdateLogsOutput> {
  return summarizeUpdateLogsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeUpdateLogsPrompt',
  input: {schema: SummarizeUpdateLogsInputSchema},
  output: {schema: SummarizeUpdateLogsOutputSchema},
  prompt: `You are an expert in debugging Docker container updates.

  Given the following raw update logs, extract the relevant error messages and provide a concise explanation of what went wrong during the update process.

  Logs:
  {{logs}}
  `,
});

const summarizeUpdateLogsFlow = ai.defineFlow(
  {
    name: 'summarizeUpdateLogsFlow',
    inputSchema: SummarizeUpdateLogsInputSchema,
    outputSchema: SummarizeUpdateLogsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
