import React from 'react';

const VideoParticipant = ({ stream, isLocal = false, participant, isScreenShare = false }) => {
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${
      isScreenShare ? 'col-span-2 row-span-2' : ''
    }`}>
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        muted={isLocal}
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Participant info overlay */}
      <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 rounded px-2 py-1">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium">
            {participant?.name || 'Participant'} 
            {isLocal && ' (You)'}
            {isScreenShare && ' - Screen'}
          </span>
          
          {/* Status indicators */}
          <div className="flex items-center space-x-1">
            {!stream?.getVideoTracks()?.[0]?.enabled && (
              <span className="text-xs bg-red-500 text-white px-1 rounded">Video Off</span>
            )}
            {!stream?.getAudioTracks()?.[0]?.enabled && (
              <span className="text-xs bg-red-500 text-white px-1 rounded">Muted</span>
            )}
          </div>
        </div>
      </div>

      {/* Screen share indicator */}
      {isScreenShare && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          Screen Sharing
        </div>
      )}
    </div>
  );
};

export default VideoParticipant;