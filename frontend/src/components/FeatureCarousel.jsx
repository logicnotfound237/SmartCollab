import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FeatureCarousel = () => {
  const features = [
    {
      id: 1,
      title: 'Language Translation',
      description: 'Real-time translation for 50+ languages in chats and documents',
      icon: '🌐',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Profanity Filtering',
      description: 'AI-powered content moderation to maintain professional communication',
      icon: '🛡️',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 3,
      title: 'Dashboard Monitoring',
      description: 'Comprehensive analytics and team performance insights',
      icon: '📊',
      color: 'from-purple-500 to-violet-500'
    },
    {
      id: 4,
      title: 'Emotion Detection',
      description: 'AI emotion analysis for better meeting engagement and feedback',
      icon: '😊',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 5,
      title: 'Smart Whiteboard',
      description: 'Collaborative digital whiteboard with AI-assisted drawing',
      icon: '🎨',
      color: 'from-orange-500 to-amber-500'
    },
    {
      id: 6,
      title: 'Live Translation',
      description: 'Real-time speech translation during video calls and meetings',
      icon: '🎤',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex]);

  return (
    <section className="py-16 bg-gradient-to-b from-background-light to-white dark:from-background-dark dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground-light dark:text-foreground-dark sm:text-4xl">
            Smart Collaboration Features
          </h2>
          <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
            Powered by advanced AI to enhance your team's productivity and communication
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Carousel Track */}
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-background-card-light dark:bg-background-card-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-8 border border-border-light dark:border-border-dark">
                    <div className="text-center">
                      <div className={`text-4xl mb-4 inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} text-white`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-border-light dark:border-border-dark"
          >
            <ChevronLeft className="w-5 h-5 text-text-primary-light dark:text-text-primary-dark" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-border-light dark:border-border-dark"
          >
            <ChevronRight className="w-5 h-5 text-text-primary-light dark:text-text-primary-dark" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-3">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-gradient-to-r from-primary-brand to-accent-700'
                    : 'bg-border-light dark:bg-border-dark hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Feature Grid for Larger Screens */}
        <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-6 mt-12">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-background-card-light dark:bg-background-card-dark rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-border-light dark:border-border-dark hover:translate-y-[-4px]"
            >
              <div className={`text-3xl mb-4 inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                {feature.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCarousel;