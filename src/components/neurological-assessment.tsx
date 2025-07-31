'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, Loader2, UserCheck, AlertTriangle, Activity, VideoOff, Hospital, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { assessSymmetryAction, findHospitalsAction } from '@/app/actions'
import type { AssessSymmetryOutput } from '@/ai/flows/assess-symmetry'
import type { FindHospitalsOutput } from '@/ai/flows/find-hospitals'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function NeurologicalAssessment() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isFindingHospitals, setIsFindingHospitals] = useState(false)
  const [result, setResult] = useState<AssessSymmetryOutput | null>(null)
  const [hospitals, setHospitals] = useState<FindHospitalsOutput | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };
    
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }

    if (isCameraOn) {
        getCameraPermission();
    } else {
        stopCamera();
    }

    return () => {
      stopCamera();
    }
  }, [isCameraOn, toast]);

  const captureFrameAndAssess = useCallback(async () => {
    if (videoRef.current && canvasRef.current && isCameraOn) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        
        setIsLoading(true)
        setResult(null)
        setHospitals(null)
        try {
          const res = await assessSymmetryAction({ photoDataUri: dataUri })
          setResult(res)
        } catch (error) {
          toast({
            title: 'Assessment Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
            variant: 'destructive',
          })
        } finally {
          setIsLoading(false)
        }
      }
    } else {
        toast({
            title: isCameraOn ? 'Camera not ready' : 'Camera is off',
            description: isCameraOn ? 'Could not access camera feed for assessment.' : 'Please turn on the camera to perform an assessment.',
            variant: 'destructive',
        })
    }
  }, [toast, isCameraOn])
  
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
        <CardTitle className="text-2xl">Neurological Assessment</CardTitle>
        <CardDescription>Use your camera to perform a real-time neurological check by analyzing facial and upper body symmetry.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center gap-6">
        <div className="w-full max-w-lg aspect-video bg-muted rounded-lg overflow-hidden ring-1 ring-border relative flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline style={{ display: isCameraOn ? 'block' : 'none' }} />
            <canvas ref={canvasRef} className="hidden" />
            
            {!isCameraOn && <VideoOff className="w-20 h-20 text-muted-foreground" />}
            
            {isCameraOn && hasCameraPermission === false && (
                 <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/80">
                    <Alert variant="destructive">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access to use this feature. You may need to change permissions in your browser settings.
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {isCameraOn && hasCameraPermission === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center space-x-2">
                <Switch id="camera-switch" checked={isCameraOn} onCheckedChange={(checked) => {
                    setIsCameraOn(checked)
                    if(!checked) {
                        setResult(null)
                        setHospitals(null)
                    }
                }} />
                <Label htmlFor="camera-switch" className="text-base">{isCameraOn ? 'Camera On' : 'Camera Off'}</Label>
            </div>

            <Button onClick={captureFrameAndAssess} disabled={isLoading || !hasCameraPermission || !isCameraOn} size="lg">
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Assessing...
                    </>
                ) : (
                    <>
                    <UserCheck className="mr-2 h-5 w-5" />
                    Assess Symmetry
                    </>
                )}
            </Button>
        </div>
        
        {isLoading && !result && (
            <div className="mt-6 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">The AI is analyzing the camera feed...</p>
            </div>
        )}

        {result && (
          <div className="w-full mt-6 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <UserCheck className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">AI Assessment</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-base text-foreground/90">{result.assessment}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <Activity className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">Physiotherapy Guidance</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-base text-foreground/90">{result.physiotherapy}</p>
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
          <div className="mt-6 text-center w-full">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Finding nearby hospitals...</p>
          </div>
        )}

        {hospitals && (
           <div className="mt-8 space-y-4 w-full">
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
