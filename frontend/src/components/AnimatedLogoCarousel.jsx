import React from 'react'
import { motion } from 'framer-motion'

const logos = [
  'TechCorp',
  'StartupXYZ',
  'GlobalInc',
  'InnovateLab',
  'FutureWorks',
  'NextGen',
  'Cloudify',
  'DataWave',
  'Visionary',
  'SyncroSoft',
]

const AnimatedLogoCarousel = () => {
  return (
    <div className="overflow-hidden w-full py-2">
      <motion.div
        className="flex space-x-12"
        animate={{ x: [0, -600, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
      >
        {[...logos, ...logos].map((logo, i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg h-12 w-36 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold text-lg shadow-card mx-2"
          >
            {logo}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default AnimatedLogoCarousel
