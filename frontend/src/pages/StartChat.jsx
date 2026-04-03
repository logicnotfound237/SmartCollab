import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Copy, 
  Share2, 
  Video, 
  Phone, 
  MessageCircle, 
  UserPlus,
  Globe,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';

const StartChat = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [createdRoom, setCreatedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoJoinRoomId, setAutoJoinRoomId] = useState(null);
  const [joinStatus, setJoinStatus] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auto-join room from URL parameter
  useEffect(() => {
    const joinRoomId = searchParams.get('join');
    if (joinRoomId) {
      setAutoJoinRoomId(joinRoomId);
      setRoomId(joinRoomId);
      setActiveTab('join');
      
      // Auto-join after a short delay to show user what's happening
      setTimeout(() => {
        joinRoom(joinRoomId);
      }, 1000);
    }
  }, [searchParams]);

  const createRoom = async () => {
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/rooms/create', {
        name: roomName.trim(),
        settings: {
          profanityFilter: true,
          defaultLanguage: 'en',
          allowScreenShare: true,
          allowWhiteboard: true,
          maxMembers: 50,
          isPublic: true
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCreatedRoom(response.data.room);
        toast.success('Room created successfully!');
        console.log('Room created with ID:', response.data.room.id);
      } else {
        toast.error('Failed to create room');
      }
    } catch (error) {
      console.error('Create room error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create room';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomIdToJoin = null) => {
    const targetRoomId = roomIdToJoin || roomId;
    
    if (!targetRoomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }

    setLoading(true);
    setJoinStatus('Joining room...');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/rooms/join', {
        roomId: targetRoomId.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      });

      console.log('Join response:', response.data);
      
      if (response.data.success) {
        setJoinStatus('Success! Redirecting...');
        toast.success('Joined room successfully!');
        
        // Small delay to show success message
        setTimeout(() => {
          navigate(`/chat/${targetRoomId.trim()}`);
        }, 1000);
      } else {
        setJoinStatus('Failed to join room');
        toast.error('Failed to join room');
      }
    } catch (error) {
      console.error('Join room error:', error);
      setJoinStatus('Error joining room');
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout - server is not responding');
      } else if (error.response?.status === 404) {
        toast.error('Room not found. Please check the room ID.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to join this room.');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.message) {
        toast.error(`Network error: ${error.message}`);
      } else {
        toast.error('Failed to join room. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const shareRoom = () => {
    const shareUrl = `${window.location.origin}/start-chat?join=${createdRoom.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Join ${createdRoom.name}`,
        text: `Join my chat room on SmartCollab: ${createdRoom.name}`,
        url: shareUrl
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyRoomLink = () => {
    const shareUrl = `${window.location.origin}/start-chat?join=${createdRoom.id}`;
    copyToClipboard(shareUrl);
  };

  const copyRoomId = () => {
    copyToClipboard(createdRoom.id);
  };

  const enterRoom = () => {
    if (createdRoom) {
      navigate(`/chat/${createdRoom.id}`);
    }
  };

  const testServerConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/health', {
        timeout: 5000
      });
      toast.success('Server is connected and healthy!');
      console.log('Server health:', response.data);
    } catch (error) {
      toast.error('Server is not responding. Please check if the backend is running.');
      console.error('Server health check failed:', error);
    }
  };

  // Auto-join notification
  if (autoJoinRoomId && loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {joinStatus || 'Joining Room...'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Automatically joining room
            </p>
            <p className="text-sm font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-2 rounded-lg">
              {autoJoinRoomId}
            </p>
            <button
              onClick={testServerConnection}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Test Server Connection
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Start a Smart Chat
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Create a new chat room or join an existing one with real-time translation, 
              video calls, and collaborative features.
            </p>
            
            {/* Server Status */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={testServerConnection}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Test Server Connection</span>
              </button>
            </div>
          </motion.div>

          {/* Room Creation/Join Section */}
          {!createdRoom ? (
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Create Room Card */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Create New Room
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Start a new collaboration space
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter room name..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && roomName.trim()) {
                          createRoom();
                        }
                      }}
                    />
                  </div>

                  <button
                    onClick={createRoom}
                    disabled={loading || !roomName.trim()}
                    className="w-full bg-gradient-to-r from-primary-600 to-accent-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-accent-500 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Room...
                      </>
                    ) : (
                      'Create Room'
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Join Room Card */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mr-4">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Join Room
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Enter room ID or use invite link
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room ID
                    </label>
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Paste room ID or invite link..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && roomId.trim()) {
                          joinRoom();
                        }
                      }}
                    />
                  </div>

                  <button
                    onClick={() => joinRoom()}
                    disabled={loading || !roomId.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {joinStatus || 'Joining Room...'}
                      </>
                    ) : (
                      'Join Room'
                    )}
                  </button>

                  <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Or share this link format with others:
                    </p>
                    <div className="flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                      <code className="text-xs text-primary-600 dark:text-primary-400 font-mono">
                        {window.location.origin}/start-chat?join=ROOM_ID
                      </code>
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/start-chat?join=ROOM_ID`)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            /* Created Room Success Section */
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-accent-400 rounded-2xl shadow-2xl p-8 text-white mb-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Room Created Successfully!</h3>
                  <p className="text-primary-100">Share the invite link with others to join instantly</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={copyRoomLink}
                    className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                    title="Copy Invite Link"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button
                    onClick={shareRoom}
                    className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                    title="Share Room"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6 mb-6">
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-primary-100 text-sm mb-1">Room Name</p>
                    <p className="font-semibold text-lg">{createdRoom.name}</p>
                  </div>
                  <div>
                    <p className="text-primary-100 text-sm mb-1">Room ID</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono font-semibold text-sm">{createdRoom.id}</p>
                      <button
                        onClick={copyRoomId}
                        className="p-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
                        title="Copy Room ID"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Invite Link Section */}
                <div className="mt-4 p-4 bg-white/5 rounded-lg">
                  <p className="text-primary-100 text-sm mb-2">Invite Link</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/start-chat?join=${createdRoom.id}`}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-mono"
                    />
                    <button
                      onClick={copyRoomLink}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-1"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="text-sm">Copy</span>
                    </button>
                  </div>
                  <p className="text-primary-200 text-xs mt-2">
                    Share this link - anyone with it can join instantly!
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={enterRoom}
                  className="flex-1 bg-white text-primary-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Enter Chat Room</span>
                </button>
                <button
                  onClick={() => setCreatedRoom(null)}
                  className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Create Another</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Features Grid */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Video Calls</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                HD video calls with screen sharing
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Voice Calls</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Crystal clear audio calls
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Live Translation</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Real-time message translation
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default StartChat;