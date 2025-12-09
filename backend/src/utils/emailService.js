import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Gmail App Password
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

/**
 * Send email notification when content is submitted
 * @param {Object} data - { adminEmails, contentType, contentTitle, submitterName }
 */
export const sendSubmissionNotification = async (data) => {
  const { adminEmails, contentType, contentTitle, submitterName } = data;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: adminEmails.join(', '),
    subject: `[SMK Kristen 5] New ${contentType} Submitted for Approval`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Content Submitted</h2>
        <p>A new <strong>${contentType}</strong> has been submitted and is waiting for your approval.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Content Type:</strong> ${contentType}</p>
          <p><strong>Title:</strong> ${contentTitle}</p>
          <p><strong>Submitted by:</strong> ${submitterName}</p>
        </div>
        
        <p>Please log in to the admin dashboard to review and approve/reject this content.</p>
        
        <a href="${process.env.FRONTEND_URL}/dashboard/pending" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Review Content
        </a>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">SMK Kristen 5 Klaten - Content Management System</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Submission notification sent to ${adminEmails.length} admin(s)`);
  } catch (error) {
    console.error('❌ Error sending submission notification:', error);
    throw error;
  }
};

/**
 * Send email notification when content is approved
 * @param {Object} data - { userEmail, contentType, contentTitle, approverName }
 */
export const sendApprovalNotification = async (data) => {
  const { userEmail, contentType, contentTitle, approverName } = data;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `[SMK Kristen 5] Your ${contentType} Has Been Approved`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Content Approved ✅</h2>
        <p>Good news! Your <strong>${contentType}</strong> has been approved and is now published on the website.</p>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p><strong>Content Type:</strong> ${contentType}</p>
          <p><strong>Title:</strong> ${contentTitle}</p>
          <p><strong>Approved by:</strong> ${approverName}</p>
        </div>
        
        <p>Thank you for your contribution to SMK Kristen 5 Klaten!</p>
        
        <a href="${process.env.FRONTEND_URL}" 
           style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          View Website
        </a>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">SMK Kristen 5 Klaten - Content Management System</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Approval notification sent to ${userEmail}`);
  } catch (error) {
    console.error('❌ Error sending approval notification:', error);
    throw error;
  }
};

/**
 * Send email notification when content is rejected
 * @param {Object} data - { userEmail, contentType, contentTitle, rejectionReason, rejectedBy }
 */
export const sendRejectionNotification = async (data) => {
  const { userEmail, contentType, contentTitle, rejectionReason, rejectedBy } = data;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: `[SMK Kristen 5] Your ${contentType} Needs Revision`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Content Needs Revision</h2>
        <p>Your <strong>${contentType}</strong> has been reviewed and needs some revisions before it can be published.</p>
        
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p><strong>Content Type:</strong> ${contentType}</p>
          <p><strong>Title:</strong> ${contentTitle}</p>
          <p><strong>Reviewed by:</strong> ${rejectedBy}</p>
        </div>
        
        <div style="background-color: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p><strong>Reason for revision:</strong></p>
          <p>${rejectionReason}</p>
        </div>
        
        <p>Please revise your content according to the feedback and submit it again.</p>
        
        <a href="${process.env.FRONTEND_URL}/dashboard/my-content" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Edit Content
        </a>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">SMK Kristen 5 Klaten - Content Management System</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Rejection notification sent to ${userEmail}`);
  } catch (error) {
    console.error('❌ Error sending rejection notification:', error);
    throw error;
  }
};

export default transporter;
