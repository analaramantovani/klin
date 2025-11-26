import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ScanResult } from './types';
import { analyzeShoeImage } from './services/geminiService';
import { ScanOverlay } from './components/ScanOverlay';
import { ResultCard } from './components/ResultCard';
import { HistoryLog } from './components/HistoryLog';
import { Camera, Settings, Activity } from 'lucide-react';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'environment', // Use back camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError("Camera access denied or unavailable.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;

    setIsScanning(true);
    setLastResult(null); // Clear previous result to show processing state

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Reduce resolution for faster API upload/processing
      // Using a reasonable width like 800px maintains legibility while speeding up transfer
      const scale = 800 / video.videoWidth;
      const width = 800;
      const height = video.videoHeight * scale;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      // Draw current video frame
      ctx.drawImage(video, 0, 0, width, height);

      // Get Base64 JPEG (Quality 0.8 is good balance)
      const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

      // Send to Gemini Service
      const analysis = await analyzeShoeImage(base64Image);

      // Construct final object
      const fullResult: ScanResult = {
        timestamp: new Date().toISOString(),
        left: analysis.left!,
        right: analysis.right!,
        match: analysis.match!,
        processing_time_ms: analysis.processing_time_ms!,
        device: 'web-react-gemini',
        notes: analysis.notes || '',
        status: analysis.status || 'ERROR',
        image_id: '[base64_truncated]' // Don't store full base64 in history to save memory
      };

      setLastResult(fullResult);
      setHistory(prev => [fullResult, ...prev.slice(0, 4)]); // Keep last 5

    } catch (error) {
      console.error("Scan processing error:", error);
      // Fallback error result
      const errorResult: ScanResult = {
        timestamp: new Date().toISOString(),
        left: { roi: [], candidates: [], chosen: null, confidence: 0 },
        right: { roi: [], candidates: [], chosen: null, confidence: 0 },
        match: false,
        processing_time_ms: 0,
        device: 'web-react-gemini',
        notes: 'Erro de conexão ou timeout.',
        status: 'ERROR'
      };
      setLastResult(errorResult);
    } finally {
      setIsScanning(false);
    }
  }, [isScanning]);

  const resetScanner = () => {
    setLastResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-500" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">KLIN CHECKPOINT</h1>
            <p className="text-xs text-gray-500 tracking-widest">DUAL-SCAN PROTOTYPE</p>
          </div>
        </div>
        <div className="flex gap-2">
            <span className="bg-gray-800 text-xs px-2 py-1 rounded border border-gray-700 text-gray-400">v0.1.0-alpha</span>
            <Settings className="text-gray-600 w-5 h-5 cursor-pointer hover:text-white" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl flex flex-col gap-4">
        
        {/* Camera Viewport */}
        <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 aspect-[4/3] md:aspect-video">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-red-500 p-4 text-center">
              <p>{cameraError}</p>
            </div>
          ) : (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          )}
          
          <ScanOverlay />
          
          {/* Status Badge in corner */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-mono text-green-400 border border-green-500/30 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            LIVE
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action / Result Panel */}
        <ResultCard 
          result={lastResult} 
          isScanning={isScanning} 
          onScan={handleScan} 
          onReset={resetScanner} 
        />

        {/* Instructions (only shown when no result) */}
        {!lastResult && !isScanning && (
          <div className="text-center text-gray-500 text-sm mt-2">
            <p className="flex items-center justify-center gap-2">
              <Camera size={16} />
              Certifique-se que os números estão visíveis e limpos.
            </p>
          </div>
        )}

        {/* History & Logs */}
        <HistoryLog history={history} />
      </main>
      
      <footer className="mt-8 text-gray-600 text-xs text-center pb-4">
        KLIN Checkpoint System &bull; Powered by Google Gemini Flash &bull; React POC
      </footer>
    </div>
  );
};

export default App;
