# Zyqen Technologies website

A responsive multi-page website with a black/blue theme, built with HTML, CSS, and vanilla JavaScript. Designed for GitHub Pages, with Google Sheets form collection and a separate Razorpay payment backend.

## Pages included
- `index.html` — Home, services, service enquiry form
- `about.html` — editable sample company story and values
- `academics.html` — program cards, registration modal, ₹100 Razorpay checkout
- `careers.html` — editable opportunities and career application form

## Current business details\n- Public contact email: zyqentechnologies@gmail.com\n- Public contact phone: +91 8871802250\n- Hosting preference: free GitHub Pages URL\n- Company copy: sample content for now\n\n## Before you publish
The site includes working UI and starter integrations, but it is **not live-connected until you configure the endpoints and credentials**. Replace the stylised text logo with your actual logo when you provide the attachment. Edit sample company copy, dates, programs, roles, contact details, and policies before launch.

## 1. Publish the website on GitHub Pages
1. Create a GitHub repository, e.g. `zyqen-website`.
2. Upload the contents of this folder to the repository root (not the ZIP itself).
3. Open **Settings → Pages** and select **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Save and wait for GitHub Pages to publish.
5. Your site URL will look like `https://YOUR-USERNAME.github.io/zyqen-website/`.

## 2. Connect form responses to Google Sheets
1. Create a Google Sheet called `Zyqen Website Responses`. Copy the Sheet ID from its URL (`/spreadsheets/d/SHEET_ID/edit`).
2. Open **Extensions → Apps Script** in that sheet.
3. Replace the editor content with `google-apps-script/Code.gs`.
4. In Apps Script, open **Project Settings → Script Properties → Add script property**. Set key `SHEET_ID`, value to your spreadsheet ID. Save.
5. Select **Deploy → New deployment → Web app**. Execute as **Me**. Set access to **Anyone**. Deploy and authorise the script.
6. Copy the Web app URL ending in `/exec`.
7. In `assets/js/config.js`, replace `PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with that URL.
8. Test each form and verify separate tabs named `service`, `career`, and `academic` appear in your Sheet.

**Important:** A public web-app endpoint can be abused by bots. Add rate limiting or a spam-protection layer before a public launch if the forms attract spam. Don't collect sensitive identity or financial information in these forms.

## 3. Configure Razorpay for Academics registrations
GitHub Pages is static and cannot safely hold a Razorpay Secret. The included `payment-backend/` Node service creates Razorpay orders and verifies payment signatures server-side.

1. Create/activate your Razorpay account and get test keys first. Do not use live keys until you've tested end-to-end.
2. Deploy `payment-backend/` to a Node host that supports environment variables (for example Render, Railway, or your own server). Set its root directory to `payment-backend` if deploying from this repository.
3. Set environment variables on that host:
   - `RAZORPAY_KEY_ID` = your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET` = your Razorpay Secret (server only; never commit it)
   - `ALLOWED_ORIGIN` = exact GitHub Pages origin, e.g. `https://YOUR-USERNAME.github.io` (origin only, no path)
4. Deploy and copy the backend base URL.
5. In `assets/js/config.js`, set:
   - `PAYMENT_API_BASE` = your deployed backend URL, e.g. `https://your-service.example.com`
   - `RAZORPAY_KEY_ID` = your **Key ID** (`rzp_test_...` while testing; later live Key ID)
6. Add any new program IDs to the `ALLOWED_PROGRAMS` set in `payment-backend/server.js`, and add the program object to `assets/js/programs.js`. The backend deliberately fixes the fee at ₹100 (10000 paise) and ignores the browser's claimed amount.
7. Run a full test payment using Razorpay test mode. Verify the form creates a row in the `academic` tab only after signature verification succeeds.

**Production note:** For stronger payment assurance, verify the payment status with Razorpay's API and/or use signed webhooks before marking a registration paid. The starter backend verifies the checkout signature but does not query payment capture status. Do not treat a browser redirect alone as proof of payment.

## 4. Add/edit Academics programs
Edit `assets/js/programs.js`. Duplicate an object inside `window.ZYQEN_PROGRAMS` and give it a unique `id`, `title`, `category`, `date`, `duration`, `format`, `fee`, `symbol`, `description`, and `outcomes`. Keep `fee: 100` while using this starter backend. Add the new ID to `ALLOWED_PROGRAMS` in `payment-backend/server.js`. Cards are rendered automatically and share the same registration flow.

Example:
```js
{
  id: "python-automation-workshop",
  title: "Python Automation Workshop",
  category: "LIVE WORKSHOP",
  date: "Date to be announced",
  duration: "2 hours",
  format: "Online",
  fee: 100,
  symbol: "{ }",
  description: "Learn the basics of automating repeatable tasks with Python.",
  outcomes: ["Understand automation use cases", "Write a small script", "Plan your next project"]
}
```

## 5. Add/edit careers
Edit `assets/js/jobs.js`, duplicate an entry, and use a unique `id`. Career form submissions go to the `career` sheet tab.

## 6. Logo and brand assets
The current logo is a CSS-made “Z” placeholder. Place your real logo in `assets/images/` and update the `.brand-mark` area in each HTML page when you send the logo asset. You can also change the primary colours at the top of `assets/css/style.css` in `:root`.

## 7. Run locally
Open the HTML files directly for a quick visual check. For more reliable local form/payment testing, run a local web server in the project root (for example `python -m http.server 8000`) and set `ALLOWED_ORIGIN=http://localhost:8000` in the backend `.env` while testing.
