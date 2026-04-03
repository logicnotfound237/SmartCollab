import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Video, 
  Phone, 
  Globe, 
  PenTool, 
  Users, 
  Settings, 
  MoreVertical, 
  Heart, 
  ThumbsUp, 
  Laugh, 
  ScreenShare, 
  Share2,
  Mic,
  MicOff,
  VideoOff,
  Square,
  Check,
  CheckCheck,
  Clock,
  Search,
  Menu,
  X,
  Languages,
  FileText,
  Activity
} from 'lucide-react';
import { useChatRoom } from '../hooks/useChatRoom';
import { useWebRTC } from '../hooks/useWebRTC';
import { useTranslation } from '../hooks/useTranslation';
import { useLiveAudio } from '../hooks/useLiveAudio';
import CallModal from './CallModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import AccountSwitcher from './AccountSwitcher';

const ChatRoom = ({ roomId, user }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(user?.preferences?.defaultLanguage || 'en');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTranscriptPanel, setShowTranscriptPanel] = useState(false);
   
  const messagesEndRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);

  const {
    messages,
    participants,
    loading,
    sendMessage,
    addReaction,
    socket
  } = useChatRoom(roomId, user);

  const {
    localStream,
    remoteStreams,
    screenStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isWhiteboardSharing,
    inCall,
    callType,
    startCall,
    endCall,
    acceptCall,
    declineCall,
    toggleScreenShare,
    toggleWhiteboardShare,
    toggleAudio,
    toggleVideo
  } = useWebRTC(roomId, user, socket);

  // Translation hook with improved real-time support
  const {
    isTranslating,
    showOriginal = {},
    translateMessage,
    batchTranslateMessages,
    toggleOriginalView,
    getSupportedLanguages,
    getLanguageName,
    clearCache
  } = useTranslation(selectedLanguage);

  // Live audio transcription hook
  const {
    isTranscribing,
    transcripts,
    audioLevel,
    toggleTranscription,
    clearTranscripts
  } = useLiveAudio(roomId, user, socket);

  // Translation state management
  const [languages, setLanguages] = useState([]);
  const [localTranslatedMessages, setLocalTranslatedMessages] = useState({});
  const [translatedMessageIds, setTranslatedMessageIds] = useState(new Set());

  // Load languages safely
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const langs = await getSupportedLanguages();
        setLanguages(Array.isArray(langs) ? langs : []);
      } catch (error) {
        console.warn('Failed to load languages:', error);
        // Fallback to default languages
        setLanguages([
          { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
          { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
          { code: 'bn', name: 'Bengali', flag: '🇮🇳', nativeName: 'বাংলা' },
          { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
          { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' },
          { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
          { code: 'ur', name: 'Urdu', flag: '🇮🇳', nativeName: 'اردو' },
          { code: 'gu', name: 'Gujarati', flag: '🇮🇳', nativeName: 'ગુજરાતી' },
          { code: 'kn', name: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ' },
          { code: 'ml', name: 'Malayalam', flag: '🇮🇳', nativeName: 'മലയാളം' },
          { code: 'pa', name: 'Punjabi', flag: '🇮🇳', nativeName: 'ਪੰਜਾਬੀ' },
          { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
          { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
          { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
          { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
          { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
          { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' }
        ]);
      }
    };
    
    loadLanguages();
  }, [getSupportedLanguages]);

  // Batch translate all messages when language changes or messages load
  useEffect(() => {
    const translateAllMessages = async () => {
      if (selectedLanguage === 'en') {
        setLocalTranslatedMessages({});
        setTranslatedMessageIds(new Set());
        return;
      }

      const validMessages = messages.filter(msg => msg?.message && msg?.id);
      if (validMessages.length === 0) return;

      try {
        const translations = await batchTranslateMessages(validMessages, selectedLanguage);
        setLocalTranslatedMessages(translations);
        
        // Mark all messages as translated
        const newTranslatedIds = new Set(validMessages.map(msg => msg.id));
        setTranslatedMessageIds(newTranslatedIds);
      } catch (error) {
        console.error('Batch translation failed:', error);
      }
    };

    translateAllMessages();
  }, [messages, selectedLanguage, batchTranslateMessages]);

  // Real-time message translation handler
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (message) => {
      if (selectedLanguage === 'en' || !message?.message || !message?.id) return;
      
      // Check if we already translated this message
      if (translatedMessageIds.has(message.id)) return;

      try {
        const translated = await translateMessage(message.message, selectedLanguage);
        if (translated && translated !== message.message) {
          setLocalTranslatedMessages(prev => ({
            ...prev,
            [message.id]: translated
          }));
          setTranslatedMessageIds(prev => new Set(prev).add(message.id));
        }
      } catch (error) {
        console.warn('Real-time translation failed:', error);
      }
    };

    socket.on('new-message', handleNewMessage);
    
    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, selectedLanguage, translateMessage, translatedMessageIds]);

  // Reset translations when language changes to English
  useEffect(() => {
    if (selectedLanguage === 'en') {
      setLocalTranslatedMessages({});
      setTranslatedMessageIds(new Set());
    }
  }, [selectedLanguage]);

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '🙌'];
  
  const reactions = [
    { emoji: '👍', label: 'Like', color: 'text-blue-500' },
    { emoji: '❤️', label: 'Love', color: 'text-red-500' },
    { emoji: '😂', label: 'Hasi', color: 'text-yellow-500' },
    { emoji: '😮', label: 'Wow', color: 'text-orange-500' },
    { emoji: '😢', label: 'Sad', color: 'text-blue-400' },
    { emoji: '🙏', label: 'Dhanyavad', color: 'text-green-500' },
    { emoji: '🔥', label: 'Jhakaas', color: 'text-orange-500' },
    { emoji: '🎉', label: 'Mubarak', color: 'text-purple-500' }
  ];

  // Filter messages based on search
  const filteredMessages = (messages || []).filter(message => {
    if (!message) return false;
    const messageText = message.message || '';
    const senderName = message.senderName || '';
    return messageText.toLowerCase().includes(searchQuery.toLowerCase()) ||
           senderName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Fetch room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoomDetails(response.data);
      } catch (error) {
        console.error('Failed to fetch room details:', error);
        setRoomDetails({
          id: roomId,
          name: `Room ${roomId?.slice(0, 8)}...`,
          type: 'group'
        });
      }
    };

    if (roomId) {
      fetchRoomDetails();
    }
  }, [roomId]);

  // Handle incoming calls
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ userId, callType }) => {
      setIncomingCall({ userId, callType });
      toast.success(`Incoming ${callType} call from ${userId}`);
    };

    const handleCallAccepted = ({ userId }) => {
      toast.success(`${userId} accepted your call`);
      setShowCallModal(true);
    };

    const handleCallEnded = ({ userId }) => {
      toast(`${userId} ended the call`, { icon: 'ℹ️' });
      setIncomingCall(null);
      setShowCallModal(false);
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-accepted', handleCallAccepted);
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, localTranslatedMessages]);

  // Auto-scroll transcript to bottom when new transcripts arrive
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Show call modal when in call
  useEffect(() => {
    if (inCall) {
      setShowCallModal(true);
    } else {
      setShowCallModal(false);
    }
  }, [inCall]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage, selectedLanguage);
    setNewMessage('');
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(newMessage + emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      acceptCall(incomingCall.callType);
      setIncomingCall(null);
      setShowCallModal(true);
    }
  };

  const handleDeclineCall = () => {
    declineCall();
    setIncomingCall(null);
    setShowCallModal(false);
  };

  // Check if message is from current user
  const isMyMessage = (message) => {
    if (!message || !user) return false;
    return message.senderId === user.id || message.senderName === user.name;
  };

  // Format time for messages (WhatsApp style)
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }).toLowerCase();
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: diffInHours < 365 ? undefined : 'numeric'
        });
      }
    } catch (error) {
      return '';
    }
  };

  // Format detailed timestamp for tooltips
  const formatDetailedTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  // Format seconds to MM:SS for transcripts
  const formattranscriptTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle reaction click
  const handleReactionClick = (messageId, reaction) => {
    addReaction(messageId, reaction);
    setShowReactionPicker(null);
  };

  // Whiteboard functions
  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLastPos({ x, y });
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#2563EB';
    ctx.lineWidth = 2;
    if (socket) {
      socket.emit('whiteboard:start', { x, y, roomId });
    }
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    if (socket) {
      socket.emit('whiteboard:draw', { x, y, roomId });
    }
    setLastPos({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPos(null);
    if (socket) {
      socket.emit('whiteboard:stop', { roomId });
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (socket) {
      socket.emit('whiteboard:clear', { roomId });
    }
  };

  // Socket whiteboard listeners
  useEffect(() => {
    if (!socket) return;

    const handleStart = ({ x, y }) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2;
    };

    const handleDraw = ({ x, y }) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const handleClear = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    socket.on('whiteboard:start', handleStart);
    socket.on('whiteboard:draw', handleDraw);
    socket.on('whiteboard:clear', handleClear);

    return () => {
      socket.off('whiteboard:start', handleStart);
      socket.off('whiteboard:draw', handleDraw);
      socket.off('whiteboard:clear', handleClear);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chat room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Incoming Call Notification */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {incomingCall.userId} is calling you
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={handleAcceptCall}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg"
                >
                  <Phone className="h-5 w-5" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={handleDeclineCall}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg"
                >
                  <X className="h-5 w-5" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - WhatsApp Style */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {roomDetails?.name || `Room ${roomId?.slice(0, 8)}...`}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(participants?.length || 0) + 1} members online
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-48"
                />
              </div>

              {/* Language Selector with Translation Indicator */}
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                >
                  <optgroup label="🇮🇳 Indian Languages">
                    {languages.filter(lang => 
                      ['hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'pa'].includes(lang?.code)
                    ).map((lang) => (
                      <option key={lang?.code} value={lang?.code}>
                        {lang?.flag} {lang?.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌍 Other Languages">
                    {languages.filter(lang => 
                      !['hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'pa'].includes(lang?.code)
                    ).map((lang) => (
                      <option key={lang?.code} value={lang?.code}>
                        {lang?.flag} {lang?.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
                {selectedLanguage !== 'en' && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              
              {/* Account Switcher */}
              <AccountSwitcher />
              
              {/* Whiteboard Toggle */}
              <button
                onClick={() => setShowWhiteboard(!showWhiteboard)}
                className={`p-2 rounded-lg transition-all ${
                  showWhiteboard
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Toggle Whiteboard"
              >
                <PenTool className="h-5 w-5" />
              </button>

              {/* Live Transcription Toggle */}
              <button
                onClick={toggleTranscription}
                className={`p-2 rounded-lg transition-all ${
                  isTranscribing
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={isTranscribing ? 'Stop Live Transcription' : 'Start Live Transcription'}
              >
                <div className="relative">
                  <FileText className="h-5 w-5" />
                  {isTranscribing && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                </div>
              </button>

              {/* Video Call Button */}
              <button
                onClick={() => startCall('video')}
                disabled={inCall}
                className={`p-2 rounded-lg transition-all ${
                  inCall
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 shadow-md' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Start Video Call"
              >
                <Video className="h-5 w-5" />
              </button>

              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Messages Area */}
          <div className={`flex-1 flex flex-col ${showWhiteboard ? 'lg:w-2/3' : 'w-full'}`}>
            {/* Translation Indicator */}
            {selectedLanguage !== 'en' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
                <div className="flex items-center justify-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                  <Languages className="h-4 w-4" />
                  <span>Translating messages to {getLanguageName?.(selectedLanguage) || selectedLanguage}</span>
                  {isTranslating && (
                    <div className="flex items-center space-x-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                      <span className="text-xs">Translating...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {searchQuery ? 'No messages found' : 'No messages yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? 'Try a different search term' : 'Start the conversation by sending a message!'}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-1">
                  {filteredMessages.map((message, i) => {
                    if (!message) return null;
                    
                    const isMine = isMyMessage(message);
                    const prevMessage = filteredMessages[i - 1];
                    const showAvatar = !isMine && (
                      i === 0 || 
                      !prevMessage ||
                      prevMessage?.senderId !== message?.senderId ||
                      new Date(message.timestamp) - new Date(prevMessage?.timestamp) > 300000
                    );

                    // Use localTranslatedMessages for display
                    const displayMessage = showOriginal[message.id] 
                      ? message?.message || ''
                      : (localTranslatedMessages[message.id] || message?.message || '');

                    const isTranslated = localTranslatedMessages[message.id] && localTranslatedMessages[message.id] !== message?.message;

                    // Create unique key using message.id and index
                    const uniqueKey = message.id ? `${message.id}-${i}` : `msg-${i}`;

                    return (
                      <motion.div
                        key={uniqueKey}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'} group mb-1`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i, duration: 0.4 }}
                      >
                        <div className={`flex ${isMine ? 'flex-row-reverse' : 'flex-row'} items-end max-w-xs lg:max-w-md mx-2`}>
                          {/* Avatar for received messages */}
                          {!isMine && showAvatar && (
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 flex-shrink-0">
                              {(message?.senderName || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          
                          {/* Spacer for alignment when no avatar */}
                          {!isMine && !showAvatar && (
                            <div className="w-10 mr-2"></div>
                          )}

                          {/* Message bubble */}
                          <div className="relative">
                            <div className={`rounded-2xl px-4 py-2 max-w-full ${
                              isMine 
                                ? 'bg-blue-500 text-white rounded-br-none ml-auto shadow-sm' 
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none mr-auto shadow-sm border border-gray-200 dark:border-gray-700'
                            } relative`}>
                              {/* Sender name for group chats */}
                              {!isMine && showAvatar && (
                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                                  {message?.senderName || 'User'}
                                </div>
                              )}
                              
                              {/* Message content with translation toggle */}
                              <div className="break-words text-sm">
                                {displayMessage}
                                {isTranslated && (
                                  <div className="flex items-center space-x-1 mt-1">
                                    <button
                                      onClick={() => toggleOriginalView(message.id)}
                                      className="text-xs text-white-500 hover:text-blue-600 underline"
                                    >
                                      {showOriginal[message.id] ? 'View translation' : 'View original'}
                                    </button>
                                    <span className="text-xs text-green-500" title="Translated">
                                      🌐
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Message Reactions Display */}
                              {message?.reactions && typeof message.reactions === 'object' && Object.keys(message.reactions).length > 0 && (
                                <div className={`flex flex-wrap gap-1 mt-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                  {Object.entries(message.reactions).map(([reaction, users]) => {
                                    if (!Array.isArray(users) || users.length === 0) return null;
                                    return (
                                      <div
                                        key={`${uniqueKey}-${reaction}`}
                                        className={`flex items-center space-x-1 rounded-full px-2 py-1 text-xs ${
                                          isMine 
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                                        }`}
                                      >
                                        <span className="text-xs">{reaction}</span>
                                        <span className="text-xs font-medium">{users.length}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              
                              {/* Message time and status */}
                              <div className={`flex items-center justify-end space-x-1 mt-1 ${
                                isMine ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                <span 
                                  className="text-xs cursor-help"
                                  title={formatDetailedTime(message?.timestamp)}
                                >
                                  {formatTime(message?.timestamp)}
                                </span>
                                {isMine && (
                                  <CheckCheck className="h-3 w-3" />
                                )}
                              </div>
                            </div>

                            {/* Reaction Picker Trigger */}
                            <button
                              onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-700 rounded-full p-1 shadow-sm border border-gray-200 dark:border-gray-600"
                            >
                              <Smile className="h-3 w-3 text-gray-500" />
                            </button>

                            {/* Reaction Picker */}
                            <AnimatePresence>
                              {showReactionPicker === message.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600 flex space-x-1 z-10"
                                >
                                  {reactions.map((reaction, index) => (
                                    <button
                                      key={`${message.id}-reaction-${index}`}
                                      onClick={() => handleReactionClick(message.id, reaction.emoji)}
                                      className={`p-1 hover:scale-125 transition-transform ${reaction.color}`}
                                      title={reaction.label}
                                    >
                                      <span className="text-lg">{reaction.emoji}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input - WhatsApp Style */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                {/* Emoji Picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 z-10"
                      >
                        {emojis.map((emoji, index) => (
                          <button
                            key={`emoji-${index}`}
                            type="button"
                            onClick={() => handleEmojiClick(emoji)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Attachment Button */}
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Paperclip className="h-5 w-5" />
                </button>

                {/* Message Input */}
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Type a message... ${selectedLanguage !== 'en' ? `(translating to ${getLanguageName?.(selectedLanguage) || selectedLanguage})` : ''}`}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
                      rows="1"
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Whiteboard Sidebar */}
          {showWhiteboard && (
            <div className="w-full lg:w-1/3 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Collaborative Whiteboard</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={clearCanvas}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
                    >
                      Clear
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={500}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg cursor-crosshair w-full bg-white shadow-sm"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">💡 <strong>Tips:</strong></p>
                  <ul className="space-y-1 text-xs">
                    <li>• Click and drag to draw</li>
                    <li>• Use "Clear" to reset the canvas</li>
                    <li>• Changes are synced in real-time</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Live Transcript Panel */}
          {isTranscribing && (
            <div className="w-full lg:w-1/3 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Live Transcription</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Audio Level Indicator */}
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Input:</span>
                      <div className="flex space-x-0.5 h-4 items-end">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-green-500 rounded-full"
                            animate={{
                              height: Math.min(
                                (audioLevel * 100) > (i * 20) ? 16 : 4,
                                16
                              )
                            }}
                            transition={{ duration: 0.1 }}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={clearTranscripts}
                      className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Transcript Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {transcripts.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Listening...</p>
                    <p className="text-xs mt-1">Speak to see transcription</p>
                  </div>
                ) : (
                  transcripts
                    .sort((a, b) => a.start - b.start)
                    .map((transcript, index) => (
                      <motion.div
                        key={`${transcript.userId}-${transcript.start}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-2 rounded-lg text-sm ${
                          transcript.userId === user?.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-l-2 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 min-w-[60px]">
                            {formattranscriptTime(transcript.start)}
                          </span>
                          <div className="flex-1">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-0.5">
                              {transcript.userId === user?.id ? 'You' : `User ${transcript.userId}`}
                            </span>
                            <p className="text-gray-900 dark:text-gray-100">{transcript.text}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                )}
                <div ref={transcriptEndRef} />
              </div>
              
              {/* Transcript Stats */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{transcripts.length} segments</span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Live</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call Modal */}
      <CallModal
        isOpen={showCallModal}
        onClose={() => {
          setShowCallModal(false);
          if (!inCall) {
            declineCall();
          }
        }}
        localStream={localStream}
        remoteStreams={remoteStreams}
        screenStream={screenStream}
        isAudioMuted={isAudioMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isWhiteboardSharing={isWhiteboardSharing}
        callType={callType}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleWhiteboardShare={toggleWhiteboardShare}
        onEndCall={endCall}
        participants={participants}
        inCall={inCall}
        incomingCall={incomingCall}
        onAcceptCall={handleAcceptCall}
        onDeclineCall={handleDeclineCall}
      />
    </div>
  );a
};

export default ChatRoom;