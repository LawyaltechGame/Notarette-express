import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, HelpCircle, FileText, Shield, Clock, CreditCard, Mail, Phone } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const FAQ: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const faqData: FAQItem[] = [
    // General Questions
    {
      question: "What is Notarette Express?",
      answer: "Notarette Express is a professional online notarization service that provides secure, fast, and reliable document notarization services. We offer a wide range of notarization services including power of attorney, document certification, apostille services, and more, all accessible from the comfort of your home or office.",
      category: "general"
    },
    {
      question: "How does online notarization work?",
      answer: "Online notarization works through secure video conferencing technology. After you upload your documents and complete identity verification (KYC), you'll meet with a certified notary public via video call. The notary will verify your identity, witness your signature, and provide you with a notarized copy of your document.",
      category: "general"
    },
    {
      question: "Is online notarization legally valid?",
      answer: "Yes, online notarization is legally valid in most jurisdictions. We follow all applicable laws and regulations, and our notaries are certified professionals. The notarized documents we provide are legally binding and accepted by government agencies, courts, and other institutions.",
      category: "general"
    },

    // Services
    {
      question: "What services do you offer?",
      answer: "We offer a comprehensive range of notarization services including Power of Attorney, Document Certification, Passport/ID Certification, Online Content Notarization, Signature Notarization, Apostille Services, Contract Certification, Notarized Sworn Translation, Company Registration, and Vital Certificates Replacement.",
      category: "services"
    },
    {
      question: "Can you notarize any type of document?",
      answer: "We can notarize most types of documents including contracts, agreements, affidavits, power of attorney documents, and more. However, some documents may have specific requirements or restrictions. If you're unsure, please contact our support team for guidance.",
      category: "services"
    },
    {
      question: "Do you offer rush services?",
      answer: "Yes, we offer rush services for most of our notarization services. Rush service typically reduces processing time by 50% or more. You can select this option when placing your order, and the additional fee will be clearly displayed.",
      category: "services"
    },

    // Process & Requirements
    {
      question: "What documents do I need for identity verification?",
      answer: "For identity verification, you'll need a government-issued photo ID such as a passport, driver's license, or state ID. We may also require proof of address. All documents must be current and valid.",
      category: "process"
    },
    {
      question: "How long does the notarization process take?",
      answer: "The complete process typically takes 1-4 hours depending on the service type and whether you choose rush service. Document review and KYC verification usually take 1-2 hours, while the actual notarization session takes 15-30 minutes.",
      category: "process"
    },
    {
      question: "Do I need to be present during notarization?",
      answer: "Yes, you must be present during the notarization session via video call. This is a legal requirement to ensure the notary can properly verify your identity and witness your signature in real-time.",
      category: "process"
    },

    // Pricing & Payment
    {
      question: "How much do your services cost?",
      answer: "Our pricing varies by service type and ranges from €20 to €80. Additional fees apply for extra pages, rush service, and courier delivery. All prices are clearly displayed before you place your order, with no hidden fees.",
      category: "pricing"
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (VISA, Mastercard, American Express), PayPal, bank transfers, and cryptocurrency. Payment is processed securely through Stripe, and we also offer alternative payment arrangements for business clients.",
      category: "pricing"
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 7-day money-back guarantee. If you're not satisfied with our service, you can request a full refund within 7 days of your order. Please contact our customer support team to initiate the refund process.",
      category: "pricing"
    },

    // Security & Privacy
    {
      question: "How secure is my information?",
      answer: "We use bank-level security measures including 256-bit SSL encryption, secure data centers, and strict access controls. Your personal information and documents are never shared with third parties, and we comply with all applicable privacy laws and regulations.",
      category: "security"
    },
    {
      question: "What happens to my documents after notarization?",
      answer: "After notarization, we securely store your documents for 7 years as required by law. You can download your notarized documents immediately, and we also provide secure cloud storage for easy access. Documents are automatically deleted after the retention period.",
      category: "security"
    },
    {
      question: "Are my documents stored securely?",
      answer: "Yes, all documents are stored in secure, encrypted cloud storage with multiple layers of security. We use industry-standard encryption and security protocols to ensure your documents remain confidential and protected.",
      category: "security"
    },

    // Support & Contact
    {
      question: "How can I contact customer support?",
      answer: "You can reach our customer support team through multiple channels: email at support@notarette.com, live chat on our website, or by phone during business hours. We also offer 24/7 emergency support for urgent matters.",
      category: "support"
    },
    {
      question: "What are your business hours?",
      answer: "Our standard business hours are Monday to Friday, 9:00 AM to 6:00 PM (EST). However, we offer 24/7 online ordering and emergency support for urgent notarization needs. Our automated systems are always available.",
      category: "support"
    },
    {
      question: "Do you offer support in multiple languages?",
      answer: "Yes, we offer customer support in English, Spanish, French, and several other languages. Our notarized sworn translation services also support 50+ languages, making us accessible to clients from diverse backgrounds.",
      category: "support"
    }
  ]

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'general', name: 'General', icon: FileText },
    { id: 'services', name: 'Services', icon: Shield },
    { id: 'process', name: 'Process', icon: Clock },
    { id: 'pricing', name: 'Pricing', icon: CreditCard },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'support', name: 'Support', icon: Mail }
  ]

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory)

  const toggleItem = (question: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(question)) {
      newExpanded.delete(question)
    } else {
      newExpanded.add(question)
    }
    setExpandedItems(newExpanded)
  }

  const isExpanded = (question: string) => expandedItems.has(question)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-teal-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about our notarization services, process, and support.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Card>
                <button
                  onClick={() => toggleItem(faq.question)}
                  className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    {isExpanded(faq.question) ? (
                      <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    )}
                  </div>
                  
                  {isExpanded(faq.question) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </button>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our customer support team is here to help. 
              We're available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                <Mail className="w-5 h-5 mr-2" />
                Contact Support
              </Button>
              <Button variant="secondary" size="lg">
                <Phone className="w-5 h-5 mr-2" />
                Call Us
              </Button>
            </div>
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p>Email: support@notarette.com</p>
              <p>Live Chat: Available 24/7</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default FAQ