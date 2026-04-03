import React from 'react';
import VideoParticipant from './VideoParticipant';

const VideoGrid = ({ localStream, remoteStreams, screenStream, participants }) => {
  // Calculate grid layout based on number of participants
  const calculateGridClass = (totalParticipants) => {
    if (totalParticipants === 1) return 'grid-cols-1 grid-rows-1';
    if (totalParticipants === 2) return 'grid-cols-2 grid-rows-1';
    if (totalParticipants <= 4) return 'grid-cols-2 grid-rows-2';
    if (totalParticipants <= 6) return 'grid-cols-3 grid-rows-2';
    if (totalParticipants <= 9) return 'grid-cols-3 grid-rows-3';
    return 'grid-cols-4 grid-rows-3';
  };

  // Combine all streams for display
  const allStreams = React.useMemo(() => {
    const streams = [];
    
    // Add local stream
    if (localStream) {
      streams.push({
        stream: localStream,
        isLocal: true,
        participant: { name: 'You' },
        type: 'camera'
      });
    }

    // Add remote streams
    remoteStreams.forEach(remote => {
      streams.push({
        ...remote,
        isLocal: false
      });
    });

    // Add screen share if available
    if (screenStream) {
      streams.push({
        stream: screenStream,
        isLocal: true,
        participant: { name: 'Your Screen' },
        type: 'screen',
        isScreenShare: true
      });
    }

    return streams;
  }, [localStream, remoteStreams, screenStream]);

  const gridClass = calculateGridClass(allStreams.length);

  return (
    <div className={`w-full h-full grid ${gridClass} gap-4 p-4 bg-gray-800`}>
      {allStreams.map((streamData, index) => (
        <VideoParticipant
          key={index}
          stream={streamData.stream}
          isLocal={streamData.isLocal}
          participant={streamData.participant}
          isScreenShare={streamData.isScreenShare}
        />
      ))}
      
      {/* Empty state */}
      {allStreams.length === 0 && (
        <div className="col-span-full row-span-full flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-6xl mb-4">🎥</div>
            <p className="text-xl">No active video streams</p>
            <p className="text-gray-400">Start your camera to begin the meeting</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;