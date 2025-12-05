import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RefreshCcw, CheckCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
            facingMode: 'environment',
            // Ask for an ideal resolution that isn't too huge, helping performance
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      // More specific error messages for mobile troubleshooting
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
          setError("Permiso denegado. Por favor habilita la cámara en la configuración de tu navegador.");
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
          setError("No se encontró una cámara disponible.");
      } else {
          setError("No se pudo acceder a la cámara. Intenta usar la opción 'Subir Imagen' que permite tomar fotos nativas.");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video stream size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get base64 string at reasonable quality
        // Note: ProjectDetail will compress this further if needed
        const imageDate = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageDate);
        stopCamera();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={() => { stopCamera(); onClose(); }}
          className="bg-gray-800/50 p-2 rounded-full text-white hover:bg-gray-700 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error ? (
        <div className="text-white text-center p-6 max-w-sm">
          <p className="mb-4 text-red-400">{error}</p>
          <div className="flex flex-col gap-3">
              <button 
                onClick={startCamera}
                className="flex items-center justify-center gap-2 mx-auto bg-indigo-600 px-4 py-2 rounded-lg w-full"
              >
                <RefreshCcw className="w-4 h-4" /> Reintentar
              </button>
              <button
                 onClick={onClose}
                 className="text-gray-400 hover:text-white text-sm"
              >
                  Cancelar y usar opción "Subir"
              </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full flex flex-col bg-black">
           <video 
            ref={videoRef}
            autoPlay 
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-10 left-0 right-0 flex justify-center pb-safe">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
              aria-label="Tomar foto"
            >
              <div className="w-16 h-16 bg-white rounded-full border-2 border-black" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};