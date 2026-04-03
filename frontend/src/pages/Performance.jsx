import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import Layout from '../components/Layout'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Calendar, 
  Users, 
  CheckCircle,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react'
import axios from 'axios'

const Performance = () => {
  const [performanceData, setPerformanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      const response = await axios.get('/api/performance')
      setPerformanceData(response.data)
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 ${color} rounded-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium ml-1">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  )

  const WeeklyChart = ({ data }) => {
    const maxHours = Math.max(...data.map(d => d.hours))
    
    return (
      <div className="space-y-3">
        {data.map((day, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
              {day.day}
            </div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(day.hours / maxHours) * 100}%` }}
              ></div>
            </div>
            <div className="w-16 text-sm text-gray-900 dark:text-white font-medium">
              {day.hours}h
            </div>
            <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
              {day.tasks} tasks
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!performanceData) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No performance data available</h3>
            <p className="text-gray-600 dark:text-gray-400">Start working to see your performance metrics.</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Helmet>
        <title>Performance - SmartCollab</title>
        <meta name="description" content="Track your productivity and performance metrics with detailed analytics and insights." />
      </Helmet>
      
      <Layout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your productivity and achievements</p>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Clock}
              title="Active Hours"
              value={`${performanceData.weeklyActiveHours}h`}
              subtitle="This week"
              color="bg-blue-500"
              trend={12}
            />
            
            <StatCard
              icon={CheckCircle}
              title="Tasks Completed"
              value={performanceData.tasksCompleted}
              subtitle={`${performanceData.tasksInProgress} in progress`}
              color="bg-green-500"
              trend={8}
            />
            
            <StatCard
              icon={Target}
              title="Productivity Score"
              value={`${performanceData.productivityScore}%`}
              subtitle="Above average"
              color="bg-purple-500"
              trend={5}
            />
            
            <StatCard
              icon={Calendar}
              title="Daily Logins"
              value={performanceData.dailyLogins}
              subtitle="This month"
              color="bg-orange-500"
              trend={-2}
            />
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Activity</h2>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              <WeeklyChart data={performanceData.weeklyStats} />
            </div>

            {/* Performance Insights */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Insights</h2>
                <Zap className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900 dark:text-white">Peak productivity hours</span>
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">9-11 AM</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900 dark:text-white">Average task completion</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{performanceData.averageTaskTime}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900 dark:text-white">Most productive day</span>
                  </div>
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Wednesday</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-900 dark:text-white">Focus time blocks</span>
                  </div>
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">2.5h avg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Achievements</h2>
              <Award className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performanceData.recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{achievement}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Earned today</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals and Targets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weekly Goals</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Complete 20 tasks</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{performanceData.tasksCompleted}/20</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(performanceData.tasksCompleted / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Work 40 hours</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{performanceData.weeklyActiveHours}/40h</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(performanceData.weeklyActiveHours / 40) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Login daily</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">7/7 days</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Team Comparison</h2>
              
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    #{Math.floor(Math.random() * 5) + 1}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Your team ranking</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Productivity vs team avg</span>
                    <span className="text-sm font-medium text-green-600">+12%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Tasks completed vs team</span>
                    <span className="text-sm font-medium text-blue-600">+8%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active hours vs team</span>
                    <span className="text-sm font-medium text-purple-600">+5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default Performance

