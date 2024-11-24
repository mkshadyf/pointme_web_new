export const emailTemplates = {
  paymentSuccess: {
    subject: 'Payment Successful - Booking Confirmed',
    html: (data: {
      customerName: string;
      serviceName: string;
      businessName: string;
      amount: number;
      bookingId: string;
      date: string;
      time: string;
    }) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Payment Successful</h1>
        <p>Dear ${data.customerName},</p>
        <p>Your payment has been successfully processed for the following booking:</p>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${data.serviceName}</h2>
          <p style="margin: 5px 0;">Provider: ${data.businessName}</p>
          <p style="margin: 5px 0;">Amount: $${data.amount}</p>
          <p style="margin: 5px 0;">Date: ${data.date}</p>
          <p style="margin: 5px 0;">Time: ${data.time}</p>
          <p style="margin: 5px 0;">Booking ID: ${data.bookingId}</p>
        </div>

        <p>You can view your booking details and receipt in your account dashboard.</p>
        
        <div style="margin-top: 30px;">
          <p>Thank you for your business!</p>
          <p>Best regards,<br>The PointMe Team</p>
        </div>
      </div>
    `,
  },

  paymentFailed: {
    subject: 'Payment Failed - Action Required',
    html: (data: {
      customerName: string;
      serviceName: string;
      businessName: string;
      amount: number;
      bookingId: string;
    }) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Payment Failed</h1>
        <p>Dear ${data.customerName},</p>
        <p>We were unable to process your payment for the following booking:</p>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${data.serviceName}</h2>
          <p style="margin: 5px 0;">Provider: ${data.businessName}</p>
          <p style="margin: 5px 0;">Amount: $${data.amount}</p>
          <p style="margin: 5px 0;">Booking ID: ${data.bookingId}</p>
        </div>

        <p>Please try again with a different payment method or contact your bank for assistance.</p>
        
        <div style="margin-top: 30px;">
          <a href="/bookings/${data.bookingId}/payment" style="background: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Try Payment Again
          </a>
        </div>

        <div style="margin-top: 30px;">
          <p>Need help? Contact our support team.</p>
          <p>Best regards,<br>The PointMe Team</p>
        </div>
      </div>
    `,
  },

  paymentRefunded: {
    subject: 'Payment Refunded',
    html: (data: {
      customerName: string;
      serviceName: string;
      businessName: string;
      amount: number;
      bookingId: string;
    }) => `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Payment Refunded</h1>
        <p>Dear ${data.customerName},</p>
        <p>Your payment has been refunded for the following booking:</p>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${data.serviceName}</h2>
          <p style="margin: 5px 0;">Provider: ${data.businessName}</p>
          <p style="margin: 5px 0;">Refund Amount: $${data.amount}</p>
          <p style="margin: 5px 0;">Booking ID: ${data.bookingId}</p>
        </div>

        <p>The refund should appear in your account within 5-10 business days.</p>
        
        <div style="margin-top: 30px;">
          <p>Thank you for your understanding.</p>
          <p>Best regards,<br>The PointMe Team</p>
        </div>
      </div>
    `,
  },
}; 