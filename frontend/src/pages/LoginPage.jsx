import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

const LoginPage = () => {
  const { login, user } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" />
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      // Navigation will happen automatically via AuthContext
    }
    
    setLoading(false)
  }

  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@smartcollab.com',
      password: 'password'
    })
  }

  return (
    <>
      <Helmet>
        <title>Sign In - SmartCollab</title>
        <meta name="description" content="Sign in to your SmartCollab account and start collaborating with your team." />
      </Helmet>
      
      <motion.div
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-sky-50 to-purple-100 dark:from-black dark:via-gray-900 dark:to-sky-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
      >
        <motion.div
          className="max-w-md w-full space-y-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <Link to="/" className="flex justify-center">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-sky-700 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-3xl font-poppins">S</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight font-poppins">SmartCollab</span>
              </motion.div>
            </Link>
            <h2 className="mt-6 text-center text-4xl font-extrabold bg-gradient-to-r from-sky-500 to-purple-600 bg-clip-text text-transparent font-poppins">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-lg text-gray-600 dark:text-gray-400 font-inter">
              Or{' '}
              <Link to="/signup" className="font-medium text-sky-700 hover:text-purple-600 transition-colors">
                create a new account
              </Link>
            </p>
          </motion.div>
          <motion.div
            className="bg-white/90 dark:bg-gray-900/90 py-10 px-8 shadow-lg rounded-2xl border border-sky-100 dark:border-gray-800 backdrop-blur-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <form className="space-y-7" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-base font-medium text-gray-700 dark:text-gray-300 font-inter">
                  Email address
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-sky-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10 py-3 text-lg rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-inter bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-base font-medium text-gray-700 dark:text-gray-300 font-inter">
                  Password
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-sky-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10 pr-10 py-3 text-lg rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-inter bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-sky-400 hover:text-purple-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-sky-400 hover:text-purple-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-sm text-sky-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Use demo credentials
                </button>
                <div className="text-sm">
                  <a href="#" className="font-medium text-sky-700 hover:text-purple-600 transition-colors">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-sky-700 to-purple-600 hover:from-purple-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="mt-2 ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  )
}

export default LoginPage

