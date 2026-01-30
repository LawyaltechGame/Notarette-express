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
  },
  {
    id: '9',
    name: 'Passport',
    slug: 'passport',
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'Certified copy and notarization of passport documents',
    longDescription: 'Professional notarization and certified copy services for passport documents with full legal compliance and identity verification.',
    features: [
      'Passport verification',
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
        question: 'What passport services do you provide?',
        answer: 'We provide certified copies and notarization services for passport documents.',
      },
      {
        question: 'Do I need the original passport?',
        answer: 'Yes, the original passport must be presented for certification and notarization.',
      },
    ],
  },
  {
    id: '10',
    name: 'Diplomas and Degrees',
    slug: 'diplomas-and-degrees',
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'Certified copy and notarization of academic diplomas and degrees',
    longDescription: 'Professional notarization and certified copy services for academic diplomas, degrees, and educational certificates.',
    features: [
      'Academic document verification',
      'Notarial certification',
      'Digital copy provided',
      'International recognition',
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
        question: 'What academic documents can be notarized?',
        answer: 'Diplomas, degrees, certificates, and other academic credentials from recognized institutions.',
      },
      {
        question: 'Is the original diploma required?',
        answer: 'Yes, the original diploma or degree certificate must be presented for certification.',
      },
    ],
  },
  {
    id: '11',
    name: 'Academic Transcripts',
    slug: 'academic-transcripts',
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'Certified copy and notarization of academic transcripts',
    longDescription: 'Professional notarization and certified copy services for academic transcripts and grade reports.',
    features: [
      'Transcript verification',
      'Notarial certification',
      'Digital copy provided',
      'Official seal',
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
        question: 'What transcript services do you provide?',
        answer: 'We provide certified copies and notarization services for official academic transcripts.',
      },
      {
        question: 'Do transcripts need to be official?',
        answer: 'Yes, transcripts must be official documents issued by the educational institution.',
      },
    ],
  },
  {
    id: '12',
    name: 'Bank Statements',
    slug: 'bank-statements',
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'Certified copy and notarization of bank statements',
    longDescription: 'Professional notarization and certified copy services for bank statements and financial documents.',
    features: [
      'Financial document verification',
      'Notarial certification',
      'Digital copy provided',
      'Privacy protection',
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
        question: 'What bank statement services do you provide?',
        answer: 'We provide certified copies and notarization services for bank statements and financial records.',
      },
      {
        question: 'Are bank statements kept confidential?',
        answer: 'Yes, all financial documents are handled with strict confidentiality and security measures.',
      },
    ],
  },
  {
    id: '13',
    name: 'Deeds of Title Transfer',
    slug: 'deeds-of-title-transfer',
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'Notarization of property title transfer deeds',
    longDescription: 'Professional notarization services for deeds of title transfer, property conveyance documents, and real estate transfers.',
    features: [
      'Property document expertise',
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
        question: 'What property transfer documents can be notarized?',
        answer: 'Deeds of title transfer, property conveyance documents, and other real estate transfer instruments.',
      },
      {
        question: 'Do all parties need to be present?',
        answer: 'Yes, all parties involved in the transfer must be present for notarization, either in person or via video call.',
      },
    ],
  },
  {
    id: '14',
    name: 'Board and Shareholder Resolutions',
    slug: 'board-and-shareholder-resolutions',
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'Notarization of corporate board and shareholder resolutions',
    longDescription: 'Professional notarization services for board resolutions, shareholder resolutions, and corporate governance documents.',
    features: [
      'Corporate document expertise',
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
        question: 'What corporate resolutions can be notarized?',
        answer: 'Board resolutions, shareholder resolutions, meeting minutes, and other corporate governance documents.',
      },
      {
        question: 'Do corporate officers need to be present?',
        answer: 'Yes, authorized corporate officers must be present for notarization of corporate documents.',
      },
    ],
  },
  {
    id: '15',
    name: 'Sale and Purchase Agreements',
    slug: 'sale-and-purchase-agreements',
    priceCents: 100, // €1.00
    currency: 'EUR',
    description: 'Notarization of sale and purchase agreements',
    longDescription: 'Professional notarization services for sale and purchase agreements, contracts of sale, and commercial transaction documents.',
    features: [
      'Commercial document expertise',
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
        question: 'What sale and purchase agreements can be notarized?',
        answer: 'Property sale agreements, business purchase agreements, asset purchase agreements, and other commercial transaction documents.',
      },
      {
        question: 'Do all parties need to be present?',
        answer: 'Yes, all parties to the agreement must be present for notarization, either in person or via video call.',
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