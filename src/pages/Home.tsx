import React from 'react'
import PageBackground from '../components/layout/PageBackground'

const Home: React.FC = () => {
  return (
    <PageBackground>
      <div className="flex items-center justify-center min-h-screen py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Notarette Express
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You are now authenticated. Navigate to Services to get started.
          </p>
          <a 
            href="/services" 
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Services
          </a>
        </div>
      </div>
    </PageBackground>
  )
}

export default Home