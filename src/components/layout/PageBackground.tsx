import React from 'react'

interface PageBackgroundProps {
  children: React.ReactNode
  className?: string
}

const PageBackground: React.FC<PageBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Modern gradient background with mesh pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%236366f1\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M30 30c0-16.569 13.431-30 30-30v30H30zm30 30c-16.569 0-30-13.431-30-30h30v30z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      {/* Floating geometric elements */}
      <div className="pointer-events-none absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-400/10 to-primary-200/10 rounded-full blur-xl" />
      <div className="pointer-events-none absolute top-40 right-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-300/10 rounded-full blur-xl" />
      <div className="pointer-events-none absolute bottom-20 left-1/4 w-28 h-28 bg-gradient-to-br from-primary-400/10 to-primary-200/10 rounded-full blur-xl" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default PageBackground
