import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';

export const useChatRoom = (roomId, user) => {
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId || !user) {
      setLoading(false);
      return;
    }

    const initializeRoom = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        console.log('Initializing room:', roomId, 'User:', user.id);

        // First, get room details
        const roomResponse = await axios.get(
          `http://localhost:5000/api/rooms/${roomId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRoom(roomResponse.data);

        // Join room via API
        const joinResponse = await axios.post('http://localhost:5000/api/rooms/join', {
          roomId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Join response:', joinResponse.data);

        // Load room messages
        const messagesResponse = await axios.get(
          `http://localhost:5000/api/rooms/${roomId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(messagesResponse.data || []);

        // Load room members
        const membersResponse = await axios.get(
          `http://localhost:5000/api/rooms/${roomId}/members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setParticipants(membersResponse.data || []);

        // Connect to Socket.IO
        socketRef.current = io('http://localhost:5000', { 
          withCredentials: true,
          query: { roomId, userId: user.id }
        });

        // Socket event listeners
        socketRef.current.on('connect', () => {
          console.log('Socket connected:', socketRef.current?.id);
          if (socketRef.current && user && roomId) {
            socketRef.current.emit('join-room', roomId, user.id);
          }
        });

        socketRef.current.on('disconnect', () => {
          console.log('Socket disconnected');
        });

        // Changed from 'chat-message' to 'new-message' to match backend
        socketRef.current.on('new-message', (newMessage) => {
          console.log('New message received:', newMessage);
          setMessages(prev => [...prev, newMessage]);
        });

        socketRef.current.on('user-joined', (data) => {
          console.log('User joined:', data);
          if (data.userId !== user.id) {
            toast.success(`User ${data.userId} joined the room`);
          }
          refreshParticipants();
        });

        socketRef.current.on('user-left', (data) => {
          console.log('User left:', data);
          toast(`User ${data.userId} left the room`, { icon: 'ℹ️' });
          refreshParticipants();
        });

        socketRef.current.on('message:reaction', (reactionData) => {
          console.log('Message reaction:', reactionData);
          setMessages(prev => prev.map(msg => 
            msg.id === reactionData.messageId 
              ? { ...msg, reactions: reactionData.reactions }
              : msg
          ));
        });

        socketRef.current.on('error', (error) => {
          console.error('Socket error:', error);
        });

        setLoading(false);
      } catch (error) {
        console.error('Room initialization error:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Failed to join room';
        toast.error(errorMessage);
        setLoading(false);
      }
    };

    const refreshParticipants = async () => {
      try {
        const token = localStorage.getItem('token');
        const membersResponse = await axios.get(
          `http://localhost:5000/api/rooms/${roomId}/members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setParticipants(membersResponse.data || []);
      } catch (error) {
        console.error('Failed to refresh participants:', error);
      }
    };

    initializeRoom();

    return () => {
      if (socketRef.current && user && roomId) {
        console.log('Cleaning up socket connection');
        socketRef.current.emit('leave-room', roomId, user.id);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, user]);

  const sendMessage = async (message, targetLanguage = 'en') => {
    if (!message?.trim() || !socketRef.current) {
      console.log('Cannot send message - no socket or empty message');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Sending message:', { message, roomId, targetLanguage });
      
      const response = await axios.post('http://localhost:5000/api/chat/send', {
        message: message.trim(),
        roomId,
        targetLanguage
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Message sent successfully:', response.data);
    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send message';
      toast.error(errorMessage);
    }
  };

  const addReaction = async (messageId, reaction) => {
    if (!socketRef.current || !user) return;

    try {
      console.log('Adding reaction:', { messageId, reaction, roomId, userId: user.id });
      
      // Emit socket event for real-time reaction
      socketRef.current.emit('message:react', {
        messageId,
        reaction,
        userId: user.id,
        roomId
      });

    } catch (error) {
      console.error('React error:', error);
      toast.error('Failed to add reaction');
    }
  };

  return {
    messages: messages || [],
    participants: participants || [],
    room,
    loading,
    sendMessage,
    addReaction,
    socket: socketRef.current
  };
};