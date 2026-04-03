import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Phone, Mic, MicOff, VideoOff, ScreenShare, Square, Users, MessageCircle, Share2 } from 'lucide-react';

const CallModal = ({ 
  isOpen, 
  onClose, 
  localStream, 
  remoteStreams, 
  screenStream,
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  isWhiteboardSharing,
  callType,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleWhiteboardShare,
  onEndCall,
  participants = [],
  inCall = false,
  incomingCall = null,
  onAcceptCall = () => {},
  onDeclineCall = () => {}
}) => {
  if (!isOpen) return null;

  // Incoming Call UI (when call is not active but there's an incoming call)
  if (!inCall && incomingCall) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                {incomingCall.callType === 'video' ? (
                  <Video className="h-10 w-10 text-white" />
                ) : (
                  <Phone className="h-10 w-10 text-white" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {incomingCall.userId} is calling you
              </p>

              <div className="flex space-x-4 justify-center">
                {/* Decline Button - RED */}
                <button
                  onClick={onDeclineCall}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                >
                  <X className="h-5 w-5" />
                  <span>Decline</span>
                </button>
                
                {/* Accept Button - GREEN */}
                <button
                  onClick={onAcceptCall}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                >
                  <Phone className="h-5 w-5" />
                  <span>Accept</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Active Call UI
  const allStreams = [
    ...remoteStreams,
    ...(localStream ? [{
      stream: localStream,
      isLocal: true,
      type: 'camera',
      name: 'You'
    }] : []),
    ...(screenStream ? [{
      stream: screenStream,
      isLocal: true,
      type: 'screen',
      name: 'Your Screen'
    }] : [])
  ];

  const calculateGridClass = (count) => {
    if (count === 1) return 'grid-cols-1 grid-rows-1';
    if (count === 2) return 'grid-cols-2 grid-rows-1';
    if (count <= 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 6) return 'grid-cols-3 grid-rows-2';
    return 'grid-cols-4 grid-rows-3';
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col border border-gray-700"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${callType === 'video' ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`} />
              <h2 className="text-xl font-semibold text-white">
                {callType === 'video' ? 'Video Call' : 'Voice Call'} - {participants.length + 1} participants
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Video Grid */}
          <div className="flex-1 p-6 overflow-hidden bg-gray-900">
            {callType === 'video' ? (
              <div className={`h-full grid ${calculateGridClass(allStreams.length)} gap-4`}>
                {allStreams.map((streamData, index) => (
                  <div key={index} className="relative bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-700">
                    <video
                      ref={el => {
                        if (el && streamData.stream) {
                          el.srcObject = streamData.stream;
                        }
                      }}
                      autoPlay
                      muted={streamData.isLocal}
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">
                          {streamData.name}
                          {streamData.isLocal && ' (You)'}
                          {streamData.type === 'screen' && ' - Screen'}
                        </span>
                        <div className="flex items-center space-x-1">
                          {streamData.isLocal && isAudioMuted && (
                            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded border border-red-700">Muted</span>
                          )}
                          {streamData.isLocal && isVideoOff && (
                            <span className="text-xs bg-red-600 text-white px-2 py-1 rounded border border-red-700">Video Off</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Screen share indicator */}
                    {streamData.type === 'screen' && (
                      <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium border border-blue-500">
                        Screen Sharing
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Voice call UI - FIXED: Render participant names properly
              <div className="h-full flex items-center justify-center bg-gray-800 rounded-xl">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-blue-400">
                    <Phone className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Voice Call Active</h3>
                  <p className="text-gray-300 mb-6">{participants.length} participants in call</p>
                  
                  {/* Participants list - FIXED: Extract name from participant object */}
                  <div className="mt-6 max-w-md mx-auto">
                    <div className="flex items-center justify-center space-x-2 text-gray-400 mb-3">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Participants</span>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <div className="text-white text-sm mb-2 font-medium bg-gray-600 rounded px-3 py-2">You (Host)</div>
                      {participants.map((participant, index) => (
                        <div 
                          key={participant?.id || index} // FIXED: Use participant ID or index
                          className="text-gray-300 text-sm py-2 border-b border-gray-600 last:border-b-0"
                        >
                          {participant?.name || participant?.userId || `Participant ${index + 1}`} {/* FIXED: Extract name */}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-6 border-t border-gray-700 bg-gray-900 rounded-b-2xl">
            <div className="flex items-center justify-center space-x-4">
              {/* Audio Toggle */}
              <button
                onClick={onToggleAudio}
                className={`p-4 rounded-full transition-all duration-200 shadow-lg ${
                  isAudioMuted 
                    ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                }`}
                title={isAudioMuted ? 'Unmute' : 'Mute'}
              >
                {isAudioMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>

              {/* Video Toggle (only in video calls) */}
              {callType === 'video' && (
                <button
                  onClick={onToggleVideo}
                  className={`p-4 rounded-full transition-all duration-200 shadow-lg ${
                    isVideoOff 
                      ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                  }`}
                  title={isVideoOff ? 'Turn on video' : 'Turn off video'}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </button>
              )}

              {/* Screen Share */}
              <button
                onClick={onToggleScreenShare}
                className={`p-4 rounded-full transition-all duration-200 shadow-lg ${
                  isScreenSharing 
                    ? 'bg-green-600 hover:bg-green-700 text-white border border-green-500' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                }`}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
              >
                {isScreenSharing ? <Square className="h-6 w-6" /> : <ScreenShare className="h-6 w-6" />}
              </button>

              {/* Whiteboard Share */}
              <button
                onClick={onToggleWhiteboardShare}
                className={`p-4 rounded-full transition-all duration-200 shadow-lg ${
                  isWhiteboardSharing 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-500' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                }`}
                title={isWhiteboardSharing ? 'Stop whiteboard' : 'Share whiteboard'}
              >
                <Share2 className="h-6 w-6" />
              </button>

              {/* End Call - RED Button */}
              <button
                onClick={onEndCall}
                className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 shadow-lg border border-red-500 transform hover:scale-105"
                title="End call"
              >
                <Phone className="h-6 w-6 rotate-135" />
              </button>
            </div>

            {/* Additional controls */}
            <div className="flex items-center justify-center space-x-4 mt-4">
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 border border-gray-600 text-sm font-medium">
                <MessageCircle className="h-4 w-4 inline mr-2" />
                Chat
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 border border-gray-600 text-sm font-medium">
                <Users className="h-4 w-4 inline mr-2" />
                Participants ({participants.length + 1})
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallModal;