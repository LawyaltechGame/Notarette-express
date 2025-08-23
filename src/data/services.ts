export interface Service {
  id: string
  name: string
  slug: string
  priceCents: number
  currency: string
  description: string
  longDescription: string
  features: string[]
  turnaroundTime: string
  stripePriceId: string
  paymentLink: string
  options: {
    extraPagesPriceCents: number
    courierPriceCents: number
    rushServicePriceCents: number
  }
  faqs: Array<{
    question: string
    answer: string
  }>
}

export const services: Service[] = [
  {
    id: '1',
    name: 'Power of Attorney',
    slug: 'power-of-attorney',
    priceCents: 3000, // ₹30.00 (3000 paise)
    currency: 'INR',
    description: 'Legally binding power of attorney notarization',
    longDescription: 'Professional notarization of power of attorney documents with full legal compliance and identity verification.',
    features: [
      'Identity verification required',
      'Legal compliance assurance',
      'Digital certificate included',
      'Same-day processing',
      '24/7 availability',
    ],
    turnaroundTime: '2-4 hours',
    stripePriceId: 'price_1NxY0000000000000000000000000001',
    paymentLink: 'https://buy.stripe.com/test_eVq8wP1OI09cep2aMV1Jm01',
    options: {
      extraPagesPriceCents: 500,
      courierPriceCents: 1500,
      rushServicePriceCents: 2000,
    },
    faqs: [
      {
        question: 'What types of POA can be notarized?',
        answer: 'We can notarize general, limited, healthcare, and financial powers of attorney.',
      },
      {
        question: 'Is identity verification required?',
        answer: 'Yes, all parties must complete identity verification before notarization.',
      },
    ],
  },
  {
    id: '2',
    name: 'Certified Copy of Document',
    slug: 'certified-copy-document',
    priceCents: 2000, // $20.00
    currency: 'USD',
    description: 'Official certified copy of original documents',
    longDescription: 'Create legally certified copies of original documents with notarial certification.',
    features: [
      'Original document verification',
      'Notarial certification',
      'Digital copy provided',
      'Secure storage',
      'Quick processing',
    ],
    turnaroundTime: '1-2 hours',
    stripePriceId: '',
    paymentLink: '',
    options: {
      extraPagesPriceCents: 300,
      courierPriceCents: 1200,
      rushServicePriceCents: 1500,
    },
    faqs: [
      {
        question: 'What documents can be certified?',
        answer: 'Most original documents including certificates, licenses, and official records.',
      },
      {
        question: 'Do I need the original document?',
        answer: 'Yes, the original document must be presented for certification.',
      },
    ],
  },
  {
    id: '3',
    name: 'Certified Copy of Passport/ID',
    slug: 'certified-copy-passport-id',
    priceCents: 2500, // $25.00
    currency: 'USD',
    description: 'Certified copy of passport or government ID',
    longDescription: 'Create certified copies of passports, driver licenses, and government identification documents.',
    features: [
      'Government ID verification',
      'Enhanced security protocols',
      'International acceptance',
      'Digital backup included',
      'Express service available',
    ],
    turnaroundTime: '1-3 hours',
    stripePriceId: '',
    paymentLink: '',
    options: {
      extraPagesPriceCents: 400,
      courierPriceCents: 1500,
      rushServicePriceCents: 1800,
    },
    faqs: [
      {
        question: 'Which IDs are accepted?',
        answer: 'Passports, driver licenses, state IDs, and other government-issued identification.',
      },
      {
        question: 'Is this accepted internationally?',
        answer: 'Yes, certified copies are generally accepted for international use.',
      },
    ],
  },
  {
    id: '4',
    name: 'Online Content Notarization',
    slug: 'online-content-notarization',
    priceCents: 3000, // $30.00
    currency: 'USD',
    description: 'Notarization of digital content and online documents',
    longDescription: 'Specialized service for notarizing digital content, websites, and online documents.',
    features: [
      'Digital content verification',
      'Screenshot certification',
      'Timestamp verification',
      'Blockchain security',
      '24/7 availability',
    ],
    turnaroundTime: '2-4 hours',
    stripePriceId: '',
    paymentLink: '',
    options: {
      extraPagesPriceCents: 600,
      courierPriceCents: 1000,
      rushServicePriceCents: 2000,
    },
    faqs: [
      {
        question: 'What types of content can be notarized?',
        answer: 'Websites, social media posts, digital documents, and online content.',
      },
      {
        question: 'How is digital content verified?',
        answer: 'We use timestamped screenshots and blockchain verification for authenticity.',
      },
    ],
  },
  {
    id: '5',
    name: 'Signature Notarization',
    slug: 'signature-notarization',
    priceCents: 2500, // $25.00
    currency: 'USD',
    description: 'Official notarization of signatures on documents',
    longDescription: 'Standard signature notarization service for contracts, agreements, and legal documents.',
    features: [
      'Signature verification',
      'Identity confirmation',
      'Legal compliance',
      'Digital certificate',
      'Quick processing',
    ],
    turnaroundTime: '1-2 hours',
    stripePriceId: '',
    paymentLink: '',
    options: {
      extraPagesPriceCents: 500,
      courierPriceCents: 1200,
      rushServicePriceCents: 1500,
    },
    faqs: [
      {
        question: 'What documents can be signed?',
        answer: 'Contracts, agreements, affidavits, and most legal documents.',
      },
      {
        question: 'Do all signers need to be present?',
        answer: 'Yes, all parties must be present during the notarization session.',
      },
    ],
  },
  {
    id: '6',
    name: 'Apostille Services',
    slug: 'apostille-services',
    priceCents: 5000, // $50.00
    currency: 'USD',
    description: 'International document authentication',
    longDescription: 'Complete apostille service for international document authentication under the Hague Convention.',
    features: [
      'Hague Convention compliance',
      'International recognition',
      'Expedited processing',
      'Secure delivery',
      'Multi-language support',
    ],
    turnaroundTime: '1-3 business days',
    stripePriceId: '',
    paymentLink: '',
    options: {
      extraPagesPriceCents: 1000,
      courierPriceCents: 2500,
      rushServicePriceCents: 3000,
    },
    faqs: [
      {
        question: 'What is an apostille?',
        answer: 'An apostille certifies documents for international use in Hague Convention countries.',
      },
      {
        question: 'Which countries accept apostilles?',
        answer: 'Over 100 countries in the Hague Convention accept apostille certifications.',
      },
    ],
  },
  {
    id: '7',
    name: 'Contract Certification',
    slug: 'contract-certification',
    priceCents: 4000, // $40.00
    currency: 'USD',
    description: 'Professional contract notarization and certification',
    longDescription: 'Comprehensive contract certification service for business and legal agreements.',
    features: [
      'Contract review included',
      'Legal compliance check',
      'Multi-party support',
      'Digital execution',
      'Audit trail',
    ],
    turnaroundTime: '2-6 hours',
    stripePriceId: '',
    paymentLink: '',
    options: {
      extraPagesPriceCents: 800,
      courierPriceCents: 1800,
      rushServicePriceCents: 2500,
    },
    faqs: [
      {
        question: 'What types of contracts can be certified?',
        answer: 'Business contracts, employment agreements, real estate contracts, and more.',
      },
      {
        question: 'Is contract review included?',
        answer: 'Yes, we provide basic legal compliance review with certification.',
      },
    ],
  },
  {
    id: '8',
    name: 'Notarized Sworn Translation',
    slug: 'notarized-sworn-translation',
    priceCents: 6000, // $60.00
    currency: 'USD',
    description: 'Certified translation with notarial certification',
    longDescription: 'Professional translation services with notarial certification for legal documents.',
    features: [
      'Certified translator',
      'Notarial certification',
      'Multi-language support',
      'Legal compliance',
      'Quality assurance',
    ],
    turnaroundTime: '2-5 business days',
    stripePriceId: '',
    paymentLink: '',
    options: {
      extraPagesPriceCents: 1500,
      courierPriceCents: 2000,
      rushServicePriceCents: 3500,
    },
    faqs: [
      {
        question: 'Which languages do you support?',
        answer: 'We support 50+ languages with certified translators.',
      },
      {
        question: 'Is the translation legally binding?',
        answer: 'Yes, sworn translations with notarial certification are legally binding.',
      },
    ],
  },
  {
    id: '9',
    name: 'Company Registration',
    slug: 'company-registration',
    priceCents: 8000, // $80.00
    currency: 'USD',
    description: 'Business registration and incorporation services',
    longDescription: 'Complete business registration and incorporation services with notarial support.',
    features: [
      'Business formation',
      'Document preparation',
      'Notarial certification',
      'Compliance assistance',
      'Ongoing support',
    ],
    turnaroundTime: '3-7 business days',
    stripePriceId: '',
    paymentLink: '',
    options: {
      extraPagesPriceCents: 1200,
      courierPriceCents: 2500,
      rushServicePriceCents: 4000,
    },
    faqs: [
      {
        question: 'What business types can be registered?',
        answer: 'LLCs, corporations, partnerships, and sole proprietorships.',
      },
      {
        question: 'Is legal advice included?',
        answer: 'We provide basic guidance, but recommend consulting a lawyer for complex cases.',
      },
    ],
  },
  {
    id: '10',
    name: 'Vital Certificates Replacement',
    slug: 'vital-certificates-replacement',
    priceCents: 4500, // $45.00
    currency: 'USD',
    description: 'Replacement of vital records and certificates',
    longDescription: 'Assistance with obtaining replacement vital certificates and official documents.',
    features: [
      'Document research',
      'Government liaison',
      'Notarial certification',
      'Express processing',
      'Tracking included',
    ],
    turnaroundTime: '5-15 business days',
    stripePriceId: '',
    paymentLink: '',
    options: {
      extraPagesPriceCents: 800,
      courierPriceCents: 2000,
      rushServicePriceCents: 3000,
    },
    faqs: [
      {
        question: 'What certificates can be replaced?',
        answer: 'Birth certificates, death certificates, marriage licenses, and divorce decrees.',
      },
      {
        question: 'How long does it take?',
        answer: 'Processing time varies by state and document type, typically 5-15 business days.',
      },
    ],
  },
]

export const getServiceById = (id: string): Service | undefined => {
  return services.find(service => service.id === id)
}

export const getServiceBySlug = (slug: string): Service | undefined => {
  return services.find(service => service.slug === slug)
}