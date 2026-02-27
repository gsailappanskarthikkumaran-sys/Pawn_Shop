import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, CameraOff } from 'lucide-react';
import './CameraModal.css';

const CameraModal = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);
    const [isStarting, setIsStarting] = useState(true);
    const [facingMode, setFacingMode] = useState('user');

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, [facingMode]);

    const startCamera = async () => {
        setIsStarting(true);
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsStarting(false);
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Could not access camera. Please check permissions.");
            setIsStarting(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const toggleCamera = () => {
        stopCamera();
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');

            // Only mirror the capture if we are in 'user' (selfie) mode to match the preview
            if (facingMode === 'user') {
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            setCapturedImage(imageData);
            stopCamera();
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const handleSave = () => {
        if (capturedImage) {
            fetch(capturedImage)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file, capturedImage);
                    onClose();
                });
        }
    };

    return (
        <div className="camera-modal-overlay">
            <div className="camera-modal-content">
                <div className="camera-modal-header">
                    <h3>Take Live Photo</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="camera-view-container">
                    {!capturedImage ? (
                        <div className="video-wrapper">
                            {isStarting && <div className="camera-status">Initializing Camera...</div>}
                            {error ? (
                                <div className="camera-status error">
                                    <CameraOff size={48} />
                                    <p>{error}</p>
                                    <button className="btn-retry" onClick={startCamera}>Try Again</button>
                                </div>
                            ) : (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className={`camera-video ${facingMode === 'user' ? 'mirrored' : ''}`}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="preview-wrapper">
                            <img src={capturedImage} alt="Captured" className="camera-preview" />
                        </div>
                    )}
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div className="camera-modal-footer">
                    {!capturedImage ? (
                        <div className="action-buttons">
                            <button
                                className="btn-switch"
                                onClick={toggleCamera}
                                disabled={isStarting}
                                title="Switch Camera"
                            >
                                <RefreshCw size={20} />
                            </button>
                            <button
                                className="btn-capture"
                                onClick={handleCapture}
                                disabled={!stream || isStarting}
                            >
                                <Camera size={20} /> Capture
                            </button>
                        </div>
                    ) : (
                        <div className="action-buttons">
                            <button className="btn-retake" onClick={handleRetake}>
                                <RefreshCw size={18} /> Retake
                            </button>
                            <button className="btn-save" onClick={handleSave}>
                                <Check size={18} /> Save Photo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraModal;
