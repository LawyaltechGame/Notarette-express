import React from 'react'
import { motion, useInView } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import Card from '../ui/Card'

const Testimonials: React.FC = () => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'Notarette Express saved me so much time! I was able to get my business documents notarized from home while juggling client calls. The process was seamless and the notary was professional.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Real Estate Agent',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'As a real estate agent, I need documents notarized quickly and reliably. Notarette Express delivers every time. The 24/7 availability is a game-changer for urgent deals.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Remote Worker',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      content: 'Living in a remote area, finding a notary was always a challenge. Notarette Express made it so easy - I completed everything online in under an hour. Highly recommended!',
      rating: 5,
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust Notarette Express for their document notarization needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card hover className="h-full">
                <div className="flex flex-col h-full">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-primary-600 mb-4" />

                  {/* Content */}
                  <blockquote className="flex-1 text-gray-700 leading-relaxed mb-6">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-primary-600 mb-1">4.9/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 mb-1">50K+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 mb-1">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials