import React from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { addToast } from '../store/slices/uiSlice'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PageBackground from '../components/layout/PageBackground'

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(10, 'Please provide a detailed message'),
})

type ContactFormData = z.infer<typeof contactSchema>

const Contact: React.FC = () => {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const contactInfo = [
    {
      icon: Phone,
      title: '24/7 Support Hotline',
      details: '1-800-NOTARY-24',
      description: 'Available around the clock for urgent requests',
    },
    {
      icon: Mail,
      title: 'Email Support',
              details: 'support@notarette.com',
      description: 'Response within 2 hours during business hours',
    },
    {
      icon: MapPin,
      title: 'Service Area',
      details: 'All 50 States',
      description: 'Remote notarization available nationwide',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: '24/7 Operations',
      description: 'Licensed notaries available anytime',
    },
  ]

  const faqs = [
    {
      question: 'How does remote online notarization work?',
      answer: 'Remote online notarization uses secure video conferencing technology to connect you with a licensed notary public. After verifying your identity, the notary witnesses your signature electronically.',
    },
    {
      question: 'Is remote notarization legally valid?',
      answer: 'Yes, remote online notarization is legally recognized in most jurisdictions. We ensure full compliance with applicable state and federal regulations.',
    },
    {
      question: 'What documents can be notarized remotely?',
      answer: 'Most legal documents can be notarized remotely, including contracts, affidavits, powers of attorney, and more. Some restrictions may apply based on your jurisdiction.',
    },
    {
      question: 'How long does the process take?',
      answer: 'Most documents are processed within 2-4 hours during business hours. Rush processing is available for urgent requests.',
    },
  ]

  const onSubmit = async () => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      dispatch(addToast({
        type: 'success',
        title: 'Message sent successfully!',
        message: 'We\'ll get back to you within 2 hours.',
      }))
      
      reset()
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Failed to send message',
        message: 'Please try again or call our support line.',
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageBackground>
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Have questions about our services? Need help with an order? Our support team is here to help 24/7.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="text-center h-full">
                  <info.icon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {info.title}
                  </h3>
                  <p className="text-lg font-medium text-primary-600 mb-2">
                    {info.details}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {info.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Send us a Message
                </h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      {...register('name')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject
                    </label>
                    <input
                      {...register('subject')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="What can we help you with?"
                    />
                    {errors.subject && (
                      <p className="text-red-600 text-sm mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder="Please provide as much detail as possible..."
                    />
                    {errors.message && (
                      <p className="text-red-600 text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={loading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Quick Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <Card>
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Need Immediate Help?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      For urgent support, call our 24/7 hotline or start a live chat.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                      <Button variant="primary" className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                      <Button variant="secondary" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Live Chat
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Office Hours */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                When You Can Reach Us
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Emergency Support
                  </h3>
                  <p className="text-primary-600 font-medium mb-1">24/7 Available</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    For urgent notarization needs and technical issues
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    General Inquiries
                  </h3>
                  <p className="text-primary-600 font-medium mb-1">Mon-Sun, 6AM-10PM EST</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Questions about services and account support
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Sales Team
                  </h3>
                  <p className="text-primary-600 font-medium mb-1">Mon-Fri, 9AM-6PM EST</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Business solutions and custom packages
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </PageBackground>
  )
}

export default Contact