'use server';

/**
 * @fileOverview A tool for finding nearby hospitals.
 * 
 * - findHospitals - A function that finds nearby hospitals based on location.
 * - FindHospitalsInput - The input type for the findHospitals function.
 * - FindHospitalsOutput - The return type for the findHospitals function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FindHospitalsInputSchema = z.object({
  latitude: z.number().describe('The latitude of the user.'),
  longitude: z.number().describe('The longitude of the user.'),
});
export type FindHospitalsInput = z.infer<typeof FindHospitalsInputSchema>;

const HospitalSchema = z.object({
  name: z.string().describe('The name of the hospital.'),
  address: z.string().describe('The address of the hospital.'),
  phone: z.string().describe('The phone number of the hospital.'),
});

const FindHospitalsOutputSchema = z.object({
  hospitals: z.array(HospitalSchema).describe('A list of nearby hospitals.'),
});
export type FindHospitalsOutput = z.infer<typeof FindHospitalsOutputSchema>;


const findHospitalsTool = ai.defineTool(
    {
      name: 'findNearbyHospitals',
      description: 'Finds nearby hospitals based on the user\'s latitude and longitude.',
      inputSchema: FindHospitalsInputSchema,
      outputSchema: FindHospitalsOutputSchema,
    },
    async (input) => {
      // In a real application, you would use a service like Google Maps Platform APIs
      // to find real hospitals. For this demo, we will return some sample data.
      console.log(`Finding hospitals near: ${input.latitude}, ${input.longitude}`);
      return {
        hospitals: [
          { name: 'City General Hospital', address: '123 Main St, Anytown, USA', phone: '555-123-4567' },
          { name: 'Community Medical Center', address: '456 Oak Ave, Anytown, USA', phone: '555-987-6543' },
          { name: 'St. Mary\'s Hospital', address: '789 Pine Ln, Anytown, USA', phone: '555-555-1212' },
        ],
      };
    }
  );
  
const findHospitalsFlow = ai.defineFlow(
  {
    name: 'findHospitalsFlow',
    inputSchema: FindHospitalsInputSchema,
    outputSchema: FindHospitalsOutputSchema,
  },
  async (input) => {
    return await findHospitalsTool(input);
  }
);

export async function findHospitals(input: FindHospitalsInput): Promise<FindHospitalsOutput> {
    return findHospitalsFlow(input);
}
