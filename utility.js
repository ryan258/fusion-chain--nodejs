// utility.js

// Function to log the conversation in a structured format
function logConversation(turn, role, message, context = {}) {
    const timestamp = new Date().toLocaleTimeString();
    let formattedMessage = message;
  
    // Replace context variables in the message if they exist
    for (const [key, value] of Object.entries(context)) {
      formattedMessage = formattedMessage.replace(`{{${key}}}`, value);
    }
  
    console.log(`[${timestamp}] Turn ${turn}: ${role} - ${formattedMessage}`);
  }
  
  // Function to format a JSON object for display
  function formatJSON(jsonObject) {
    return JSON.stringify(jsonObject, null, 2); // Pretty-print the JSON object
  }
  
  module.exports = { logConversation, formatJSON };