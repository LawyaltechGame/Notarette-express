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
    <div className="relative min-h-screen">
      {/* Background mesh & accents for modern look */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-primary-50/20 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-gray-900/30">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%236366f1\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M30 30c0-16.569 13.431-30 30-30v30H30zm30 30c-16.569 0-30-13.431-30-30h30v30z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
            backgroundRepeat: 'repeat',
          }}
        />
      </div>
      <div className="pointer-events-none absolute top-24 left-12 w-32 h-32 bg-gradient-to-br from-primary-400/10 to-primary-200/10 rounded-full blur-xl" />
      <div className="pointer-events-none absolute top-40 right-24 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-primary-300/10 rounded-full blur-xl" />
      <div className="pointer-events-none absolute bottom-24 left-1/4 w-28 h-28 bg-gradient-to-br from-primary-400/10 to-primary-200/10 rounded-full blur-xl" />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-900/20 border border-primary-200 dark:border-primary-800 mb-6">
              <span className="w-2 h-2 bg-primary-600 rounded-full mr-2 animate-pulse" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Helpful knowledge base</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-primary-900 to-primary-700 dark:from-white dark:via-primary-100 dark:to-primary-200 bg-clip-text text-transparent mb-4 leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to know about our services, process, security, and support.
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => {
                const Icon = category.icon
                const active = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors ${
                      active
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* FAQ Items inside glass container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl shadow-primary-500/5 p-4 md:p-8"
          >
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                >
                  <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => toggleItem(faq.question)}
                      className="w-full text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                          {faq.question}
                        </h3>
                        {isExpanded(faq.question) ? (
                          <ChevronUp className="w-5 h-5 text-primary-700 flex-shrink-0 mt-1" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-primary-700 flex-shrink-0 mt-1" />
                        )}
                      </div>

                      {isExpanded(faq.question) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-primary-100 dark:border-primary-900/30"
                        >
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-16"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 to-primary-500 p-10 md:p-14">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Need more help?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Our support team is available 24/7. Reach out and we’ll guide you through every step.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Support
                </Button>
                <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white hover:text-primary-700">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Us
                </Button>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default FAQ