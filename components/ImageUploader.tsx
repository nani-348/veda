import React, { useRef, useState, useEffect } from 'react';
import { Upload, Camera, Image as ImageIcon, X, ScanLine, Loader2, AlertCircle } from 'lucide-react';
import { SUPPORTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '../constants';

interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Attach stream to video element
  useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Error playing video stream:", e));
    }
  }, [isCameraOpen, stream]);

  const processFile = (file: File) => {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      alert("Please upload a valid image (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      alert(`Image size should be less than ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        onImageSelect(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const startCamera = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Check for HTTPS/Secure Context
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera access requires a secure connection (HTTPS) or localhost.");
      setIsCameraOpen(true);
      return;
    }

    setCameraError(null);
    setIsCameraOpen(true);

    try {
      // First try with ideal constraints
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
        setStream(mediaStream);
      } catch (err) {
        console.warn("Ideal camera constraints failed, falling back to basic config.", err);
        // Fallback to basic constraints if specific ones fail
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
        setStream(mediaStream);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      let msg = "Unable to access camera.";
      
      const errorName = err.name || '';
      const errorMessage = (err.message || '').toLowerCase();

      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        msg = "Camera permission was denied. Please allow camera access in your browser settings.";
      } else if (errorName === 'NotFoundError') {
        msg = "No camera device found.";
      } else if (errorName === 'NotReadableError') {
        msg = "Camera is currently in use by another application.";
      } else if (errorMessage.includes('dismissed') || errorName === 'PermissionDismissedError') {
        msg = "Permission request was dismissed. Please tap 'Try Again' and allow access.";
      } else if (errorMessage.includes('device not found')) {
         msg = "Camera device not found.";
      }
      
      setCameraError(msg);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      setIsFlashing(true);
      
      setTimeout(() => {
        if (!videoRef.current) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          stopCamera();
          onImageSelect(dataUrl);
        }
        setIsFlashing(false);
      }, 150);
    }
  };

  if (isCameraOpen) {
    return (
      <div className="relative bg-black rounded-2xl overflow-hidden aspect-[3/4] md:aspect-video flex flex-col items-center justify-center shadow-2xl animate-in fade-in duration-300">
        {/* Flash Effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300 pointer-events-none" />
        )}

        {/* Loading Indicator */}
        {!stream && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white space-y-4">
             <Loader2 className="w-8 h-8 animate-spin text-ayur-400" />
             <p className="text-sm font-medium tracking-wide">Starting Camera...</p>
          </div>
        )}

        {cameraError ? (
           <div className="text-white p-8 text-center max-w-md z-30 animate-in zoom-in-95 duration-200">
             <div className="bg-red-500/20 p-4 rounded-full inline-block mb-4">
                <AlertCircle className="h-10 w-10 text-red-400" />
             </div>
             <h3 className="text-xl font-bold mb-2">Camera Error</h3>
             <p className="mb-8 text-stone-300 leading-relaxed">{cameraError}</p>
             <div className="flex flex-col gap-3">
               <button 
                  onClick={(e) => startCamera(e as any)} 
                  className="px-8 py-3 bg-ayur-600 text-white rounded-full font-bold hover:bg-ayur-700 transition-colors"
               >
                  Try Again
               </button>
               <button 
                  onClick={stopCamera} 
                  className="px-8 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-colors backdrop-blur-sm"
               >
                  Cancel
               </button>
             </div>
           </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
            
            {stream && (
              <>
                {/* Viewfinder Overlays */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40"></div>
                  
                  {/* Guides */}
                  <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-white/70 rounded-tl-xl"></div>
                  <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-white/70 rounded-tr-xl"></div>
                  <div className="absolute bottom-24 left-8 w-16 h-16 border-l-4 border-b-4 border-white/70 rounded-bl-xl"></div>
                  <div className="absolute bottom-24 right-8 w-16 h-16 border-r-4 border-b-4 border-white/70 rounded-br-xl"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <ScanLine className="w-48 h-48 text-white" strokeWidth={0.5} />
                  </div>
                </div>

                {/* Controls */}
                <button 
                  onClick={stopCamera}
                  className="absolute top-6 right-6 p-3 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all backdrop-blur-md z-30"
                  aria-label="Close Camera"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center z-30">
                  <button 
                    onClick={capturePhoto}
                    className="group relative h-20 w-20 rounded-full flex items-center justify-center transition-all"
                    aria-label="Take Photo"
                  >
                     <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-full scale-100 group-hover:scale-110 transition-transform duration-300"></div>
                     <div className="relative h-16 w-16 bg-white rounded-full border-4 border-transparent ring-2 ring-black/10 group-active:scale-95 transition-transform flex items-center justify-center shadow-xl">
                        <div className="h-14 w-14 rounded-full border-2 border-stone-300 group-hover:border-ayur-500 transition-colors"></div>
                     </div>
                  </button>
                </div>
                
                <div className="absolute bottom-12 text-white/80 text-sm font-medium tracking-wider z-20 pointer-events-none">
                    ALIGN PLANT IN FRAME
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-14 transition-all duration-300 ease-out text-center cursor-pointer overflow-hidden group
        ${dragActive 
          ? 'border-ayur-500 bg-ayur-50/50 scale-[1.01]' 
          : 'border-stone-300 hover:border-ayur-400 hover:bg-white bg-stone-50/50'
        }
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={SUPPORTED_IMAGE_TYPES.join(',')}
        onChange={handleChange}
      />

      <div className="relative z-10 flex flex-col items-center pointer-events-none">
        <div className={`
          h-20 w-20 rounded-2xl shadow-lg flex items-center justify-center mb-6 
          transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110
          ${dragActive ? 'bg-ayur-100 text-ayur-600' : 'bg-white text-ayur-600'}
        `}>
          <Upload className="h-10 w-10" strokeWidth={1.5} />
        </div>
        
        <h3 className="text-xl font-bold text-stone-800 mb-2">
          Add Plant Photo
        </h3>
        <p className="text-stone-400 mb-8 text-sm">
          Drag & Drop or select below
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pointer-events-auto">
            <button 
                type="button"
                onClick={startCamera}
                className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-ayur-600 text-white rounded-xl font-semibold shadow-lg shadow-ayur-200 hover:bg-ayur-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
                <Camera className="w-5 h-5 mr-2" /> 
                Open Camera
            </button>
            
            <button 
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-white border border-stone-200 text-stone-700 rounded-xl font-semibold shadow-sm hover:bg-stone-50 hover:border-stone-300 transition-all duration-200"
            >
                <ImageIcon className="w-5 h-5 mr-2" /> 
                Gallery
            </button>
        </div>
      </div>
      
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
             backgroundSize: '24px 24px'
           }}>
      </div>
    </div>
  );
};