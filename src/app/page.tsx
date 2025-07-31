import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReportAnalyzer from "@/components/report-analyzer"
import NeurologicalAssessment from "@/components/neurological-assessment"
import DermatologyAnalysis from "@/components/dermatology-analysis"
import { Bot } from "lucide-react"
import { ModeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl flex justify-between items-center pt-8 mb-8">
        <div className="flex-1"></div>
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-3 mb-2">
            <Bot className="w-10 h-10 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Synapse
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl text-center">
            An AI-powered companion for medical diagnostics.
          </p>
        </div>
        <div className="flex-1 flex justify-end">
          <ModeToggle />
        </div>
      </header>
      <main className="w-full max-w-4xl flex-1">
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted rounded-lg">
            <TabsTrigger value="report">Report Analysis</TabsTrigger>
            <TabsTrigger value="assessment">Neurological Assessment</TabsTrigger>
            <TabsTrigger value="dermatology">Dermatology Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="report" className="mt-6">
            <ReportAnalyzer />
          </TabsContent>
          <TabsContent value="assessment" className="mt-6">
            <NeurologicalAssessment />
          </TabsContent>
          <TabsContent value="dermatology" className="mt-6">
            <DermatologyAnalysis />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
