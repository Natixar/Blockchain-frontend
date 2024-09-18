'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';

// Define a generic prop type for the QR code data
/**
 * @interface ScannerProps<T>
 * @description Interface defining the props for the QRCodeScanner component.
 * @template T - The type of data that will be returned when a QR code is successfully scanned.
 * @property {function} onScanComplete - A callback function triggered when the QR code scanning is complete, passing the scanned data as an argument.
 */
interface ScannerProps<T> {
  onScanComplete: (data: T) => void;
}

/**
 * @function QRCodeScanner
 * @description A functional component that allows the user to scan QR codes using their device's camera. It uses the `jsQR` library to process the video stream and scan for QR codes.
 * @template T - The type of data that will be returned after scanning a QR code. Defaults to `string`.
 * @param {ScannerProps<T>} props - The component props containing the `onScanComplete` callback function.
 * @returns A JSX element with a button to start scanning and a video element to display the camera feed.
 */
export default function QRCodeScanner<T = string>({ onScanComplete }: ScannerProps<T>) {
  const videoRef = useRef<HTMLVideoElement>(null); // Reference for the video element displaying the camera feed
  const canvasRef = useRef<HTMLCanvasElement>(null); // Reference for the hidden canvas used to capture video frames
  const [isScanning, setIsScanning] = useState(false); // State to manage whether the scanning process is active

  /**
   * @function startVideo
   * @description Starts the video stream from the device's camera. If successful, the video stream will be displayed in the video element.
   */
  const startVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      // Request access to the camera using the environment-facing camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      video.srcObject = stream; // Assign the video stream to the video element
      await video.play(); // Start playing the video stream
    } catch (err) {
      console.error('Error starting video stream:', err);
    }
  }, []);

  /**
   * @function captureFrame
   * @description Captures a single video frame, processes it using the `jsQR` library to detect a QR code, and attempts to parse the QR code data.
   */
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    if (video.videoWidth <= 0 || video.videoHeight <= 0) {
      // If the video is not ready yet, continue requesting the next frame
      requestAnimationFrame(captureFrame);
      return;
    }

    try {
      // Set the canvas size to match the video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame onto the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Use jsQR to try and detect a QR code from the image data
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code?.data) {
        // If a QR code is detected, stop scanning and pass the data to the onScanComplete callback
        setIsScanning(false);
        try {
          const parsedData = JSON.parse(code.data); // Parse the QR code data (assumed to be JSON)
          onScanComplete(parsedData as T); // Pass the parsed data to the callback
        } catch (error) {
          console.error('Error parsing QR code data:', error);
        }
      } else {
        // If no QR code is detected, continue capturing frames
        requestAnimationFrame(captureFrame);
      }
    } catch (error) {
      console.error('Error capturing frame:', error);
      requestAnimationFrame(captureFrame);
    }
  }, [onScanComplete]);

  /**
   * @description Hook that starts the video stream and sets up the frame capture when scanning is enabled.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      captureFrame(); // Start capturing frames once the video starts playing
    };

    video.addEventListener('play', handlePlay);

    if (isScanning) {
      startVideo(); // Start the video stream if scanning is active
    }

    return () => {
      // Cleanup: Stop the video stream and remove event listeners when the component unmounts or scanning stops
      video.removeEventListener('play', handlePlay);
      if (video.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((track) => track.stop()); // Stop all tracks in the video stream
      }
    };
  }, [isScanning, startVideo, captureFrame]);

  return (
    <div className="relative mt-6 w-full max-w-md">
      {/* Button to start scanning */}
      <button
        type="button"
        className="block w-full px-4 py-2 mb-4 text-lg text-white bg-blue-500 rounded-md hover:bg-blue-600"
        onClick={() => setIsScanning(true)} // Start scanning when button is clicked
        aria-label="Scan QR Code"
      >
        Scan QR Code
      </button>
      {isScanning && (
        <div className="w-full">
          {/* Video element to display the camera feed */}
          <video ref={videoRef} className="w-full h-full" />
          {/* Hidden canvas used for capturing video frames */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}
