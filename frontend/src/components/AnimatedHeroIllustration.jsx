import React from 'react'
import { motion } from 'framer-motion'
import { Video, MessageSquare, Globe } from 'lucide-react'

// Animated vector illustration: people in a video call with chat bubbles and live captions
const AnimatedHeroIllustration = () => {
  return (
    <motion.div
      className="relative w-full h-96 flex items-center justify-center"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Video call window */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-card w-72 h-44 flex flex-col items-center justify-center border-4 border-primary-100 dark:border-primary-900/20"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex items-center space-x-2 mb-2">
          <span className="w-8 h-8 bg-primary-200 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 font-bold">A</span>
          <span className="w-8 h-8 bg-purple-200 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-700 font-bold">B</span>
          <span className="w-8 h-8 bg-green-200 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 font-bold">C</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Video className="h-10 w-10 text-primary-600" />
        </div>
        <div className="w-full flex justify-center mt-2">
          <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-200 rounded-full px-3 py-1 text-xs font-medium animate-pulse">Live Captions: "Welcome to the meeting!"</span>
        </div>
      </motion.div>
      {/* Animated chat bubbles */}
      <motion.div
        className="absolute left-0 top-10 bg-white dark:bg-gray-700 rounded-xl shadow-card px-4 py-2 text-sm text-gray-900 dark:text-white"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.7 }}
      >
        <MessageSquare className="inline h-4 w-4 mr-1 text-primary-600" /> Hi team!
      </motion.div>
      <motion.div
        className="absolute right-0 bottom-10 bg-primary-600 text-white rounded-xl shadow-card px-4 py-2 text-sm"
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.7 }}
      >
        <Globe className="inline h-4 w-4 mr-1" /> Real-time translation enabled
      </motion.div>
    </motion.div>
  )
}

export default AnimatedHeroIllustration
