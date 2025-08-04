export async function startCamera(): Promise<MediaStream> {
  try {
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw new Error('Unable to access camera. Please ensure camera permissions are granted.');
  }
}

export function stopCamera(stream: MediaStream): void {
  stream.getTracks().forEach(track => track.stop());
}

export function captureFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to get canvas context');
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  ctx.drawImage(video, 0, 0);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else throw new Error('Failed to capture image');
    }, 'image/jpeg', 0.8);
  });
}