import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useWebRTC = (roomId, user, socket) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [screenStream, setScreenStream] = useState(null);
  const [whiteboardStream, setWhiteboardStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isWhiteboardSharing, setIsWhiteboardSharing] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  
  const peerConnectionsRef = useRef(new Map());
  const localStreamRef = useRef();
  const screenStreamRef = useRef();
  const audioContextRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const audioSourceRef = useRef(null);
  const gainNodeRef = useRef(null);
  const pcmBufferRef = useRef([]);
  const chunkIntervalRef = useRef(null);
  const nativeSampleRateRef = useRef(48000); // Default, will be updated
  const inCallRef = useRef(false);

  // Linear interpolation downsampling
  const downsampleBuffer = useCallback((buffer, inputSampleRate, outputSampleRate) => {
    if (inputSampleRate === outputSampleRate) {
      return buffer;
    }
    
    const ratio = inputSampleRate / outputSampleRate;
    const outputLength = Math.floor(buffer.length / ratio);
    const outputBuffer = new Float32Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
      const inputIndex = i * ratio;
      const indexFloor = Math.floor(inputIndex);
      const indexCeil = Math.min(indexFloor + 1, buffer.length - 1);
      const fraction = inputIndex - indexFloor;
      
      // Linear interpolation
      outputBuffer[i] = buffer[indexFloor] * (1 - fraction) + buffer[indexCeil] * fraction;
    }
    
    return outputBuffer;
  }, []);

  // Start backend audio recording for transcription using Web Audio API
  const startBackendAudioRecorder = useCallback((stream) => {
    if (!stream || !socket || !user?.id) {
      console.log('[useWebRTC] Cannot start backend audio recorder: missing stream, socket, or user');
      return;
    }

    try {
      // Extract only audio tracks from the stream
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.error('[useWebRTC] No audio tracks found in stream');
        return;
      }

      // Create a new MediaStream containing only audio tracks
      const audioOnlyStream = new MediaStream(audioTracks);
      console.log(`[useWebRTC] Created audio-only stream with ${audioTracks.length} track(s)`);

      // Create AudioContext with default sample rate (hardware rate)
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const nativeSampleRate = audioContext.sampleRate;
      nativeSampleRateRef.current = nativeSampleRate;
      console.log(`[useWebRTC] AudioContext created with sample rate: ${nativeSampleRate} Hz`);

      // Create media source from the audio-only stream
      const audioSource = audioContext.createMediaStreamSource(audioOnlyStream);
      audioSourceRef.current = audioSource;

      // Create ScriptProcessorNode for raw PCM capture
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      // Create GainNode with gain=0 to prevent echo/feedback
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0;
      gainNodeRef.current = gainNode;

      // Handle audio processing - capture at native sample rate
      scriptProcessor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        
        // Calculate max amplitude for debugging
        let maxAmp = 0;
        for (let i = 0; i < inputData.length; i++) {
          const abs = Math.abs(inputData[i]);
          if (abs > maxAmp) maxAmp = abs;
        }
        
        // Copy the Float32 samples to our buffer
        // We need to clone because the buffer gets reused
        pcmBufferRef.current.push(new Float32Array(inputData));
        
        // Log periodically to confirm processing is happening
        if (pcmBufferRef.current.length % 10 === 0) {
          console.log(`[useWebRTC] onaudioprocess fired, buffer has ${pcmBufferRef.current.length} chunks, max amplitude: ${maxAmp.toFixed(4)}`);
        }
      };

      // Connect the audio graph: source -> processor -> gainNode (gain=0) -> destination
      // This ensures the processor runs without producing audible output
      audioSource.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      console.log(`[useWebRTC] Audio graph connected: source -> processor -> gainNode(0) -> destination`);

      // Set up interval to send accumulated PCM data every 1 second
      chunkIntervalRef.current = setInterval(() => {
        console.log(`[useWebRTC] Interval tick - buffer has ${pcmBufferRef.current.length} chunks`);
        
        if (pcmBufferRef.current.length > 0 && socket) {
          // Concatenate all buffered chunks
          const totalLength = pcmBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
          const combinedFloat32 = new Float32Array(totalLength);
          
          let offset = 0;
          pcmBufferRef.current.forEach(chunk => {
            combinedFloat32.set(chunk, offset);
            offset += chunk.length;
          });
          
          // Clear the buffer
          pcmBufferRef.current = [];
          
          // Calculate max amplitude before downsampling
          let maxAmpBefore = 0;
          for (let i = 0; i < combinedFloat32.length; i++) {
            const abs = Math.abs(combinedFloat32[i]);
            if (abs > maxAmpBefore) maxAmpBefore = abs;
          }
          
          // Downsample from native rate to 16kHz
          const downsampled = downsampleBuffer(combinedFloat32, nativeSampleRate, 16000);
          
          // Convert Float32 to Int16 PCM
          const int16Data = new Int16Array(downsampled.length);
          let maxInt16 = 0;
          for (let i = 0; i < downsampled.length; i++) {
            // Convert -1.0 to 1.0 range to -32768 to 32767
            const sample = Math.max(-1, Math.min(1, downsampled[i]));
            int16Data[i] = Math.round(sample * 32767);
            const abs = Math.abs(int16Data[i]);
            if (abs > maxInt16) maxInt16 = abs;
          }
          
          console.log(`[useWebRTC] Audio conversion: max amplitude before=${maxAmpBefore.toFixed(4)}, after downsample=${downsampled.length} samples, max Int16=${maxInt16}`);
          
          // Send raw PCM Int16 data to backend
          socket.emit('audio-chunk', {
            roomId,
            userId: user.id,
            audioChunk: Array.from(int16Data),
            timestamp: Date.now()
          });
          
          console.log(`[useWebRTC] PCM chunk emitted: ${int16Data.length} samples (${(int16Data.length / 16000).toFixed(2)}s)`);
        } else if (pcmBufferRef.current.length === 0) {
          console.log('[useWebRTC] No PCM data in buffer to emit');
        } else if (!socket) {
          console.log('[useWebRTC] No socket connection available');
        }
      }, 1000);

      console.log('[useWebRTC] Web Audio API recording started for backend transcription');
      
      // Notify backend that audio stream started
      socket.emit('audio-stream:start', {
        roomId,
        userId: user.id
      });
      
    } catch (error) {
      console.error('[useWebRTC] Error starting backend audio recorder:', error);
    }
  }, [socket, roomId, user, downsampleBuffer]);

  // Stop backend audio recording
  const stopBackendAudioRecorder = useCallback(() => {
    try {
      console.log('[useWebRTC] Stopping Web Audio recording');

      // Clear the interval
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
        chunkIntervalRef.current = null;
      }

      // Send any remaining buffered data
      if (pcmBufferRef.current.length > 0 && socket && user?.id) {
        const totalLength = pcmBufferRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
        const combinedFloat32 = new Float32Array(totalLength);
        
        let offset = 0;
        pcmBufferRef.current.forEach(chunk => {
          combinedFloat32.set(chunk, offset);
          offset += chunk.length;
        });
        
        // Downsample from native rate to 16kHz
        const downsampled = downsampleBuffer(combinedFloat32, nativeSampleRateRef.current, 16000);
        
        const int16Data = new Int16Array(downsampled.length);
        for (let i = 0; i < downsampled.length; i++) {
          const sample = Math.max(-1, Math.min(1, downsampled[i]));
          int16Data[i] = Math.round(sample * 32767);
        }
        
        socket.emit('audio-chunk', {
          roomId,
          userId: user.id,
          audioChunk: Array.from(int16Data),
          timestamp: Date.now()
        });
        
        console.log(`[useWebRTC] Final PCM chunk emitted: ${int16Data.length} samples (${(int16Data.length / 16000).toFixed(2)}s)`);
        pcmBufferRef.current = [];
      }

      // Disconnect and clean up audio nodes
      if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
      }

      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }

      if (audioSourceRef.current) {
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      console.log('[useWebRTC] Web Audio recording stopped');
      
      // Notify backend
      if (socket && user?.id) {
        socket.emit('audio-stream:stop', {
          roomId,
          userId: user.id
        });
      }
    } catch (error) {
      console.error('[useWebRTC] Error stopping backend audio recorder:', error);
    }
  }, [socket, roomId, user, downsampleBuffer]);

  // Initialize media stream
  const initializeMedia = useCallback(async (type = 'video') => {
    try {
      console.log('Initializing media for:', type);
      const constraints = {
        audio: true,
        video: type === 'video' ? true : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Media stream obtained:', stream.id);
      
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Camera/microphone permission denied. Please allow permissions in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera/microphone found. Please check your devices.');
      } else if (error.name === 'NotReadableError') {
        toast.error('Camera/microphone is already in use by another application.');
      } else {
        toast.error('Failed to access camera/microphone: ' + error.message);
      }
      throw error;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((userId) => {
    console.log('Creating peer connection for user:', userId);
    
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);
    
    // Add local stream tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track.kind);
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    // Handle incoming remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.streams[0].id);
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, {
          stream: remoteStream,
          type: 'camera',
          userId,
          userName: `User ${userId}`
        });
        return newMap;
      });
    };

    // ICE candidate handling
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        console.log('Sending ICE candidate to:', userId);
        socket.emit('webrtc:ice-candidate', {
          candidate: event.candidate,
          targetUserId: userId,
          roomId
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(`Peer connection state for ${userId}:`, peerConnection.connectionState);
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${userId}:`, peerConnection.iceConnectionState);
    };

    peerConnectionsRef.current.set(userId, peerConnection);
    return peerConnection;
  }, [user, roomId, socket]);

  // Start call
  const startCall = useCallback(async (type) => {
    try {
      console.log('Starting call type:', type);
      setCallType(type);
      
      const stream = await initializeMedia(type);
      setInCall(true);
      
      // Start backend audio recording for transcription (separate from WebRTC)
      startBackendAudioRecorder(stream);
      
      // Notify others about the call
      if (socket) {
        socket.emit('call:start', { 
          roomId, 
          userId: user?.id, 
          callType: type 
        });
      }

      toast.success(`${type === 'video' ? 'Video' : 'Voice'} call started`);
    } catch (error) {
      console.error('Error starting call:', error);
      setInCall(false);
      setCallType(null);
    }
  }, [initializeMedia, roomId, user, socket, startBackendAudioRecorder]);

  // End call
  const endCall = useCallback(() => {
    console.log('Ending call');
    
    // Stop backend audio recording first
    stopBackendAudioRecorder();
    
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      screenStreamRef.current = null;
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc, userId) => {
      pc.close();
    });
    peerConnectionsRef.current.clear();
    
    setRemoteStreams(new Map());
    setInCall(false);
    setCallType(null);
    setIsScreenSharing(false);
    setIsWhiteboardSharing(false);
    setIncomingCall(null);

    // Notify others
    if (socket) {
      socket.emit('call:end', { roomId, userId: user?.id });
    }

    toast.success('Call ended');
  }, [roomId, user, socket, stopBackendAudioRecorder]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        console.log('Starting screen share');
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        setScreenStream(screenStream);
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);

        // Replace video track in all peer connections
        const videoTrack = screenStream.getVideoTracks()[0];
        peerConnectionsRef.current.forEach((peerConnection, userId) => {
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        // Handle screen share end
        videoTrack.onended = () => {
          console.log('Screen share ended by user');
          toggleScreenShare();
        };

        toast.success('Screen sharing started');

      } else {
        console.log('Stopping screen share');
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          setScreenStream(null);
          screenStreamRef.current = null;
        }
        
        setIsScreenSharing(false);
        
        // Restore camera track if available and in video call
        if (localStreamRef.current && callType === 'video') {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if (videoTrack) {
            peerConnectionsRef.current.forEach((peerConnection, userId) => {
              const sender = peerConnection.getSenders().find(s => 
                s.track && s.track.kind === 'video'
              );
              if (sender) {
                sender.replaceTrack(videoTrack);
              }
            });
          }
        }

        toast.success('Screen sharing stopped');
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      if (error.name !== 'NotAllowedError') {
        toast.error('Failed to toggle screen share');
      }
    }
  }, [isScreenSharing, callType]);

  // Toggle whiteboard share
  const toggleWhiteboardShare = useCallback(() => {
    if (!isWhiteboardSharing) {
      setIsWhiteboardSharing(true);
      toast.success('Whiteboard sharing started');
    } else {
      setIsWhiteboardSharing(false);
      toast.success('Whiteboard sharing stopped');
    }
  }, [isWhiteboardSharing]);

  // Media controls
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
      toast(isAudioMuted ? 'Microphone unmuted' : 'Microphone muted');
    }
  }, [isAudioMuted]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current && callType === 'video') {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
      toast(isVideoOff ? 'Camera turned on' : 'Camera turned off');
    }
  }, [isVideoOff, callType]);

  // Accept incoming call
  const acceptCall = useCallback(async (type) => {
    try {
      console.log('Accepting call type:', type);
      setCallType(type);
      const stream = await initializeMedia(type);
      setInCall(true);
      setIncomingCall(null);
      
      // Start backend audio recording for transcription
      startBackendAudioRecorder(stream);
      
      if (socket) {
        socket.emit('call:accept', { 
          roomId, 
          userId: user?.id,
          callType: type
        });
      }
      
      toast.success(`Joined ${type} call`);
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to join call');
    }
  }, [initializeMedia, roomId, user, socket, startBackendAudioRecorder]);

  // Decline incoming call
  const declineCall = useCallback(() => {
    console.log('Declining call');
    setIncomingCall(null);
    
    if (socket) {
      socket.emit('call:decline', { 
        roomId, 
        userId: user?.id 
      });
    }
    
    toast('Call declined');
  }, [roomId, user, socket]);

  // Handle incoming call
  const handleIncomingCall = useCallback((data) => {
    console.log('Incoming call:', data);
    setIncomingCall(data);
  }, []);

  // WebRTC signaling - Create and send offer
  const createAndSendOffer = useCallback(async (userId) => {
    try {
      const peerConnection = createPeerConnection(userId);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      if (socket) {
        socket.emit('webrtc:offer', {
          offer,
          targetUserId: userId,
          roomId
        });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [createPeerConnection, roomId, socket]);

  // Socket event handlers for WebRTC signaling
  useEffect(() => {
    if (!socket) return;

    console.log('Setting up WebRTC socket listeners');

    // Handle incoming call
    const handleIncomingCall = (data) => {
      console.log('Received incoming call:', data);
      setIncomingCall(data);
    };

    // Handle WebRTC offer
    const handleWebRTCOffer = async (data) => {
      console.log('Received WebRTC offer from:', data.from);
      const { offer, from } = data;
      
      const peerConnection = createPeerConnection(from);
      
      try {
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.emit('webrtc:answer', {
          answer,
          targetUserId: from,
          roomId
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    };

    // Handle WebRTC answer
    const handleWebRTCAnswer = async (data) => {
      console.log('Received WebRTC answer from:', data.from);
      const { answer, from } = data;
      const peerConnection = peerConnectionsRef.current.get(from);
      
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    };

    // Handle ICE candidate
    const handleICECandidate = async (data) => {
      console.log('Received ICE candidate from:', data.from);
      const { candidate, from } = data;
      const peerConnection = peerConnectionsRef.current.get(from);
      
      if (peerConnection && candidate) {
        await peerConnection.addIceCandidate(candidate);
      }
    };

    // Handle user joined - create offer for new user
    const handleUserJoined = (data) => {
      console.log('User joined, creating offer for:', data.userId);
      if (inCallRef.current && user?.id !== data.userId) {
        createAndSendOffer(data.userId);
      }
    };

    // Register event listeners
    socket.on('incoming-call', handleIncomingCall);
    socket.on('webrtc:offer', handleWebRTCOffer);
    socket.on('webrtc:answer', handleWebRTCAnswer);
    socket.on('webrtc:ice-candidate', handleICECandidate);
    socket.on('user-joined', handleUserJoined);

    return () => {
      console.log('Cleaning up WebRTC socket listeners');
      socket.off('incoming-call', handleIncomingCall);
      socket.off('webrtc:offer', handleWebRTCOffer);
      socket.off('webrtc:answer', handleWebRTCAnswer);
      socket.off('webrtc:ice-candidate', handleICECandidate);
      socket.off('user-joined', handleUserJoined);
    };
  }, [socket, roomId, user, createPeerConnection, createAndSendOffer]);

  // Sync inCall state to ref for stable access in socket handlers
  useEffect(() => {
    inCallRef.current = inCall;
  }, [inCall]);

  // Cleanup backend audio recorder on component unmount only
  useEffect(() => {
    return () => {
      console.log('[useWebRTC] Component unmounting, stopping audio recorder');
      if (audioContextRef.current || scriptProcessorRef.current) {
        stopBackendAudioRecorder();
      }
    };
  }, []);

  return {
    // State
    localStream,
    remoteStreams: Array.from(remoteStreams.values()),
    screenStream,
    whiteboardStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isWhiteboardSharing,
    inCall,
    callType,
    incomingCall,
    
    // Actions
    startCall,
    endCall,
    acceptCall,
    declineCall,
    toggleScreenShare,
    toggleWhiteboardShare,
    toggleAudio,
    toggleVideo,
    initializeMedia
  };
};