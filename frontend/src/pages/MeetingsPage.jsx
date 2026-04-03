import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import VideoGrid from '../components/VideoGrid';
import { useWebRTC } from '../hooks/useWebRTC';

const MeetingsPage = () => {
  const [roomId, setRoomId] = useState('default-room');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState({ id: 'user-' + Date.now(), name: 'User' });
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [showOriginal, setShowOriginal] = useState(false);
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef();

  // Initialize WebRTC
  const {
    localStream,
    remoteStreams,
    screenStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    participants,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    cleanup
  } = useWebRTC(roomId, user);

  // Initialize Socket.IO for chat
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    // Join chat room
    socketRef.current.emit('join-room', roomId, user.id);

    // Listen for chat messages
    socketRef.current.on('chat-message', (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    // Load previous messages
    const loadMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/messages`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      cleanup();
    };
  }, [roomId, user.id, cleanup]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send chat message
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            message: message.trim(),
            targetLanguage: targetLanguage !== 'en' ? targetLanguage : undefined
          })
        }
      );

      if (response.ok) {
        setMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle Enter key for sending messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Language options
  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">SmartCollab Meeting</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Room: <strong>{roomId}</strong>
              </span>
              <span className="text-sm text-gray-300">
                Participants: <strong>{1 + remoteStreams.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 relative">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            screenStream={screenStream}
            participants={participants}
          />
        </div>

        {/* Controls */}
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
          <div className="flex items-center justify-center space-x-4">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full ${
                isAudioMuted ? 'bg-red-500' : 'bg-blue-500'
              } hover:opacity-90 transition-all`}
            >
              {isAudioMuted ? '🔇' : '🎤'}
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${
                isVideoOff ? 'bg-red-500' : 'bg-blue-500'
              } hover:opacity-90 transition-all`}
            >
              {isVideoOff ? '📷 Off' : '📹 On'}
            </button>

            {/* Screen Share */}
            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-full ${
                isScreenSharing ? 'bg-green-500' : 'bg-blue-500'
              } hover:opacity-90 transition-all`}
            >
              {isScreenSharing ? '🖥️ Stop Share' : '🖥️ Share'}
            </button>

            {/* Leave Call */}
            <button
              onClick={cleanup}
              className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-all"
            >
              📞 Leave
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Chat</h2>
          
          {/* Translation Controls */}
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Translate to:</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="bg-gray-700 text-white text-sm rounded px-2 py-1"
              >
                {languageOptions.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show-original"
                checked={showOriginal}
                onChange={(e) => setShowOriginal(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="show-original" className="text-sm text-gray-300">
                Show original messages
              </label>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-3">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-blue-300">{msg.senderName}</span>
                <span className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              {/* Message content with translation toggle */}
              <div className="text-sm">
                {msg.translated && msg.translation ? (
                  <>
                    {showOriginal ? (
                      <div>
                        <div className="text-gray-400 italic mb-1">Original:</div>
                        <div>{msg.originalMessage || msg.message}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-green-400 text-xs mb-1">
                          Translated from {msg.detectedLanguage}
                        </div>
                        <div>{msg.translation}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div>{msg.message}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none"
              rows="2"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;