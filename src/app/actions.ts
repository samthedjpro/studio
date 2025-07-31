'use server';

import { analyzeReport, type AnalyzeReportInput, type AnalyzeReportOutput } from '@/ai/flows/analyze-report';
import { assessSymmetry, type AssessSymmetryInput, type AssessSymmetryOutput } from '@/ai/flows/assess-symmetry';
import { analyzeSkinCondition, type DermatologyAnalysisInput, type DermatologyAnalysisOutput } from '@/ai/flows/dermatology-analysis';
import { findHospitals, type FindHospitalsInput, type FindHospitalsOutput } from '@/ai/flows/find-hospitals';

export async function analyzeReportAction(input: AnalyzeReportInput): Promise<AnalyzeReportOutput> {
    try {
        const result = await analyzeReport(input);
        return result;
    } catch (error) {
        console.error("Error in analyzeReportAction:", error);
        throw new Error("Failed to analyze report. Please try again.");
    }
}

export async function assessSymmetryAction(input: AssessSymmetryInput): Promise<AssessSymmetryOutput> {
    try {
        const result = await assessSymmetry(input);
        return result;
    } catch (error) {
        console.error("Error in assessSymmetryAction:", error);
        throw new Error("Failed to assess symmetry. Please try again.");
    }
}

export async function analyzeSkinConditionAction(input: DermatologyAnalysisInput): Promise<DermatologyAnalysisOutput> {
    try {
        const result = await analyzeSkinCondition(input);
        return result;
    } catch (error) {
        console.error("Error in analyzeSkinConditionAction:", error);
        throw new Error("Failed to analyze skin condition. Please try again.");
    }
}

export async function findHospitalsAction(input: FindHospitalsInput): Promise<FindHospitalsOutput> {
    try {
        const result = await findHospitals(input);
        return result;
    } catch (error) {
        console.error("Error in findHospitalsAction:", error);
        throw new Error("Failed to find hospitals. Please try again.");
    }
}
