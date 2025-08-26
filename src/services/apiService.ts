// Mock API service for demo purposes
// In production, this would connect to your actual backend

export interface PaymentIntentRequest {
  amount: number
  currency: string
  metadata: {
    serviceIds: string
    customerEmail: string
    customerName: string
  }
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

export interface AppointmentRequest {
  customerName: string
  customerEmail: string
  serviceIds: string[]
  paymentIntentId: string
  meetingLink: string
  scheduledTime?: string
}

export interface AppointmentResponse {
  bookingId: string
  meetingLink: string
  scheduledTime: string
  confirmationEmail: string
}

// Mock API functions
export const createPaymentIntent = async (_data: PaymentIntentRequest): Promise<PaymentIntentResponse> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    clientSecret: 'pi_mock_client_secret_' + Date.now(),
    paymentIntentId: 'pi_mock_' + Date.now(),
  }
}

export const bookAppointment = async (data: AppointmentRequest): Promise<AppointmentResponse> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    bookingId: 'booking_' + Date.now(),
    meetingLink: data.meetingLink,
    scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    confirmationEmail: data.customerEmail,
  }
}

export const sendConfirmationEmail = async (_bookingData: AppointmentResponse) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    success: true,
    messageId: 'email_' + Date.now(),
  }
}

export const addToCalendar = async (_bookingData: AppointmentResponse) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    success: true,
    calendarEventId: 'event_' + Date.now(),
  }
}

export const createCalEvent = async (appointmentData: AppointmentRequest) => {
  // Simulate Cal.com API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    success: true,
    eventId: 'cal_event_' + Date.now(),
    meetingLink: appointmentData.meetingLink,
    scheduledTime: appointmentData.scheduledTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

