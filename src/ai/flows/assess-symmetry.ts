'use server';

/**
 * @fileOverview Neurological assessment AI agent.
 *
 * - assessSymmetry - A function that handles the neurological assessment process.
 * - AssessSymmetryInput - The input type for the assessSymmetry function.
 * - AssessSymmetryOutput - The return type for the assessSymmetry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessSymmetryInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person's face and upper body, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AssessSymmetryInput = z.infer<typeof AssessSymmetryInputSchema>;

const AssessSymmetryOutputSchema = z.object({
  assessment: z.string().describe('An assessment of facial and body symmetry, noting any potential signs of a neurological issue like a stroke.'),
  physiotherapy: z.string().describe('Physiotherapy exercises and guidance based on the assessment.'),
  disclaimer: z.string().describe('A disclaimer that this is not a professional medical diagnosis.'),
});
export type AssessSymmetryOutput = z.infer<typeof AssessSymmetryOutputSchema>;

export async function assessSymmetry(input: AssessSymmetryInput): Promise<AssessSymmetryOutput> {
  return assessSymmetryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessSymmetryPrompt',
  input: {schema: AssessSymmetryInputSchema},
  output: {schema: AssessSymmetryOutputSchema},
  prompt: `You are a medical AI assistant. Analyze the following image of a person to assess their facial and upper body symmetry for a basic neurological assessment.

Look for signs of asymmetry such as one side of the face drooping, an uneven smile, or one arm drifting downwards. Based on these observations, provide an assessment of whether there are potential signs of a neurological event like a stroke.

If signs are detected, provide some basic physiotherapy exercises that could help with rehabilitation (e.g., facial exercises, arm lifts).

IMPORTANT: You are an AI assistant, not a doctor. Conclude your assessment with a clear disclaimer that this is a preliminary check and not a substitute for professional medical advice. Advise the user to seek immediate medical attention if they suspect a stroke.

Image: {{media url=photoDataUri}}
`,
});

const assessSymmetryFlow = ai.defineFlow(
  {
    name: 'assessSymmetryFlow',
    inputSchema: AssessSymmetryInputSchema,
    outputSchema: AssessSymmetryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
