import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, Award, Clock, CheckCircle, Globe } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import PageBackground from '../components/layout/PageBackground'

const About: React.FC = () => {
  const stats = [
    { label: 'Documents Notarized', value: '50,000+', icon: CheckCircle },
    { label: 'Licensed Notaries', value: '200+', icon: Users },
    { label: 'States Covered', value: '50', icon: Globe },
    { label: 'Average Response Time', value: '2-4 hrs', icon: Clock },
  ]

  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Bank-grade encryption and secure processes protect your sensitive documents and personal information at every step.',
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Our licensed notary publics are available around the clock to handle your urgent document needs.',
    },
    {
      icon: Award,
      title: 'Legal Compliance',
      description: 'Full compliance with state and federal regulations ensures your documents are legally valid and enforceable.',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Our team of licensed professionals brings years of experience and expertise to every notarization.',
    },
  ]

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1',
      bio: 'Former legal professional with 15+ years in document management and compliance.',
    },
    {
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1',
      bio: 'Security expert specializing in encryption and secure document processing systems.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Notary Services',
      image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1',
      bio: 'Licensed notary public with expertise in remote online notarization regulations.',
    },
  ]

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
              About Notarette Express
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're revolutionizing the notarization process with secure, convenient, and legally compliant 
              remote online notarization services available 24/7.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                At Notarette Express, we believe that getting documents notarized should be simple, secure, and accessible 
                to everyone, regardless of location or schedule. Our mission is to provide the most reliable, 
                efficient, and legally compliant remote online notarization services.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                We combine cutting-edge technology with the expertise of licensed notary publics to deliver 
                a seamless experience that saves time while maintaining the highest standards of security and legal validity.
              </p>
              <Button variant="primary" size="lg">
                Get Started Today
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1"
                alt="Professional notary service"
                className="rounded-lg shadow-xl"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              These principles guide everything we do and ensure we deliver the highest quality service to our clients.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card hover className="text-center h-full">
                  <value.icon className="w-12 h-12 text-primary-600 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Leadership Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our experienced team combines legal expertise, technology innovation, and customer service excellence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card hover className="text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
                    loading="lazy"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {member.bio}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-700 to-primary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Experience the Future of Notarization?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Notarette Express for their document notarization needs.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-50">
                Get Started Now
              </Button>
              <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageBackground>
  )
}

export default About