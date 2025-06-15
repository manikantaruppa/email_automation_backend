// // test-email.js - Script to test the email functionality
// const axios = require('axios');

// const API_BASE_URL = 'http://localhost:8000';

// // Test data with your email details
// const testData = {
//   first_name: "Manikanta",
//   last_name: "Ruppa",
//   email: "maniruppa20@gmail.com", // Using your receiver email for testing
//   subject: "Testing Email from Backend",
//   message: "This is a test message to validate the email functionality of the backend contact form."
// };

// // Additional test cases
// const testCases = [
//   {
//     name: "Valid Submission",
//     data: testData,
//     expectedStatus: 200
//   },
//   {
//     name: "Invalid Email",
//     data: { ...testData, email: "invalid-email" },
//     expectedStatus: 400
//   },
//   {
//     name: "Missing First Name",
//     data: { ...testData, first_name: "" },
//     expectedStatus: 400
//   },
//   {
//     name: "Message Too Short",
//     data: { ...testData, message: "Short" },
//     expectedStatus: 400
//   },
//   {
//     name: "Subject Too Long",
//     data: { ...testData, subject: "A".repeat(101) },
//     expectedStatus: 400
//   }
// ];

// async function testHealthCheck() {
//   console.log('🔍 Testing health check...');
//   try {
//     const response = await axios.get(`${API_BASE_URL}/health`);
//     console.log('✅ Health check passed:', response.data);
//     return true;
//   } catch (error) {
//     console.log('❌ Health check failed:', error.message);
//     return false;
//   }
// }

// async function testEmailConfig() {
//   console.log('🔍 Testing email configuration...');
//   try {
//     const response = await axios.get(`${API_BASE_URL}/test-email-config`);
//     console.log('✅ Email config test passed:', response.data);
//     return true;
//   } catch (error) {
//     console.log('❌ Email config test failed:', error.response?.data || error.message);
//     return false;
//   }
// }

// async function testEmailSubmission(testCase) {
//   console.log(`🔍 Testing: ${testCase.name}...`);
//   try {
//     const response = await axios.post(`${API_BASE_URL}/send-email`, testCase.data);
    
//     if (response.status === testCase.expectedStatus) {
//       console.log(`✅ ${testCase.name} passed:`, response.data);
//       return true;
//     } else {
//       console.log(`❌ ${testCase.name} failed: Expected status ${testCase.expectedStatus}, got ${response.status}`);
//       return false;
//     }
//   } catch (error) {
//     if (error.response?.status === testCase.expectedStatus) {
//       console.log(`✅ ${testCase.name} passed (expected error):`, error.response.data);
//       return true;
//     } else {
//       console.log(`❌ ${testCase.name} failed:`, error.response?.data || error.message);
//       return false;
//     }
//   }
// }

// async function runAllTests() {
//   console.log('🚀 Starting Contact Form Backend Tests\n');
  
//   let passedTests = 0;
//   let totalTests = 0;
  
//   // Test health check
//   totalTests++;
//   if (await testHealthCheck()) passedTests++;
//   console.log('');
  
//   // Test email configuration
//   totalTests++;
//   if (await testEmailConfig()) passedTests++;
//   console.log('');
  
//   // Test all email submission cases
//   for (const testCase of testCases) {
//     totalTests++;
//     if (await testEmailSubmission(testCase)) passedTests++;
//     console.log('');
    
//     // Add delay between tests to respect rate limiting
//     if (testCase.name === "Valid Submission") {
//       console.log('⏳ Waiting 2 seconds to respect rate limiting...\n');
//       await new Promise(resolve => setTimeout(resolve, 2000));
//     }
//   }
  
//   // Summary
//   console.log('📊 Test Summary:');
//   console.log(`✅ Passed: ${passedTests}/${totalTests}`);
//   console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
//   if (passedTests === totalTests) {
//     console.log('🎉 All tests passed!');
//   } else {
//     console.log('⚠️  Some tests failed. Check the output above for details.');
//   }
// }

// // cURL command examples
// function printCurlExamples() {
//   console.log('\n📋 cURL Command Examples:\n');
  
//   console.log('1. Health Check:');
//   console.log(`curl -X GET ${API_BASE_URL}/health\n`);
  
//   console.log('2. Test Email Configuration:');
//   console.log(`curl -X GET ${API_BASE_URL}/test-email-config\n`);
  
//   console.log('3. Send Test Email:');
//   console.log(`curl -X POST ${API_BASE_URL}/send-email \\
//   -H "Content-Type: application/json" \\
//   -d '${JSON.stringify(testData, null, 2).replace(/\n/g, ' ')}'`);
  
//   console.log('\n4. Test Invalid Data:');
//   console.log(`curl -X POST ${API_BASE_URL}/send-email \\
//   -H "Content-Type: application/json" \\
//   -d '{"first_name":"","last_name":"Test","email":"invalid","subject":"","message":""}'`);
// }

// // Main execution
// if (require.main === module) {
//   const args = process.argv.slice(2);
  
//   if (args.includes('--curl')) {
//     printCurlExamples();
//   } else {
//     runAllTests().catch(console.error);
//   }
// }

// module.exports = {
//   testData,
//   testCases,
//   runAllTests,
//   printCurlExamples
// };    




// test-formatted-message.js - Test script for formatted message preservation
const axios = require('axios');

const testMessage = `Hi Manikanta,

I hope you're doing well today! I came across your profile and was impressed by your extensive experience in generative AI and data science. Your work developing and deploying Large Language Models really stands out.

At Grid Dynamics, we're looking for a Data Scientist to join our team. Your skills in advanced machine learning and NLP would be a great fit for the role. We are interested in your success with intelligent document processing, particularly how you've automated workflows and improved accuracy.

If you're open to discussing opportunities, I believe this position aligns well with your background and could be a great next step for you. Let me know if you'd like to chat more about it.

Best regards,
Velu

Velu Prabhakaran
Leadership Hiring | Diversity Hiring | Niche Hiring | Volume Hiring | Talent Acquisition | Tech Recruitment`;

async function testFormattedMessage() {
  console.log('🔍 Testing formatted message preservation...\n');
  
  const testData = {
    first_name: "Velu",
    last_name: "Prabhakaran",
    email: "velu.prabhakaran@griddynamics.com",
    subject: "Data Scientist Opportunity at Grid Dynamics",
    message: testMessage
  };

  try {
    console.log('📧 Sending formatted message...');
    console.log('Original message structure:');
    console.log('---');
    console.log(testMessage);
    console.log('---\n');

    const response = await axios.post('http://localhost:8000/send-email', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Formatted message sent successfully!');
    console.log('Response:', response.data);
    console.log('\n📬 Check your email at maniruppa20@gmail.com');
    console.log('The message should preserve all line breaks and spacing.');

  } catch (error) {
    if (error.response?.status === 429) {
      console.log('⚠️ Rate limited. Wait 15 minutes and try again.');
    } else {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }
}

// Also test with various formatting scenarios
async function testVariousFormats() {
  console.log('\n🧪 Testing various formatting scenarios...\n');
  
  const formatTests = [
    {
      name: "Bullet Points",
      message: `Here are my key skills:

• Machine Learning
• Deep Learning  
• Natural Language Processing
• Computer Vision
• MLOps and Model Deployment

Looking forward to hearing from you!`
    },
    {
      name: "Numbered List",
      message: `Project phases:

1. Data Collection and Preprocessing
2. Model Development and Training
3. Evaluation and Validation
4. Deployment and Monitoring
5. Continuous Improvement

Each phase is critical for success.`
    },
    {
      name: "Code Snippet",
      message: `Here's a sample code snippet:

def process_data(input_data):
    """Process incoming data"""
    cleaned_data = clean(input_data)
    features = extract_features(cleaned_data)
    return model.predict(features)

Hope this helps demonstrate my coding style!`
    }
  ];

  for (let i = 0; i < formatTests.length; i++) {
    const test = formatTests[i];
    
    try {
      console.log(`📧 Testing: ${test.name}...`);
      
      const testData = {
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        subject: `Formatting Test: ${test.name}`,
        message: test.message
      };

      const response = await axios.post('http://localhost:8000/send-email', testData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ ${test.name} test passed!`);
      
      // Add delay to respect rate limiting
      if (i < formatTests.length - 1) {
        console.log('⏳ Waiting 4 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
      
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`⚠️ Rate limited on ${test.name} test. This is expected.`);
        break;
      } else {
        console.log(`❌ ${test.name} failed:`, error.response?.data || error.message);
      }
    }
  }
}

// Main execution
async function runFormattingTests() {
  console.log('🎯 Contact Form Formatting Tests\n');
  
  await testFormattedMessage();
  
  // Uncomment the line below to test various formatting scenarios
  // await testVariousFormats();
  
  console.log('\n✨ Formatting tests completed!');
  console.log('Check your email to verify the formatting is preserved.');
}

if (require.main === module) {
  runFormattingTests().catch(console.error);
}

module.exports = {
  testFormattedMessage,
  testVariousFormats,
  testMessage
};