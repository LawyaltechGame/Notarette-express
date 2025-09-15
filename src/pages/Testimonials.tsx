import React from 'react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

type Testimonial = {
  quote: string
  name: string
  role: string
  avatar: string
  rating?: number
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Seamless from start to finish. The notary guided me through everything and I had my notarized documents the same day.',
    name: 'Emily Carter',
    role: 'Startup Founder',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
    rating: 5,
  },
  {
    quote:
      'Professional, fast, and secure. The online process was incredibly convenient and transparent throughout.',
    name: 'Daniel Schmidt',
    role: 'Real Estate Agent',
    avatar:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=256&auto=format&fit=crop',
    rating: 5,
  },
  {
    quote:
      'I loved the clear pricing and quick turnaround. Customer support was responsive and helpful.',
    name: 'Priya Nair',
    role: 'Legal Consultant',
    avatar:
      'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=256&auto=format&fit=crop',
    rating: 5,
  },
  {
    quote:
      'The best notarization experience I’ve had. Smooth uploads, easy scheduling, and secure delivery.',
    name: 'James O’Neill',
    role: 'Finance Manager',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop',
    rating: 5,
  },
]

const TestimonialsPage: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      {/* Background inspired by Services page */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-indigo-950/30">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%236366f1\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M30 30c0-16.569 13.431-30 30-30v30H30zm30 30c-16.569 0-30-13.431-30-30h30v30z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      {/* Floating accents */}
      <div className="pointer-events-none absolute top-24 left-12 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-xl" />
      <div className="pointer-events-none absolute top-40 right-24 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-blue-500/10 rounded-full blur-xl" />
      <div className="pointer-events-none absolute bottom-24 left-1/4 w-28 h-28 bg-gradient-to-br from-teal-400/10 to-cyan-500/10 rounded-full blur-xl" />

      <div className="relative z-10">
        {/* Hero */}
        <section className="pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Real Stories. Real Results.</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent leading-tight mb-4">
                What Clients Say About Us
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Trusted by individuals and businesses for fast, secure, and professional notarization.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Highlight metrics */}
        <section className="pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Average Rating', value: '4.9/5' },
                { label: 'Documents Notarized', value: '25,000+' },
                { label: 'Response Time', value: '~5 min' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 p-6 text-center shadow-sm"
                >
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials horizontal marquee */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Customer Testimonials</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full" />
            </div>

            {/* Marquee container */}
            <div className="relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl shadow-blue-500/5 p-2 md:p-4">
              {/* Gradient edges */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/80 dark:from-gray-800/80 to-transparent z-10 rounded-l-3xl" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white/80 dark:from-gray-800/80 to-transparent z-10 rounded-r-3xl" />

              <motion.div
                initial={{ x: 0 }}
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 35, ease: 'linear', repeat: Infinity }}
                className="flex gap-6 w-[200%]"
              >
                {[...testimonials, ...testimonials].map((t, idx) => (
                  <div
                    key={idx}
                    className="group shrink-0 w-80 sm:w-96 snap-start relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{t.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">“{t.quote}”</p>
                    {t.rating && (
                      <div className="mt-4 flex items-center gap-1">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <span key={i} className="text-amber-400">★</span>
                        ))}
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{t.rating}.0</span>
                      </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-blue-500/5 to-indigo-500/5" />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-10 md:p-14"
            >
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">Join our happy customers</h3>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                Start your notarization in minutes and experience dedicated support at every step.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/services">
                  <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white hover:text-blue-700">
                    How It Works
                  </Button>
                </Link>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default TestimonialsPage
