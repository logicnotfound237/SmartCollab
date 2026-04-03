import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatRoom from '../components/ChatRoom';
import Layout from '../components/Layout';

const Chat = () => {
  const { roomId } = useParams();
  const { user } = useAuth();

  if (!roomId) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invalid Room
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please provide a valid room ID
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ChatRoom roomId={roomId} user={user} />
    </Layout>
  );
};

export default Chat;