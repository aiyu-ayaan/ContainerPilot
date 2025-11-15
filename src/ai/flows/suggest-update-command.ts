'use server';

/**
 * @fileOverview Suggests the Docker CLI command to update a container.
 *
 * - suggestUpdateCommand - A function that suggests the update command.
 * - SuggestUpdateCommandInput - The input type for the suggestUpdateCommand function.
 * - SuggestUpdateCommandOutput - The return type for the suggestUpdateCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestUpdateCommandInputSchema = z.object({
  containerName: z.string().describe('The name of the Docker container.'),
  currentImage: z.string().describe('The current image of the Docker container.'),
  latestImage: z.string().describe('The latest available image for the Docker container.'),
});
export type SuggestUpdateCommandInput = z.infer<
  typeof SuggestUpdateCommandInputSchema
>;

const SuggestUpdateCommandOutputSchema = z.object({
  updateCommand: z.string().describe('The Docker CLI command to update the container.'),
});
export type SuggestUpdateCommandOutput = z.infer<
  typeof SuggestUpdateCommandOutputSchema
>;

export async function suggestUpdateCommand(
  input: SuggestUpdateCommandInput
): Promise<SuggestUpdateCommandOutput> {
  return suggestUpdateCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestUpdateCommandPrompt',
  input: {schema: SuggestUpdateCommandInputSchema},
  output: {schema: SuggestUpdateCommandOutputSchema},
  prompt: `You are a Docker expert. Given the current container name, current image and latest image, suggest the exact docker CLI command to update the container.

Container Name: {{{containerName}}}
Current Image: {{{currentImage}}}
Latest Image: {{{latestImage}}}

Suggest the docker CLI command:
`,
});

const suggestUpdateCommandFlow = ai.defineFlow(
  {
    name: 'suggestUpdateCommandFlow',
    inputSchema: SuggestUpdateCommandInputSchema,
    outputSchema: SuggestUpdateCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
