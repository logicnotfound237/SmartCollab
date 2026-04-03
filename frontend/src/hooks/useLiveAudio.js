import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook for live audio streaming and real-time transcription
 * Separates transcription audio from WebRTC call audio
 * 
 * @param {string} roomId - Room identifier
 * @param {object} user - Current user object
 * @param {object} socket - Socket.IO instance
 */
export const useLiveAudio = (roomId, user, socket) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const chunkBufferRef = useRef([]);
  const chunkIntervalRef = useRef(null);
  const lastChunkTimeRef = useRef(0);

  const CHUNK_INTERVAL = 1500; // Send chunks every 1.5 seconds
  const SAMPLE_RATE = 16000;
  const BUFFER_SIZE = 4096;

  /**
   * Start live audio transcription
   * This is separate from WebRTC - captures audio only for transcription
   */
  const startTranscription = useCallback(async () => {
    try {
      if (!socket || !roomId || !user?.id) {
        console.error('Cannot start transcription: missing socket, roomId, or userId');
        return false;
      }

      console.log('Starting live transcription...');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000, // Browser typically provides 48kHz
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      streamRef.current = stream;

      // Create audio context for processing
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: SAMPLE_RATE // Target 16kHz for Whisper
      });

      // Create source from stream
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create script processor for raw audio access
      // Note: ScriptProcessorNode is deprecated but still widely supported
      // In production, consider using AudioWorklet
      processorRef.current = audioContextRef.current.createScriptProcessor(
        BUFFER_SIZE,
        1, // Input channels
        1  // Output channels
      );

      // Connect audio graph
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      // Handle audio processing
      processorRef.current.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        
        // Calculate audio level for UI visualization
        const sum = inputData.reduce((acc, val) => acc + Math.abs(val), 0);
        const average = sum / inputData.length;
        setAudioLevel(Math.min(average * 10, 1)); // Scale to 0-1

        // Resample from audio context sample rate to 16kHz
        const resampledData = resampleAudio(
          inputData,
          audioContextRef.current.sampleRate,
          SAMPLE_RATE
        );

        // Convert Float32 to Int16 PCM
        const pcmData = float32ToInt16(resampledData);
        
        // Add to chunk buffer
        chunkBufferRef.current.push(pcmData);
      };

      // Set up interval to send chunks
      chunkIntervalRef.current = setInterval(() => {
        if (chunkBufferRef.current.length > 0 && socket) {
          // Combine all buffered chunks
          const totalLength = chunkBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
          const combinedChunk = new Int16Array(totalLength);
          let offset = 0;
          
          chunkBufferRef.current.forEach(chunk => {
            combinedChunk.set(chunk, offset);
            offset += chunk.length;
          });
          
          // Clear buffer
          chunkBufferRef.current = [];
          
          // Send to server
          const chunkTime = Date.now();
          lastChunkTimeRef.current = chunkTime;
          
          socket.emit('audio-chunk', {
            roomId,
            userId: user.id,
            audioChunk: Array.from(combinedChunk), // Convert to array for JSON serialization
            timestamp: chunkTime
          });
          
          console.log(`Sent audio chunk: ${(combinedChunk.length / SAMPLE_RATE).toFixed(2)}s`);
        }
      }, CHUNK_INTERVAL);

      // Notify server that audio stream started
      socket.emit('audio-stream:start', {
        roomId,
        userId: user.id
      });

      setIsTranscribing(true);
      toast.success('Live transcription started');
      return true;

    } catch (error) {
      console.error('Error starting transcription:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone permission denied. Please allow access to use transcription.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please check your audio devices.');
      } else {
        toast.error('Failed to start transcription: ' + error.message);
      }
      
      return false;
    }
  }, [socket, roomId, user]);

  /**
   * Stop live audio transcription
   */
  const stopTranscription = useCallback(() => {
    try {
      console.log('Stopping live transcription...');

      // Clear interval
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
        chunkIntervalRef.current = null;
      }

      // Send any remaining audio
      if (chunkBufferRef.current.length > 0 && socket) {
        const totalLength = chunkBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
        const combinedChunk = new Int16Array(totalLength);
        let offset = 0;
        
        chunkBufferRef.current.forEach(chunk => {
          combinedChunk.set(chunk, offset);
          offset += chunk.length;
        });
        
        chunkBufferRef.current = [];
        
        socket.emit('audio-chunk', {
          roomId,
          userId: user.id,
          audioChunk: Array.from(combinedChunk),
          timestamp: Date.now()
        });
      }

      // Disconnect audio processor
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }

      // Stop audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Stop media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Notify server
      if (socket) {
        socket.emit('audio-stream:stop', {
          roomId,
          userId: user.id
        });
      }

      setIsTranscribing(false);
      setAudioLevel(0);
      toast.success('Live transcription stopped');

    } catch (error) {
      console.error('Error stopping transcription:', error);
    }
  }, [socket, roomId, user]);

  /**
   * Toggle transcription on/off
   */
  const toggleTranscription = useCallback(async () => {
    if (isTranscribing) {
      stopTranscription();
    } else {
      await startTranscription();
    }
  }, [isTranscribing, startTranscription, stopTranscription]);

  /**
   * Resample audio from source rate to target rate
   * Uses simple linear interpolation
   */
  const resampleAudio = (input, sourceRate, targetRate) => {
    if (sourceRate === targetRate) {
      return input;
    }

    const ratio = sourceRate / targetRate;
    const outputLength = Math.floor(input.length / ratio);
    const output = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const x = i * ratio;
      const x1 = Math.floor(x);
      const x2 = Math.min(x1 + 1, input.length - 1);
      const y1 = input[x1];
      const y2 = input[x2];
      output[i] = y1 + (y2 - y1) * (x - x1);
    }

    return output;
  };

  /**
   * Convert Float32Array to Int16Array (PCM 16-bit)
   */
  const float32ToInt16 = (float32Array) => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // Convert -1.0 to 1.0 range to -32768 to 32767 range
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = Math.round(sample * 32767);
    }
    return int16Array;
  };

  /**
   * Handle incoming transcript updates
   */
  useEffect(() => {
    if (!socket) return;

    const handleTranscriptUpdate = (data) => {
      console.log('Received transcript update:', data);
      
      setTranscripts(prev => {
        // Check if this is an update to an existing segment or new
        const existingIndex = prev.findIndex(
          t => t.userId === data.userId && 
               Math.abs(t.start - data.start) < 0.5
        );
        
        if (existingIndex >= 0) {
          // Update existing transcript
          const updated = [...prev];
          updated[existingIndex] = {
            ...data,
            receivedAt: Date.now()
          };
          return updated;
        } else {
          // Add new transcript
          return [...prev, {
            ...data,
            receivedAt: Date.now()
          }];
        }
      });
    };

    const handleStreamStarted = (data) => {
      console.log(`User ${data.userId} started audio streaming`);
    };

    const handleStreamStopped = (data) => {
      console.log(`User ${data.userId} stopped audio streaming`);
    };

    socket.on('transcript-update', handleTranscriptUpdate);
    socket.on('audio-stream:started', handleStreamStarted);
    socket.on('audio-stream:stopped', handleStreamStopped);

    return () => {
      socket.off('transcript-update', handleTranscriptUpdate);
      socket.off('audio-stream:started', handleStreamStarted);
      socket.off('audio-stream:stopped', handleStreamStopped);
    };
  }, [socket]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (isTranscribing) {
        stopTranscription();
      }
    };
  }, [isTranscribing, stopTranscription]);

  /**
   * Get transcript text formatted for display
   */
  const getFormattedTranscript = useCallback(() => {
    return transcripts
      .sort((a, b) => a.start - b.start)
      .map(t => `[${formatTime(t.start)}] ${t.userId}: ${t.text}`)
      .join('\n');
  }, [transcripts]);

  /**
   * Get recent transcripts (last N seconds)
   */
  const getRecentTranscripts = useCallback((seconds = 30) => {
    const cutoff = Date.now() - (seconds * 1000);
    return transcripts
      .filter(t => t.receivedAt >= cutoff)
      .sort((a, b) => a.start - b.start);
  }, [transcripts]);

  /**
   * Clear all transcripts
   */
  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
  }, []);

  return {
    // State
    isTranscribing,
    transcripts,
    audioLevel,
    
    // Actions
    startTranscription,
    stopTranscription,
    toggleTranscription,
    clearTranscripts,
    
    // Utilities
    getFormattedTranscript,
    getRecentTranscripts
  };
};

/**
 * Format seconds to MM:SS
 */
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default useLiveAudio;
