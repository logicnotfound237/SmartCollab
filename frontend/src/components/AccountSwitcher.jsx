import React, { useState } from 'react';
import { Users, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AccountSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, login, logout } = useAuth();

  // Mock accounts for testing
  const mockAccounts = [
    { email: 'alice@test.com', password: 'password123', name: 'Alice Johnson', role: 'Team Member' },
    { email: 'bob@test.com', password: 'password123', name: 'Bob Smith', role: 'Project Manager' },
    { email: 'carol@test.com', password: 'password123', name: 'Carol Davis', role: 'Designer' },
    { email: 'dave@test.com', password: 'password123', name: 'Dave Wilson', role: 'Developer' }
  ];

  const handleAccountSwitch = async (account) => {
    try {
      await logout();
      const result = await login(account.email, account.password);
      if (result.success) {
        toast.success(`Switched to ${account.name}`);
        setIsOpen(false);
      }
    } catch (error) {
      toast.error('Failed to switch account');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Switch Account"
      >
        <Users className="h-5 w-5" />
        <span className="hidden md:inline text-sm">{user?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">Switch to test account:</p>
            {mockAccounts.map((account, index) => (
              <button
                key={index}
                onClick={() => handleAccountSwitch(account)}
                className="w-full flex items-center space-x-3 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                  {account.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-medium">{account.name}</p>
                  <p className="text-xs text-gray-500">{account.role}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-2 p-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSwitcher;