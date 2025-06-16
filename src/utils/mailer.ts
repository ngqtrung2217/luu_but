import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD_FOR_APP,
  },
});

interface EmailData {
  name: string;
  message: string;
  email?: string;
  phone?: string;
}

export const sendNotificationEmail = async (data: EmailData): Promise<boolean> => {
  try {
    // Set up email data
    const mailOptions = {
      from: `"Lưu Bút Của Trung" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `✏️ Lưu bút mới từ ${data.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4b0082;">Có người vừa gửi lưu bút mới!</h2>
          <p style="font-size: 16px;"><strong>Họ tên:</strong> ${data.name}</p>
          ${data.email ? `<p style="font-size: 16px;"><strong>Email:</strong> ${data.email}</p>` : ''}
          ${data.phone ? `<p style="font-size: 16px;"><strong>Số điện thoại:</strong> ${data.phone}</p>` : ''}
          <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #4b0082; border-radius: 4px;">
            <h3 style="color: #4b0082; margin-top: 0;">Nội dung:</h3>
            <p style="white-space: pre-line;">${data.message}</p>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">Thời gian: ${new Date().toLocaleString('vi-VN')}</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

export const sendThankYouEmail = async (recipientEmail: string, name: string): Promise<boolean> => {
  try {
    // Check if email is provided
    if (!recipientEmail) return false;

    // Set up email data
    const mailOptions = {
      from: `"Lưu Bút Của Trung" <${process.env.ADMIN_EMAIL}>`,
      to: recipientEmail,
      subject: `💌 Cảm ơn bạn đã gửi lưu bút, ${name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4b0082;">Xin chào ${name},</h2>
          
          <p style="font-size: 16px;">Cảm ơn bạn rất nhiều vì đã dành thời gian để viết lưu bút. Những lời nhắn của bạn thực sự có ý nghĩa rất lớn đối với tôi!</p>
          
          <p style="font-size: 16px;">Chúc bạn một ngày tuyệt vời và hẹn gặp lại bạn!</p>
          
          <p style="font-size: 16px; margin-top: 30px;">Trân trọng,<br/>Nguyen Quang Trung</p>
          
          <p style="font-size: 12px; color: #888; margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
            Email này được gửi tự động. Vui lòng không trả lời email này.
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending thank you email:', error);
    return false;
  }
};
