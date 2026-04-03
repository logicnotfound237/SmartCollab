import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../components/Layout';
import { Plus, Search, Calendar, Users, TrendingUp, Clock, FolderOpen, MoreHorizontal, Edit3, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    deadline: '',
    description: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm])

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects')
      setProjects(response.data)
    } catch (error) {
      toast.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProjects(filtered)
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/projects', newProject)
      setProjects([...projects, response.data])
      setNewProject({ name: '', deadline: '', description: '' })
      setShowNewProjectModal(false)
      toast.success('Project created successfully!')
    } catch (error) {
      toast.error('Failed to create project')
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'on hold':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
    }
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
        <title>Projects - SmartCollab</title>
        <meta name="description" content="Manage your projects and track progress with SmartCollab's project management tools." />
      </Helmet>
      <Layout>
        <div className="relative min-h-screen p-6 space-y-6 overflow-hidden bg-gradient-to-br from-white via-sky-50 to-purple-100 dark:from-black dark:via-gray-900 dark:to-sky-950">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(147,51,234,0.12),transparent_50%)]" />
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between z-20 relative">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-poppins">Projects</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-inter">Manage and track your project progress</p>
            </div>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="btn-primary mt-4 sm:mt-0 inline-flex items-center text-lg font-semibold rounded-xl bg-gradient-to-r from-sky-700 to-purple-600 hover:from-purple-600 hover:to-sky-700 text-white px-6 py-3 shadow-lg font-poppins transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 z-20 relative">
            <div className="card text-center shadow-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-7 font-poppins">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg inline-block mb-2">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
              <p className="text-base text-gray-600 dark:text-gray-400">Total Projects</p>
            </div>
            <div className="card text-center shadow-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-7 font-poppins">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg inline-block mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {projects.filter(p => p.status === 'In Progress').length}
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">Active Projects</p>
            </div>
            <div className="card text-center shadow-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-7 font-poppins">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg inline-block mb-2">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length || 0)}%
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">Avg Progress</p>
            </div>
            <div className="card text-center shadow-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-7 font-poppins">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg inline-block mb-2">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {projects.reduce((acc, p) => acc + p.team.length, 0)}
              </p>
              <p className="text-base text-gray-600 dark:text-gray-400">Team Members</p>
            </div>
          </div>

          {/* Search */}
          <div className="card shadow-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-6 z-20 relative font-inter">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg font-inter"
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-20 relative">
            {filteredProjects.map((project) => {
              const daysUntilDeadline = getDaysUntilDeadline(project.deadline)
              return (
                <div key={project.id} className="card hover:shadow-2xl transition-shadow duration-300 shadow-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-7 font-inter border border-sky-100 dark:border-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-poppins">
                        {project.name}
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-400 mb-3 font-inter">
                        {project.description}
                      </p>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-medium text-gray-700 dark:text-gray-300 font-inter">Progress</span>
                      <span className="text-base font-medium text-gray-900 dark:text-white font-poppins">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${getProgressColor(project.progress)}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)} font-inter`}>
                        {project.status}
                      </span>
                      <div className="flex items-center text-base text-gray-600 dark:text-gray-400 font-inter">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className={daysUntilDeadline < 0 ? 'text-red-600' : daysUntilDeadline < 7 ? 'text-yellow-600' : ''}>
                          {daysUntilDeadline < 0 
                            ? `${Math.abs(daysUntilDeadline)} days overdue`
                            : daysUntilDeadline === 0 
                            ? 'Due today'
                            : `${daysUntilDeadline} days left`
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-base text-gray-600 dark:text-gray-400 font-inter">
                          {project.team.length} member{project.team.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member, index) => (
                          <div
                            key={index}
                            className="w-7 h-7 bg-primary-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-sm text-white font-medium font-poppins"
                            title={member}
                          >
                            {member.charAt(0)}
                          </div>
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-7 h-7 bg-gray-400 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-sm text-white font-medium font-poppins">
                            +{project.team.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Edit3 className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2 font-poppins">No projects found</h3>
              <p className="text-gray-600 dark:text-gray-400 font-inter">
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : 'Create your first project to get started!'
                }
              </p>
            </div>
          )}
        </div>

        {/* New Project Modal */}
        {showNewProjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-sky-100 dark:border-gray-800">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 font-poppins">Create New Project</h2>
              <form onSubmit={handleCreateProject} className="space-y-5 font-inter">
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="input-field text-lg"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    required
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    className="input-field text-lg"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="input-field text-lg"
                    rows="3"
                    placeholder="Enter project description"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(false)}
                    className="btn-secondary text-lg font-inter"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-lg font-poppins">
                    Create Project
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

export default Projects

