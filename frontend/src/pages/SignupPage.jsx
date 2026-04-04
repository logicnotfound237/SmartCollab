

import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';

const SignupPage = () => {
  const { signup, user, LandingPageEmail } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: LandingPageEmail?LandingPageEmail:'',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  if (user) {
    return <Navigate to="/dashboard" />
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    const result = await signup(formData.email, formData.password, formData.name)
    
    if (result.success) {
      // Navigation will happen automatically via AuthContext
    }
    
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Sign Up - SmartCollab</title>
        <meta name="description" content="Create your SmartCollab account and start collaborating with your team today." />
      </Helmet>
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-sky-50 to-purple-100 dark:from-black dark:via-gray-900 dark:to-sky-950 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(147,51,234,0.12),transparent_50%)]" />
        <motion.div
          className="max-w-md w-full space-y-8 z-20"
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
              Create your account
            </h2>
            <p className="mt-2 text-center text-lg text-gray-600 dark:text-gray-400 font-inter">
              Or{' '}
              <Link to="/login" className="font-medium text-sky-700 hover:text-purple-600 transition-colors">
                sign in to your existing account
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
                <label htmlFor="name" className="block text-base font-medium text-gray-700 dark:text-gray-300 font-inter">
                  Full Name
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-sky-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field pl-10 py-3 text-lg rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-inter bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

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
                    className={`input-field pl-10 py-3 text-lg rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-inter bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field pl-10 pr-10 py-3 text-lg rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-inter bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Create a password"
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
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-700 dark:text-gray-300 font-inter">
                  Confirm Password
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-sky-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field pl-10 pr-10 py-3 text-lg rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300 font-inter bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-sky-400 hover:text-purple-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-sky-400 hover:text-purple-600 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
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
                      Create account
                      <ArrowRight className="mt-2 ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-center text-gray-500 dark:text-gray-400 font-inter">
                By signing up, you agree to our{' '}
                <a href="#" className="text-sky-700 hover:text-purple-600">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-sky-700 hover:text-purple-600">Privacy Policy</a>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

export default SignupPage

