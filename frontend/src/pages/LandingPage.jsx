import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video,
  MessageSquare,
  Globe,
  PenTool,
  Monitor,
  Shield,
  Zap,
  Calendar,
  Users,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  RefreshCw,
  Smile,
  Languages
} from 'lucide-react'
import stringSimilarity from 'string-similarity'

// Import chatbot data
const chatbotResponses = {
  "what is smartcollab": 
    "💡 SmartCollab is an advanced collaborative platform designed to combine chatting, video meetings, task automation, and smart project management — all in one seamless workspace.",
  "features of smartcollab": 
    "⚙️ SmartCollab comes with real-time chat 💬, video conferencing 🎥, workflow automation ⚡, task management 📋, collaborative whiteboards 🧠, AI-based meeting transcription 🤖, and multilingual live translation 🌐.",
  "for whom it is made": 
    "👥 SmartCollab is made for everyone — students 👨‍🎓, professionals 👩‍💼, educators 👨‍🏫, startups 🚀, and teams that value seamless productivity and communication.",
  "paid user features": 
    "💎 Premium users unlock advanced AI task automation, detailed analytics 📊, unlimited meetings, priority translation, and customizable themes with enterprise-grade security 🔒.",
  "how it helps professionals": 
    "💼 SmartCollab boosts productivity for working professionals by reducing context switching — you can chat, manage projects, attend calls, and automate workflows from a single dashboard.",
  "is smartcollab open source": 
    "🧩 Yes! SmartCollab is open-source and community-driven. Developers can contribute, modify, and extend it according to their needs.",
  "smartcollab for education": 
    "🎓 In the education sector, SmartCollab connects teachers, students, and institutions in one platform — enabling interactive classes, project discussions, and AI-powered learning spaces.",
  "smartcollab paid plans": 
    "💰 SmartCollab's paid plans include unlimited team members, advanced automation tools, AI meeting notes, and personalized collaboration dashboards.",
  "how to use smartcollab": 
    "🚀 You can use SmartCollab directly from your browser or install it as a desktop app. Sign up, create a workspace, invite your team, and start collaborating instantly!",
  "benefits of smartcollab": 
    "🌟 SmartCollab enhances productivity, simplifies collaboration, and integrates multiple tools into one — saving time, improving focus, and making teamwork effortless."
}

const keywordMapping = {
  "what is smartcollab": ["smartcollab", "what's smartcollab", "about smartcollab", "smart colab", "smartclb", "smrtcollab", "collab meaning", "smart collaboration"],
  "features of smartcollab": ["features", "smartcollab features", "functions", "what can smartcollab do", "smartcollab options", "tools in smartcollab", "smartcollab capabilities"],
  "for whom it is made": ["who can use", "for who", "made for", "target audience", "user base", "use case", "who uses smartcollab", "best for", "for whom"],
  "paid user features": ["premium", "paid version", "subscription", "pro plan", "pricing", "smartcollab premium", "smartcollab plus", "paid upgrade"],
  "how it helps professionals": ["working professionals", "employees", "business use", "company use", "how it helps in office", "benefits for professionals", "career use", "corporate use", "smartcollab for business"],
  "is smartcollab open source": ["open source", "opensource", "free to use", "free version", "public repo", "github", "smartcollab code", "smartcollab open"],
  "smartcollab for education": ["education", "college", "school", "students", "teachers", "learning", "universities", "academic", "smartcollab in classroom"],
  "smartcollab paid plans": ["pricing", "plans", "payment", "upgrade", "cost", "fees", "smartcollab pricing"],
  "how to use smartcollab": ["how to start", "use smartcollab", "setup", "install", "login", "signup", "create account", "how to begin"],
  "benefits of smartcollab": ["advantages", "benefits", "why use", "pros", "good things", "why smartcollab", "how it helps"]
}

// ChatBot Component
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I am Mimi. How can I help you?" }
  ])
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)

  const getBestMatchResponse = (query) => {
    const lowerQuery = query.toLowerCase().trim()
    const allKeys = Object.keys(chatbotResponses)

    for (const key in keywordMapping) {
      if (keywordMapping[key].some((alt) => lowerQuery.includes(alt))) {
        return chatbotResponses[key]
      }
    }

    const bestMatch = stringSimilarity.findBestMatch(lowerQuery, allKeys)
    const { target, rating } = bestMatch.bestMatch
    if (rating > 0.45) return chatbotResponses[target]

    const allAlternatives = []
    for (const key in keywordMapping) {
      keywordMapping[key].forEach((alt) => allAlternatives.push({ alt, key }))
    }

    const bestAltMatch = stringSimilarity.findBestMatch(lowerQuery, allAlternatives.map(a => a.alt))
    if (bestAltMatch.bestMatch.rating > 0.5) {
      const matchedKey = allAlternatives.find(a => a.alt === bestAltMatch.bestMatch.target)?.key
      if (matchedKey) return chatbotResponses[matchedKey]
    }

    return null
  }

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Sorry, your browser doesn't support voice recognition.")
      return
    }

    const recognition = new window.webkitSpeechRecognition()
    recognition.lang = "en-IN"
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      handleSend(transcript)
    }

    recognition.start()
    recognitionRef.current = recognition
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const speakResponse = (text) => {
    if (!window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-IN"
    utterance.rate = 1.0
    utterance.pitch = 1
    setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const handleSend = (customText = null) => {
    const messageText = customText || input
    if (!messageText.trim()) return

    const userMsg = { sender: "user", text: messageText }
    setMessages((prev) => [...prev, userMsg])

    const response = getBestMatchResponse(messageText)
    const botReply = response
      ? response
      : "Hmm 🤔 I didn't quite catch that. Try asking about SmartCollab's features, pricing, or who it's made for!"

    const botMsg = { sender: "bot", text: botReply }
    setTimeout(() => {
      setMessages((prev) => [...prev, botMsg])
      speakResponse(botReply)
    }, 600)

    setInput("")
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl hover:scale-110 transition-transform z-50"
      >
        {isOpen ? <X size={22} /> : <Bot size={22} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 z-50">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 font-semibold text-center">
            SmartCollab Assistant 🤖
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 h-96">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm transition-all duration-300 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex items-center bg-white dark:bg-gray-900">
            <button
              onClick={listening ? stopListening : startListening}
              className={`p-2 rounded-full mr-2 ${
                listening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
              title={listening ? "Stop Listening" : "Speak"}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              placeholder="Type or speak..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none text-gray-900 dark:text-white"
            />

            <button
              onClick={() => handleSend()}
              className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              title="Send Message"
            >
              <Send size={16} />
            </button>

            <button
              onClick={() => speakResponse("SmartCollab is ready to assist you.")}
              disabled={speaking}
              className="ml-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              title="Play Welcome"
            >
              <Volume2 size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// System Design Animation Component
const SystemDesignAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const startAnimation = () => {
    setIsAnimating(true)
    setCurrentStep(0)
  }

  useEffect(() => {
    if (!isAnimating) return

    if (currentStep < 5) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 800)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setCurrentStep(0)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isAnimating, currentStep])

  useEffect(() => {
    startAnimation()
  }, [])

  const modules = [
    { icon: Languages, label: 'Translation Engine', color: 'from-blue-500 to-cyan-500', description: 'Detects & converts languages instantly' },
    { icon: Shield, label: 'Profanity Filter', color: 'from-green-500 to-emerald-500', description: 'Keeps communication professional' },
    { icon: Smile, label: 'Emotion Detection', color: 'from-pink-500 to-rose-500', description: 'Analyzes tone for better response' }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
  {/* Animated background */}
  <div className="absolute inset-0 opacity-20">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse blur-3xl" />
  </div>

  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      className="text-center mb-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
        How SmartCollab Works
      </h2>
      <p className="text-lg text-gray-300 max-w-2xl mx-auto">
        AI-powered translation, real-time communication, and seamless collaboration
      </p>
    </motion.div>

    {/* System Flow Diagram */}
    <div className="relative">
      <div className="flex items-center justify-between gap-4 flex-wrap lg:flex-nowrap">
        {/* User A */}
        <motion.div
          className="flex flex-col items-center"
          animate={{ x: [ -20, 0, -20 ], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl ring-4 ring-blue-400 animate-pulse">
            <Users className="w-10 h-10 text-white" />
          </div>
          <p className="text-white font-semibold mt-3">User A</p>
          <p className="text-gray-400 text-sm">Sender</p>
        </motion.div>

        {/* Arrow 1 */}
        <motion.div className="flex-1 hidden lg:block relative h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded">
          <motion.div
            className="absolute w-4 h-4 rounded-full bg-blue-400 shadow-lg shadow-blue-500"
            animate={{ x: [0, 200, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          />
        </motion.div>

        {/* SmartCollab Server */}
        <motion.div
          className="flex flex-col items-center"
          animate={{ y: [ -10, 0, -10 ], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }}
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl ring-4 ring-purple-400 animate-pulse">
            <Monitor className="w-12 h-12 text-white" />
          </div>
          <p className="text-white font-semibold mt-3">SmartCollab Server</p>
          <p className="text-gray-400 text-sm">Backend Processing</p>
        </motion.div>

        {/* Arrow 2 */}
        <motion.div className="flex-1 hidden lg:block relative h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded">
          <motion.div
            className="absolute w-4 h-4 rounded-full bg-purple-400 shadow-lg shadow-purple-500"
            animate={{ x: [0, 200, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear', delay: 0.5 }}
          />
        </motion.div>

        {/* User B */}
        <motion.div
          className="flex flex-col items-center"
          animate={{ x: [ 20, 0, 20 ], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-2xl ring-4 ring-pink-400 animate-pulse">
            <Users className="w-10 h-10 text-white" />
          </div>
          <p className="text-white font-semibold mt-3">User B</p>
          <p className="text-gray-400 text-sm">Receiver</p>
        </motion.div>
      </div>

      {/* AI Modules Below Server */}
      <motion.div
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        animate={{ opacity: [0.8, 1, 0.8], y: [10, 0, 10] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      >
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 ring-2 ring-white/50 scale-105"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${module.color} flex items-center justify-center mb-4 shadow-lg animate-pulse`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{module.label}</h3>
              <p className="text-gray-400 text-sm">{module.description}</p>
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{ opacity: [0, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${module.color} opacity-20 blur-xl`} />
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* Status Message */}
      <motion.div
        className="mt-12 text-center"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        <div className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-500/50 rounded-full px-6 py-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-semibold">Translated, filtered, and delivered in real-time 🚀</span>
        </div>
      </motion.div>
    </div>
  </div>
</section>
  )
}

// 3D Sphere Rotating Cards Component
const SphereRotatingCards = () => {
  const features = [
    {
      id: 1,
      title: 'Language Translation',
      description: 'Real-time translation for 50+ languages',
      icon: Globe,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Profanity Filtering',
      description: 'AI-powered content moderation',
      icon: Shield,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 3,
      title: 'Dashboard Monitoring',
      description: 'Comprehensive analytics insights',
      icon: Monitor,
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      id: 4,
      title: 'Emotion Detection',
      description: 'AI emotion analysis for engagement',
      icon: Smile,
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      id: 5,
      title: 'Smart Whiteboard',
      description: 'Collaborative digital whiteboard',
      icon: PenTool,
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      id: 6,
      title: 'Live Translation',
      description: 'Real-time speech translation',
      icon: MessageSquare,
      gradient: 'from-indigo-500 to-blue-500'
    }
  ]

  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Smart Collaboration Features
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powered by advanced AI to enhance your team's productivity and communication
          </p>
        </motion.div>

        <div className="relative h-[600px] flex items-center justify-center" style={{ perspective: '1200px' }}>
          <div className="relative w-full h-full max-w-2xl">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const angle = (index * 60 + rotation) * (Math.PI / 180)
              const radius = 280
              const x = Math.sin(angle) * radius
              const z = Math.cos(angle) * radius
              const y = Math.sin(angle * 2) * 80
              
              const scale = (z + radius) / (radius * 2)
              const opacity = Math.max(0.3, scale)
              const blur = (1 - scale) * 4

              return (
                <motion.div
                  key={feature.id}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`,
                    zIndex: Math.round(z),
                    opacity: opacity,
                    filter: `blur(${blur}px)`
                  }}
                >
                  <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 w-64 transition-all duration-300 hover:scale-110 hover:shadow-3xl`}>
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

const LandingPage = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager at TechCorp',
      content: 'SmartCollab has revolutionized how our global team collaborates. The real-time translation feature is a game-changer!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
    },
    {
      name: 'Michael Chen',
      role: 'Engineering Lead at StartupXYZ',
      content: 'The AI-powered meeting notes and task automation have saved us hours every week. Incredible productivity boost!',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Design Director at CreativeStudio',
      content: 'The whiteboarding feature is amazing for design reviews. Our remote team feels more connected than ever.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    }
  ]

  return (
    <>
      <Helmet>
        <title>SmartCollab - AI-Powered Collaboration Platform</title>
        <meta name="description" content="Collaborate smarter with AI-powered meetings, multilingual chat, and seamless teamwork. Join thousands of teams already using SmartCollab." />
        <meta name="keywords" content="video meetings, team collaboration, AI translation, remote work, productivity" />
        <meta property="og:title" content="SmartCollab - Collaborate Smarter. Connect Globally." />
        <meta property="og:description" content="AI-powered meetings, multilingual chat, and seamless teamwork in one platform." />
      </Helmet>

      <div className="relative min-h-screen bg-white dark:bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 -z-10" />
        
        {/* Navigation */}
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SmartCollab</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#solutions" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Solutions</a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Pricing</a>
                <a href="#resources" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Resources</a>
                <a href="#enterprise" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Enterprise</a>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl">
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(147,51,234,0.15),transparent_50%)]" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Collaborate Smarter.
                  </span>
                  <br />
                  <span className="text-gray-900 dark:text-white">Connect Globally.</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  AI-powered meetings, multilingual chat, and seamless teamwork in one platform. 
                  Break down barriers and boost productivity with intelligent collaboration tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup" className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl inline-flex items-center justify-center">
                    Start Meeting
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold px-8 py-4 rounded-xl transition-all duration-300 inline-flex items-center justify-center">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </button>
                  <Link to="/login" className="bg-white dark:bg-gray-800 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold px-8 py-4 rounded-xl transition-all duration-300">
                    Try Free
                  </Link>
                </div>
                
                
              </motion.div>
            </div>
          </div>
        </section>

        {/* System Design Animation Section */}
        <SystemDesignAnimation />

        {/* 3D Sphere Rotating Cards */}
        <SphereRotatingCards />

        {/* AI Translation Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  Break down language barriers with AI
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Our advanced AI translation engine supports over 50 languages, enabling seamless 
                  communication across global teams. Real-time translation in chat, voice, and video calls.
                </p>
                <ul className="space-y-4">
                  {[
                    'Real-time voice translation during calls',
                    'Instant chat message translation',
                    'Automatic meeting transcription & translation',
                    'Support for 50+ languages including regional dialects'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Team Chat</span>
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">Great job on the presentation!</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Sarah • English</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">¡Excelente trabajo en la presentación!</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Auto-translated to Spanish</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">プレゼンテーション、お疲れ様でした!</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Kenji • Japanese → English: "Great work on the presentation!"</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* AI Productivity Section */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                AI-powered productivity that works for you
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Let AI handle the routine tasks so you can focus on what matters most - collaboration and innovation.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  Icon: Zap,
                  title: 'Smart Meeting Notes',
                  description: 'AI automatically generates meeting summaries, action items, and follow-up tasks from your conversations.',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  Icon: Calendar,
                  title: 'Intelligent Scheduling',
                  description: 'Find the perfect meeting time across time zones with AI-powered scheduling suggestions.',
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  Icon: Users,
                  title: 'Team Insights',
                  description: 'Get actionable insights about team collaboration patterns and productivity metrics.',
                  color: 'from-orange-500 to-amber-500'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Trusted by teams worldwide
              </h2>
              <div className="flex items-center justify-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-gray-600 dark:text-gray-300">4.9/5 from 10,000+ reviews</span>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div 
                  key={index} 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">"{testimonial.content}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoNnYzMGgtNnpNNDggMzBoNnYzMGgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Start your free trial today. Collaborate without limits.
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of teams already using SmartCollab to work smarter, not harder.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl inline-flex items-center justify-center group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-xl transition-all duration-300">
                  Sign In
                </Link>
              </div>
              <p className="text-blue-100 text-sm mt-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <span className="text-xl font-bold">SmartCollab</span>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  AI-powered collaboration platform for modern teams.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-lg">Product</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-lg">Company</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-lg">Support</h3>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>&copy; 2025 SmartCollab. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* ChatBot Component */}
        <ChatBot />
      </div>
    </>
  )
}

export default LandingPage