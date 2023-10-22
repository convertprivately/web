import { useEffect, useRef, useState } from 'react';
import '../public/pico.min.css'
import {humanizeSize, pngArrayBufferToBase64} from "../utils";
import { ImageWorkerManager } from '../lib/image/workerManager';

interface OriginalImage {
  file: File;
  arrayBuffer: ArrayBuffer;
  base64: string
  size: string
}

interface OptimizedImage {
  arrayBuffer: ArrayBuffer;
  base64: string
  size: string
}


const ImageOptimizer = () => {
  const [optimizationLevel, setOptimizationLevel] = useState(1);

  const [original, setOriginal] = useState<OriginalImage | null>(null);
  const [optimized, setOptimized] = useState<OptimizedImage | null>(null);

  const workerManagerRef = useRef<ImageWorkerManager>();

  useEffect(() => {
    if (!workerManagerRef.current) {
      workerManagerRef.current = new ImageWorkerManager();
    }
    
    return () => {
      workerManagerRef.current?.terminate();
    }
  }, []);

  useEffect(() => {
    if (workerManagerRef.current && original) {
      console.log("uploading png from client")
      workerManagerRef.current.uploadPng(original.arrayBuffer);
    }
  }, [workerManagerRef.current, original]);

  useEffect(() => {
    async function optimize_png(
      optimizationLevel: number
    ) {
      try {
        console.log("Requesting new optimization level", optimizationLevel)
        const optimizedArrayBuffer = await workerManagerRef.current?.optimizePng(optimizationLevel);
        setOptimized({
          arrayBuffer: optimizedArrayBuffer!,
          base64: pngArrayBufferToBase64(optimizedArrayBuffer!),
          size: humanizeSize(optimizedArrayBuffer!.byteLength),
        });
      } catch (err) {
        console.error("optimize_png useEffect", err);
      }
    }

    if (workerManagerRef.current && original) {
      optimize_png(optimizationLevel);
    }
  }, [workerManagerRef.current, original, optimizationLevel]);

  useEffect(() => {
    setOptimized(null);
  }, [optimizationLevel]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      throw new Error("No file selected");
    };
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginal({
        file,
        arrayBuffer: reader.result as ArrayBuffer,
        base64: pngArrayBufferToBase64(reader.result as ArrayBuffer),
        size: humanizeSize(file.size),
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptimizationLevel(Number(e.target.value));
  };

  const handleDownload = () => {
    // Implement your download logic here
  };

  let optimizedImg = null;
  if (original && optimized) {
    optimizedImg = <div>
      <img src={optimized.base64} alt="Optimized" />
      Size: {optimized.size}
    </div>
  } else if (original && !optimized) {
    optimizedImg = <img alt="Optimized" aria-busy="true" />
  } else {
    optimizedImg = null;
  }

  return (
    <div>
      <div style={{ display: "flex" }}>
        <div>
          <input type="file" onChange={handleImageUpload} />
          {original && (
            <div>
              <img src={original.base64} alt="Original" />
              Size: {original.size}
            </div>
          )}
        </div>
        <div>
          {optimizedImg}
        </div>
      </div>
      <div>
        <input
          type="range"
          min="0"
          max="6"
          value={optimizationLevel}
          onChange={handleSliderChange}
        />
      </div>
      <div>
        <button onClick={handleDownload} disabled={!optimized}>
          Download Optimized Image
        </button>
      </div>
    </div>
  );
};

export default ImageOptimizer;
