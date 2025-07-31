'use client'

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import Image from 'next/image'
import { UploadCloud, Loader2, FileText, AlertTriangle, PlusCircle, CheckCircle2, Hospital, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { analyzeSkinConditionAction, findHospitalsAction } from '@/app/actions'
import type { DermatologyAnalysisOutput } from '@/ai/flows/dermatology-analysis'
import type { FindHospitalsOutput } from '@/ai/flows/find-hospitals'
import { cn } from '@/lib/utils'

export default function DermatologyAnalysis() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageDataUri, setImageDataUri] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFindingHospitals, setIsFindingHospitals] = useState(false)
  const [result, setResult] = useState<DermatologyAnalysisOutput | null>(null)
  const [hospitals, setHospitals] = useState<FindHospitalsOutput | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUri = e.target?.result as string
        setImagePreview(URL.createObjectURL(file))
        setImageDataUri(dataUri)
        setResult(null)
        setHospitals(null)
      }
      reader.readAsDataURL(file)
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file.',
        variant: 'destructive',
      })
    }
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileChange(e.target.files[0])
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }

  const handleAnalyze = async () => {
    if (!imageDataUri) {
      toast({
        title: 'No Image',
        description: 'Please select an image to analyze.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    setResult(null)
    setHospitals(null)
    try {
      const res = await analyzeSkinConditionAction({ photoDataUri: imageDataUri })
      setResult(res)
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFindHospitals = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }

    setIsFindingHospitals(true);
    setHospitals(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await findHospitalsAction({ latitude, longitude });
          setHospitals(res);
        } catch (error) {
          toast({
            title: 'Could Not Find Hospitals',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
            variant: 'destructive',
          });
        } finally {
          setIsFindingHospitals(false);
        }
      },
      (error) => {
        toast({
          title: 'Geolocation Failed',
          description: error.message || 'Could not get your location.',
          variant: 'destructive',
        });
        setIsFindingHospitals(false);
      }
    );
  };


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Dermatology Analysis</CardTitle>
        <CardDescription>Upload an image of a skin condition (e.g., skin lesion, rash, bedsore, burn) for an AI-powered analysis and first-aid advice.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200',
            isDragging ? 'border-primary bg-accent/20' : 'border-border hover:border-primary/80'
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            className="hidden"
            accept="image/*"
          />
          <div className="flex flex-col items-center gap-4">
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isDragging ? 'Drop the image here' : 'Drag & drop a skin condition image, or click to select'}
            </p>
          </div>
        </div>

        {imagePreview && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="relative w-full max-w-md h-72 rounded-lg overflow-hidden ring-1 ring-border">
              <Image
                src={imagePreview}
                alt="Skin condition preview"
                fill
                style={{ objectFit: 'contain' }}
                className="transition-opacity duration-300"
              />
            </div>
            <Button onClick={handleAnalyze} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Skin Condition'
              )}
            </Button>
          </div>
        )}

        {isLoading && !result && (
            <div className="mt-6 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">The AI is analyzing the image...</p>
            </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center gap-3"><FileText className="w-6 h-6 text-primary" />AI Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <p className="text-base"><strong>Condition:</strong> <span className="font-medium">{result.diagnosis.condition}</span></p>
                <p className="text-base"><strong>Severity:</strong> <span className="font-medium">{result.diagnosis.severity}</span></p>
                <p className="text-base text-foreground/90 pt-2">{result.diagnosis.details}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center gap-3"><PlusCircle className="w-6 h-6 text-primary" />First-Aid Steps</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {result.firstAid.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-base">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center gap-3"><AlertTriangle className="w-6 h-6 text-amber-500" />When to See a Doctor</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-base text-foreground/90">{result.firstAid.whenToSeeDoctor}</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                 <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                <CardTitle className="text-2xl text-amber-700 dark:text-amber-500">Disclaimer</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-base text-amber-800 dark:text-amber-400">{result.disclaimer}</p>
              </CardContent>
            </Card>
            <div className="text-center pt-2">
                <Button onClick={handleFindHospitals} disabled={isFindingHospitals} size="lg">
                    {isFindingHospitals ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Finding Hospitals...
                        </>
                    ) : (
                        <>
                            <Hospital className="mr-2 h-5 w-5" />
                            Find Nearby Hospitals
                        </>
                    )}
                </Button>
            </div>
          </div>
        )}
        
        {isFindingHospitals && !hospitals && (
          <div className="mt-6 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Finding nearby hospitals...</p>
          </div>
        )}

        {hospitals && (
           <div className="mt-8 space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl flex items-center gap-3"><Hospital className="w-6 h-6 text-primary" />Nearby Hospitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hospitals.hospitals.map((hospital, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg border">
                    <h3 className="font-semibold text-lg">{hospital.name}</h3>
                    <p className="flex items-center gap-2 text-base text-foreground/80 mt-1"><MapPin className="w-4 h-4 text-muted-foreground" /> {hospital.address}</p>
                    <p className="flex items-center gap-2 text-base text-foreground/80 mt-1"><Phone className="w-4 h-4 text-muted-foreground" /> {hospital.phone}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
           </div>
        )}
      </CardContent>
    </Card>
  )
}
