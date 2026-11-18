import type { Metadata } from 'next';
import { CONTACT_EMAIL, LAST_UPDATED, OPERATOR_ADDRESS, OPERATOR_NAME } from '@/lib/site';

export const metadata: Metadata = { title: 'Privacy Policy', alternates: { canonical: '/privacy' } };

const request = `mailto:${CONTACT_EMAIL}?subject=Privacy%20request`;

export default function Privacy() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="lead">Last updated: {LAST_UPDATED}. This policy explains what EasyPDF does with your information, and your rights under the GDPR (EU and UK) and the CCPA/CPRA (California).</p>

      <div className="glance">
        <strong>In short</strong>
        <ul>
          <li>Files up to 5 MB are processed in your browser. We never receive them.</li>
          <li>We only receive a file if you choose to upload it. It is deleted as soon as processing finishes.</li>
          <li>No accounts. Your files are never sent to Google or any advertiser.</li>
          <li>We show ads through Google AdSense. Google and its partners may use cookies and similar technologies for ads. In the EEA, UK and Switzerland we ask for your consent first.</li>
          <li>Use the Privacy settings link in the footer to change your choices at any time.</li>
        </ul>
      </div>

      <h2 id="who">1. Who we are</h2>
      <p>The data controller for www.easypdf.website is {OPERATOR_NAME}, {OPERATOR_ADDRESS}. Contact for all privacy matters: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We have not appointed a Data Protection Officer.</p>

      <h2 id="data">2. What we process, why, and on what legal basis</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Information</th><th>Why we use it</th><th>GDPR legal basis</th></tr></thead>
          <tbody>
            <tr><td>Files you choose to upload (PDF or image), which may contain personal information</td><td>To compress or convert the file and return it to you</td><td>Providing the service you request (Art. 6(1)(b))</td></tr>
            <tr><td>Technical data from your request: IP address, browser type, pages and API endpoints requested, time</td><td>To run and secure the site, prevent abuse, and apply rate limits</td><td>Our legitimate interests in security and reliability (Art. 6(1)(f))</td></tr>
            <tr><td>Your email address and message, if you contact us</td><td>To reply to you</td><td>Our legitimate interests in responding to enquiries (Art. 6(1)(f))</td></tr>
            <tr><td>Advertising data collected by Google and its partners through ad code on our pages: cookie and advertising IDs, IP address, device and browser details, pages viewed, approximate location</td><td>To show, measure and personalize ads, and to detect ad fraud</td><td>Your consent (Art. 6(1)(a)) where required, including for cookies and similar technologies. Otherwise Google&apos;s own legal bases.</td></tr>
          </tbody>
        </table>
      </div>
      <p>Files processed in your browser stay on your device. We do not receive or process them. Providing an uploaded file is optional: you can use the browser-based option, or not use the service. We do not use your information for automated decision-making or profiling, and we do not use uploaded files for any other purpose, including training any model. We never send the contents of your files to Google or any advertiser.</p>
      <p>For advertising data, Google acts as an independent controller. How Google uses it is described in <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">How Google uses information from sites or apps that use its services</a>.</p>

      <h2 id="retention">3. How long we keep it</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Information</th><th>Retention</th></tr></thead>
          <tbody>
            <tr><td>Uploaded files</td><td>Held only while processing runs, then deleted immediately. Images are processed in memory. PDFs are written to temporary storage and removed when processing ends, including on failure.</td></tr>
            <tr><td>Rate-limit counters (IP address)</td><td>Held in memory for about one minute. Not written to disk.</td></tr>
            <tr><td>Hosting and server logs</td><td>Kept by our hosting provider for the period its settings define. We do not copy them elsewhere.</td></tr>
            <tr><td>Advertising cookies and IDs</td><td>Set and stored by Google and its partners, for the periods they define. You can delete them in your browser at any time.</td></tr>
            <tr><td>Emails you send us</td><td>As long as needed to handle your request, and up to 12 months afterward.</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="sharing">4. Who we share it with</h2>
      <p>We use a hosting provider, Render, to run the website and process uploads, and an email provider to receive your messages. They act as our processors and may only handle data on our instructions.</p>
      <p>We display ads from Google AdSense. Google and its advertising partners receive the advertising data described in section 2 directly from your browser. We do not give them the contents of your files, and we do not otherwise sell your information. We disclose information to others only if the law requires it.</p>

      <h2 id="transfers">5. International transfers</h2>
      <p>Our hosting servers may be outside your country, including in the United States. Where personal data from the EU, UK or Switzerland is transferred to a country without an adequacy decision, we rely on safeguards such as the European Commission&apos;s Standard Contractual Clauses or the provider&apos;s participation in an approved data transfer framework. Google may process advertising data in countries outside your own, under its own transfer safeguards. You can ask us for details using the contact above.</p>

      <h2 id="rights-eu">6. Your rights under the GDPR and UK GDPR</h2>
      <p>If you are in the EU, EEA or UK, you have the right to:</p>
      <ul>
        <li>access the personal data we hold about you and get a copy;</li>
        <li>have inaccurate data corrected;</li>
        <li>have your data erased;</li>
        <li>restrict how we use your data;</li>
        <li>object to processing based on our legitimate interests;</li>
        <li>receive your data in a portable format;</li>
        <li>withdraw consent at any time, where we rely on consent (we currently do not).</li>
      </ul>
      <p>To use these rights, email <a href={request}>{CONTACT_EMAIL}</a>. We aim to reply within one month. Because we do not keep uploaded files or run accounts, we often hold nothing that can be linked to you, and we may ask for details such as the date and time of your request to find it.</p>
      <p>You also have the right to complain to your local data protection authority. In the EU you can find yours on the European Data Protection Board website. In the UK it is the Information Commissioner&apos;s Office.</p>

      <h2 id="ccpa">7. California privacy notice (CCPA/CPRA)</h2>
      <p>To the extent the California Consumer Privacy Act, as amended by the CPRA, applies to us, this section describes our practices over the past 12 months. California residents can use the rights below.</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Category of personal information</th><th>Source</th><th>Purpose</th><th>Disclosed to</th></tr></thead>
          <tbody>
            <tr><td>Identifiers, such as IP address</td><td>Your device and browser</td><td>Security, abuse prevention, rate limiting</td><td>Hosting provider (service provider)</td></tr>
            <tr><td>Internet or network activity, such as pages and endpoints requested</td><td>Your device and browser</td><td>Operating and securing the site</td><td>Hosting provider (service provider)</td></tr>
            <tr><td>Contents of files you upload, which could include any category of information, including sensitive personal information</td><td>You</td><td>Compressing or converting the file you asked for</td><td>Hosting provider (service provider)</td></tr>
            <tr><td>Identifiers and internet activity collected for advertising, such as cookie IDs, advertising IDs, IP address, pages viewed, approximate location, and inferences drawn for ad personalization</td><td>Your device and browser, through Google AdSense</td><td>Showing and measuring ads</td><td>Google and its advertising partners (third parties)</td></tr>
            <tr><td>Identifiers and communications, such as your email and message</td><td>You</td><td>Replying to you</td><td>Email provider (service provider)</td></tr>
          </tbody>
        </table>
      </div>
      <ul>
        <li><strong>Sale and sharing:</strong> We do not sell personal information for money. Showing personalized ads through Google AdSense can count as &quot;sharing&quot; personal information for cross-context behavioral advertising under California law, and as &quot;selling&quot; or &quot;targeted advertising&quot; under other US state laws. We have no actual knowledge of selling or sharing the personal information of anyone under 16. You can opt out at any time using the Privacy settings link in the footer or by emailing us.</li>
        <li><strong>Sensitive personal information:</strong> Files you upload may contain it. We process it only to provide the service you asked for, and we do not use it to infer characteristics about you, so there is nothing to limit.</li>
        <li><strong>Retention:</strong> As described in section 3.</li>
        <li><strong>Your rights:</strong> to know what we collect, use and disclose; to delete; to correct; to opt out of sale or sharing; to limit the use of sensitive personal information; and to not be treated differently for using these rights.</li>
        <li><strong>How to ask:</strong> email <a href={request}>{CONTACT_EMAIL}</a>. We will confirm receipt within 10 business days and respond within 45 days, which can be extended once by another 45 days if we tell you why. We may need to verify your request by asking you to confirm details we can match. An authorized agent can submit a request for you with your written permission.</li>
        <li><strong>Opt-out preference signals:</strong> We configure our consent tool to treat a Global Privacy Control signal from your browser as a request to opt out of sale and sharing.</li>
      </ul>

      <h2 id="cookies">8. Cookies and similar technologies</h2>
      <p>EasyPDF itself sets no cookies and stores nothing in your browser. Google and its advertising partners may set cookies or use similar technologies, such as device identifiers, to show and measure ads and prevent fraud.</p>
      <p>If you are in the EEA, UK or Switzerland, we ask for your consent before these are used for personalized ads. You can change or withdraw your choice at any time with the Privacy settings link in the footer. Elsewhere you can opt out of personalized ads at <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices" rel="noopener">aboutads.info</a>, and you can block or delete cookies in your browser settings. Blocking cookies does not stop the tool from working.</p>

      <h2 id="security">9. Security</h2>
      <p>The site uses HTTPS. Uploads are limited in size and frequency, checked for the expected file type, and deleted immediately after processing. No system is perfectly secure, so for highly sensitive documents we recommend using the browser-based option, which never uploads your file.</p>

      <h2 id="children">10. Children</h2>
      <p>EasyPDF is not directed at children under 16, and we do not knowingly collect their personal information. If you believe a child has contacted us, email us and we will delete the message.</p>

      <h2 id="changes">11. Changes to this policy</h2>
      <p>We review this policy at least once a year and update it when our practices change. The date at the top shows the latest version.</p>

      <h2 id="contact">12. Contact</h2>
      <p>{OPERATOR_NAME}, {OPERATOR_ADDRESS}. Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
    </>
  );
}
