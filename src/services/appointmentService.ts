export interface AppointmentData {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  serviceIds: string[]
  paymentSessionId: string
  totalAmount: number
  meetingLink: string
}

export interface BookingConfirmation {
  bookingId: string
  appointmentDate: string
  meetingLink: string
  customerEmail: string
  customerName: string
}

// Cal.com meeting link
export const CAL_MEETING_LINK = 'https://cal.com/marcus-whereby-xu25ac/remote-notarization-meeting-test'

// Book appointment
export const bookAppointment = async (data: AppointmentData): Promise<BookingConfirmation> => {
  try {
    // Simulate API call to book appointment
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate a mock booking ID
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Set appointment date to 24 hours from now
    const appointmentDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    
    return {
      bookingId,
      appointmentDate,
      meetingLink: data.meetingLink,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
    }
  } catch (error) {
    throw new Error('Failed to book appointment')
  }
}

// Send confirmation email
export const sendConfirmationEmail = async (data: BookingConfirmation): Promise<void> => {
  try {
    // Simulate API call to send email
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('Confirmation email sent to:', data.customerEmail)
    console.log('Email content:', {
      subject: 'Appointment Confirmation - Notarette Express',
      body: `Dear ${data.customerName},\n\nYour appointment has been confirmed for ${new Date(data.appointmentDate).toLocaleDateString()}.\n\nMeeting Link: ${data.meetingLink}\n\nThank you for choosing Notarette Express!`
    })
  } catch (error) {
    throw new Error('Failed to send confirmation email')
  }
}

// Add to calendar
export const addToCalendar = async (data: BookingConfirmation): Promise<void> => {
  try {
    // Simulate API call to add to calendar
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('Added to calendar:', {
      event: `Notarization Appointment - ${data.customerName}`,
      date: data.appointmentDate,
      link: data.meetingLink
    })
  } catch (error) {
    throw new Error('Failed to add to calendar')
  }
}

// Create Cal.com event
export const createCalEvent = async (data: AppointmentData): Promise<any> => {
  try {
    // Simulate API call to create Cal.com event
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const eventId = `cal_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('Cal.com event created:', {
      eventId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      meetingLink: data.meetingLink,
      services: data.serviceIds
    })
    
    return {
      eventId,
      meetingLink: data.meetingLink,
      status: 'confirmed'
    }
  } catch (error) {
    throw new Error('Failed to create Cal.com event')
  }
}

