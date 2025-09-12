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
  calComBookingLink: string
  imageUrl?: string // Optional field for future image support
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
    priceCents: 100, // €1.00
    currency: 'EUR',
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
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test',
    options: {
      extraPagesPriceCents: 100, // €1.00 per extra page
      courierPriceCents: 100, // €1.00 for courier
      rushServicePriceCents: 100, // €1.00 for rush service
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
    priceCents: 100, // €1.00
    currency: 'EUR',
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
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/certified-copy-of-document-meeting-test',
    options: {
      extraPagesPriceCents: 100,
      courierPriceCents: 100,
      rushServicePriceCents: 100,
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
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'Certified copy of passport or government ID',
    longDescription: 'Create legally certified copies of passports, driver licenses, and other government-issued identification documents.',
    features: [
      'Government ID verification',
      'Notarial certification',
      'Digital copy provided',
      'Secure storage',
      'Quick processing',
    ],
    turnaroundTime: '1-2 hours',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test',
    options: {
      extraPagesPriceCents: 100,
      courierPriceCents: 100,
      rushServicePriceCents: 100,
    },
    faqs: [
      {
        question: 'What types of ID can be certified?',
        answer: 'Passports, driver licenses, national ID cards, and other government-issued identification.',
      },
      {
        question: 'Is the original ID required?',
        answer: 'Yes, the original identification document must be presented for certification.',
      },
    ],
  },
  {
    id: '4',
    name: 'Company Formation Documents',
    slug: 'company-formation-documents',
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'Notarization of company formation and business documents',
    longDescription: 'Professional notarization of company formation documents, articles of incorporation, and business agreements.',
    features: [
      'Business document expertise',
      'Legal compliance assurance',
      'Digital certificate included',
      'Same-day processing',
      '24/7 availability',
    ],
    turnaroundTime: '2-4 hours',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test',
    options: {
      extraPagesPriceCents: 100,
      courierPriceCents: 100,
      rushServicePriceCents: 100,
    },
    faqs: [
      {
        question: 'What business documents can be notarized?',
        answer: 'Articles of incorporation, operating agreements, contracts, and other business formation documents.',
      },
      {
        question: 'Do I need to be present?',
        answer: 'Yes, all parties must be present for notarization, either in person or via video call.',
      },
    ],
  },
  {
    id: '5',
    name: 'Apostille Services',
    slug: 'apostille-services',
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'International document authentication and apostille services',
    longDescription: 'Professional apostille services for international document authentication and legalization.',
    features: [
      'International expertise',
      'Government authentication',
      'Express processing available',
      'Document verification',
      '24/7 availability',
    ],
    turnaroundTime: '3-5 business days',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test',
    options: {
      extraPagesPriceCents: 100,
      courierPriceCents: 100,
      rushServicePriceCents: 100,
    },
    faqs: [
      {
        question: 'What is an apostille?',
        answer: 'An apostille is a form of authentication for documents to be used in countries that are part of the Hague Convention.',
      },
      {
        question: 'How long does apostille processing take?',
        answer: 'Standard processing takes 3-5 business days, with express options available for faster service.',
      },
    ],
  },
  {
    id: '6',
    name: 'Document Translation & Notarization',
    slug: 'document-translation-notarization',
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'Professional translation and notarization services',
    longDescription: 'Professional translation services combined with notarial certification for international use.',
    features: [
      'Professional translation',
      'Notarial certification',
      'Multiple languages',
      'Quality assurance',
      '24/7 availability',
    ],
    turnaroundTime: '2-3 business days',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test',
    options: {
      extraPagesPriceCents: 100,
      courierPriceCents: 100,
      rushServicePriceCents: 100,
    },
    faqs: [
      {
        question: 'What languages do you support?',
        answer: 'We support major world languages including Spanish, French, German, Chinese, and many others.',
      },
      {
        question: 'Is the translation certified?',
        answer: 'Yes, all translations are professionally certified and notarized for legal use.',
      },
    ],
  },
  {
    id: '7',
    name: 'Real Estate Document Notarization',
    slug: 'real-estate-document-notarization',
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'Notarization of real estate and property documents',
    longDescription: 'Professional notarization of real estate contracts, deeds, mortgages, and property-related documents.',
    features: [
      'Real estate expertise',
      'Legal compliance assurance',
      'Digital certificate included',
      'Same-day processing',
      '24/7 availability',
    ],
    turnaroundTime: '2-4 hours',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test',
    options: {
      extraPagesPriceCents: 100,
      courierPriceCents: 100,
      rushServicePriceCents: 100,
    },
    faqs: [
      {
        question: 'What real estate documents can be notarized?',
        answer: 'Deeds, mortgages, contracts, leases, and other property-related legal documents.',
      },
      {
        question: 'Do I need to be physically present?',
        answer: 'No, we offer remote notarization services that are legally recognized in most jurisdictions.',
      },
    ],
  },
  {
    id: '8',
    name: 'Estate Planning Document Notarization',
    slug: 'estate-planning-document-notarization',
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'Notarization of wills, trusts, and estate planning documents',
    longDescription: 'Professional notarization of wills, trusts, power of attorney documents, and other estate planning instruments.',
    features: [
      'Estate planning expertise',
      'Legal compliance assurance',
      'Digital certificate included',
      'Same-day processing',
      '24/7 availability',
    ],
    turnaroundTime: '2-4 hours',
    calComBookingLink: 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test',
    options: {
      extraPagesPriceCents: 100,
      courierPriceCents: 100,
      rushServicePriceCents: 100,
    },
    faqs: [
      {
        question: 'What estate planning documents can be notarized?',
        answer: 'Wills, trusts, power of attorney documents, healthcare directives, and other estate planning instruments.',
      },
      {
        question: 'Is remote notarization valid for estate documents?',
        answer: 'Yes, remote notarization is legally recognized for estate planning documents in most jurisdictions.',
      },
    ],
  }
]

export const getServiceById = (id: string): Service | undefined => {
  return services.find(service => service.id === id)
}

export const getServiceBySlug = (slug: string): Service | undefined => {
  return services.find(service => service.slug === slug)
}