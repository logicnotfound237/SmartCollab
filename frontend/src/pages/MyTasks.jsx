import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../components/Layout';
import { Plus, Filter, Search, Calendar, Clock, CheckCircle, Circle, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyTasks = () => {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium',
    dueDate: '',
    project: ''
  })

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, filter, searchTerm])

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks')
      setTasks(response.data)
    } catch (error) {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = tasks

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(task => task.status === filter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.project.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTasks(filtered)
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/tasks', newTask)
      setTasks([...tasks, response.data])
      setNewTask({ title: '', priority: 'medium', dueDate: '', project: '' })
      setShowNewTaskModal(false)
      toast.success('Task created successfully!')
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, { status: newStatus })
      setTasks(tasks.map(task => 
        task.id === taskId ? response.data : task
      ))
      toast.success('Task updated successfully!')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const taskStats = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
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

  return (
    <>
      <Helmet>
        <title>My Tasks - SmartCollab</title>
        <meta name="description" content="Manage your tasks and stay productive with SmartCollab's task management system." />
      </Helmet>
      <Layout>
        <div className="relative min-h-screen p-6 space-y-6 overflow-hidden bg-gradient-to-br from-white via-sky-50 to-purple-100 dark:from-black dark:via-gray-900 dark:to-sky-950">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(147,51,234,0.12),transparent_50%)]" />
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between z-20 relative">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-poppins">My Tasks</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-inter">Manage and track your tasks efficiently</p>
            </div>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="btn-primary mt-4 sm:mt-0 inline-flex items-center text-lg font-semibold rounded-xl bg-gradient-to-r from-sky-700 to-purple-600 hover:from-purple-600 hover:to-sky-700 text-white px-6 py-3 shadow-lg font-poppins transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Task
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 z-20 relative">
            <div className="card text-center shadow-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-7 font-poppins">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{taskStats.all}</p>
              <p className="text-base text-gray-600 dark:text-gray-400">Total Tasks</p>
            </div>
            <div className="card text-center shadow-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-7 font-poppins">
              <p className="text-3xl font-bold text-orange-600">{taskStats.pending}</p>
              <p className="text-base text-gray-600 dark:text-gray-400">Pending</p>
            </div>
            <div className="card text-center shadow-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-7 font-poppins">
              <p className="text-3xl font-bold text-blue-600">{taskStats['in-progress']}</p>
              <p className="text-base text-gray-600 dark:text-gray-400">In Progress</p>
            </div>
            <div className="card text-center shadow-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-7 font-poppins">
              <p className="text-3xl font-bold text-green-600">{taskStats.completed}</p>
              <p className="text-base text-gray-600 dark:text-gray-400">Completed</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="card shadow-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-6 z-20 relative font-inter">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg font-inter"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg font-inter"
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="card shadow-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-6 z-20 relative font-inter">
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2 font-poppins">No tasks found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || filter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Create your first task to get started!'
                    }
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-sky-50 dark:bg-gray-800/60 rounded-lg hover:bg-sky-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleUpdateTaskStatus(
                          task.id, 
                          task.status === 'completed' ? 'pending' : 'completed'
                        )}
                        className="flex-shrink-0"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-medium font-poppins ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-inter">{task.project}</span>
                          {task.dueDate && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 font-inter">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)} font-inter`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* New Task Modal */}
        {showNewTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-sky-100 dark:border-gray-800">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 font-poppins">Create New Task</h2>
              <form onSubmit={handleCreateTask} className="space-y-5 font-inter">
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="input-field text-lg"
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="input-field text-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="input-field text-lg"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
                  <input
                    type="text"
                    value={newTask.project}
                    onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                    className="input-field text-lg"
                    placeholder="Enter project name"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewTaskModal(false)}
                    className="btn-secondary text-lg font-inter"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-lg font-poppins">
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}

export default MyTasks

