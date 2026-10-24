/* CONFIGURATION: Add your deployed Google Apps Script URL after deploying the backend.
   Razorpay order creation/signature verification uses the optional Node backend.
   Never put your Razorpay SECRET key in this file or any frontend JavaScript. */
window.ZYQEN_CONFIG = {\n  PUBLIC_EMAIL: "zyqentechnologies@gmail.com",\n  PUBLIC_PHONE: "+91 8871802250",
  GOOGLE_SHEETS_ENDPOINT: "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
  PAYMENT_API_BASE: "PASTE_YOUR_DEPLOYED_NODE_BACKEND_URL_HERE",
  RAZORPAY_KEY_ID: "PASTE_RAZORPAY_KEY_ID_HERE",
  CURRENCY: "INR",
  ACADEMIC_FEE_PAISE: 10000
};