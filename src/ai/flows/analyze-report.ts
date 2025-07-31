'use server';

/**
 * @fileOverview Medical report analysis AI agent.
 *
 * - analyzeReport - A function that handles the medical report analysis process.
 * - AnalyzeReportInput - The input type for the analyzeReport function.
 * - AnalyzeReportOutput - The return type for the analyzeReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeReportInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a medical report (X-ray, CT scan, blood report), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeReportInput = z.infer<typeof AnalyzeReportInputSchema>;

const AnalyzeReportOutputSchema = z.object({
  analysis: z.string().describe('A basic analysis of the medical report, identifying potential diseases or abnormalities.'),
  disclaimer: z.string().describe('A disclaimer that this is not a professional medical diagnosis.'),
});
export type AnalyzeReportOutput = z.infer<typeof AnalyzeReportOutputSchema>;

export async function analyzeReport(input: AnalyzeReportInput): Promise<AnalyzeReportOutput> {
  return analyzeReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeReportPrompt',
  input: {schema: AnalyzeReportInputSchema},
  output: {schema: AnalyzeReportOutputSchema},
  prompt: `You are a medical AI assistant. Analyze the following medical image (X-ray, CT-scan, or blood report). 
  
  Provide a basic analysis of what you see. Identify any potential diseases, abnormalities, or key markers.

  IMPORTANT: You are an AI assistant, not a doctor. Conclude your analysis with a clear disclaimer that this is not a substitute for professional medical advice and the user should consult a qualified healthcare professional.

  Image: {{media url=photoDataUri}}
  `,
});

const analyzeReportFlow = ai.defineFlow(
  {
    name: 'analyzeReportFlow',
    inputSchema: AnalyzeReportInputSchema,
    outputSchema: AnalyzeReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
