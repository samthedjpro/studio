'use server';

/**
 * @fileOverview Dermatology analysis AI agent.
 *
 * - analyzeSkinCondition - A function that handles the dermatology analysis process.
 * - DermatologyAnalysisInput - The input type for the analyzeSkinCondition function.
 * - DermatologyAnalysisOutput - The return type for the analyzeSkinCondition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DermatologyAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a skin condition (lesion, rash, bedsore, burn), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DermatologyAnalysisInput = z.infer<typeof DermatologyAnalysisInputSchema>;

const DermatologyAnalysisOutputSchema = z.object({
  diagnosis: z.object({
    condition: z.string().describe('The identified type of skin condition (e.g., skin lesion, rash, bedsore, burn).'),
    severity: z.string().describe('The assessed potential severity of the condition.'),
    details: z.string().describe('A detailed analysis of the skin condition.'),
  }),
  firstAid: z.object({
    steps: z.array(z.string()).describe('A list of clear, step-by-step first aid recommendations.'),
    whenToSeeDoctor: z.string().describe('Guidance on when it is crucial to see a doctor for this condition.'),
  }),
  disclaimer: z.string().describe('A disclaimer that this is not a professional medical diagnosis.'),
});
export type DermatologyAnalysisOutput = z.infer<typeof DermatologyAnalysisOutputSchema>;

export async function analyzeSkinCondition(input: DermatologyAnalysisInput): Promise<DermatologyAnalysisOutput> {
  return dermatologyAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dermatologyAnalysisPrompt',
  input: {schema: DermatologyAnalysisInputSchema},
  output: {schema: DermatologyAnalysisOutputSchema},
  prompt: `You are an AI medical assistant specializing in dermatology. Analyze the following image of a skin condition.

Your tasks are:
1.  **Diagnosis**: Identify the type of skin condition, assess its potential severity, and provide a detailed analysis.
2.  **First Aid**: Provide clear, organized, step-by-step first aid recommendations.
3.  **Medical Advice**: Specify the conditions under which the user should see a doctor.
4.  **Disclaimer**: Conclude with a disclaimer that this is not a substitute for professional medical advice.

Image: {{media url=photoDataUri}}
  `,
});

const dermatologyAnalysisFlow = ai.defineFlow(
  {
    name: 'dermatologyAnalysisFlow',
    inputSchema: DermatologyAnalysisInputSchema,
    outputSchema: DermatologyAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
