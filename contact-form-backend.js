// contact-form-backend.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Add this after your other middleware
if (process.env.NODE_ENV === 'production') {
  // Trust proxy for Render
  app.set('trust proxy', 1);
  
  // Update CORS for production
  app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }));
} else {
  app.use(cors());
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/send-email', limiter);

// Email transporter setup
const createTransporter = () => {
  // Gmail configuration (recommended)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // Use App Password for Gmail
      }
    });
  }
  
  // SMTP configuration (using your provided settings)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD
    }
  });
};

// Validation middleware
const validateContactForm = [
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

// Email templates
const createEmailTemplate = (data) => {
  const { first_name, last_name, email, subject, message } = data;
  
  return {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
            <p>You have received a new message from your website contact form.</p>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${first_name} ${last_name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${email}</div>
            </div>
            
            <div class="field">
              <div class="label">Subject:</div>
              <div class="value">${subject}</div>
            </div>
            
            <div class="field">
              <div class="label">Message:</div>
              <div class="value" style="white-space: pre-wrap; font-family: monospace, Arial, sans-serif;">${message}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This message was sent from your website contact form on ${new Date().toLocaleString()}.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Contact Form Submission
      
      Name: ${first_name} ${last_name}
      Email: ${email}
      Subject: ${subject}
      
      Message:
${message}
      
      Sent: ${new Date().toLocaleString()}
    `
  };
};

// Auto-reply template
const createAutoReplyTemplate = (firstName) => {
  return {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank you for contacting us!</h2>
          </div>
          
          <div class="content">
            <p>Hi ${firstName},</p>
            
            <p>Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.</p>
            
            <p>We typically respond to inquiries within 24-48 hours during business days.</p>
            
            <p>Best regards,<br>
            The Support Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${firstName},
      
      Thank you for reaching out to us. We have received your message and will get back to you as soon as possible.
      
      We typically respond to inquiries within 24-48 hours during business days.
      
      Best regards,
      The Support Team
    `
  };
};

// Main email sending endpoint
app.post('/send-email', validateContactForm, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { first_name, last_name, email, subject, message } = req.body;
    
    // Create transporter
    const transporter = createTransporter();
    
    // Verify transporter
    await transporter.verify();
    
    // Create email templates
    const emailTemplate = createEmailTemplate(req.body);
    const autoReplyTemplate = createAutoReplyTemplate(first_name);
    
    // Send email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `Contact Form: ${subject}`,
      html: emailTemplate.html,
      text: emailTemplate.text,
      replyTo: email
    };
    
    await transporter.sendMail(adminMailOptions);
    
    // Send auto-reply to user (optional)
    if (process.env.SEND_AUTO_REPLY === 'true') {
      const autoReplyOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Thank you for contacting us',
        html: autoReplyTemplate.html,
        text: autoReplyTemplate.text
      };
      
      await transporter.sendMail(autoReplyOptions);
    }
    
    // Log successful submission (you might want to use a proper logger)
    console.log(`Contact form submitted by: ${first_name} ${last_name} (${email})`);
    
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send email. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Contact Form API'
  });
});

// Test endpoint (for development)
app.get('/test-email-config', async (req, res) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    
    res.status(200).json({
      success: true,
      message: 'Email configuration is valid'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email configuration error',
      error: error.message
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Contact form server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Send email: POST http://localhost:${PORT}/send-email`);
});