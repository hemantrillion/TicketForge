import React from 'react';

export default function InfoSections() {
  return (
    <>
      {/* LOWER SECTIONS */}
      <section className="ct-features-section">
        <h2 className="ct-section-heading">Why Book Train Tickets With Confirmtkt?</h2>

        <div className="ct-features-grid-clean">
          <div className="ct-feat-item">
            <div className="ct-feat-icon-circle">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l4 4-4 4M8 18l-4-4 4-4"/></svg>
            </div>
            <div>
              <div className="ct-feat-title">Train Alternates & Prediction</div>
              <div className="ct-feat-desc">Travel smart with our same train alternates and prediction feature and improve your chance of getting train tickets.</div>
            </div>
          </div>

          <div className="ct-feat-item">
            <div className="ct-feat-icon-circle">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <div>
              <div className="ct-feat-title">UPI Enabled Secured Payment</div>
              <div className="ct-feat-desc">Payment on Confirmtkt is highly secured. Easy UPI and other multiple payment modes available.</div>
            </div>
          </div>

          <div className="ct-feat-item">
            <div className="ct-feat-icon-circle">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <div className="ct-feat-title">Free Cancellation on Train Tickets</div>
              <div className="ct-feat-desc">Get a full refund on train tickets by opting our free cancellation feature.</div>
            </div>
          </div>

          <div className="ct-feat-item">
            <div className="ct-feat-icon-circle">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div>
              <div className="ct-feat-title">Train Booking & Enquiry Support</div>
              <div className="ct-feat-desc">24X7 customer support, for any train enquiry & booking related queries call 08068243910.</div>
            </div>
          </div>

          <div className="ct-feat-item">
            <div className="ct-feat-icon-circle">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div>
              <div className="ct-feat-title">Instant Refund & Cancellation</div>
              <div className="ct-feat-desc">Get an instant refund and book your next Train ticket easily.</div>
            </div>
          </div>

          <div className="ct-feat-item">
            <div className="ct-feat-icon-circle">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <div className="ct-feat-title">Live Train Status Tracking</div>
              <div className="ct-feat-desc">Train status & notification of your train tickets.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="ct-rcb-banner-box">
        <div>
          <div className="ct-rcb-title">Confirmtkt: Official Train Ticketing Partner of The Royal Challengers Bengaluru</div>
          <div className="ct-rcb-sub">Come join us on the RCB Express and become a #TrainTicketKing. Win match tickets and more exciting prizes!</div>
        </div>
        <button className="ct-search-cta" style={{ borderRadius: '8px', minHeight: 'auto', padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>PLAY NOW</button>
      </section>

      {/* FULL UNTRUNCATED INFORMATIONAL CONTENT & FAQS */}
      <section className="ct-info-container">
        <h2 className="ct-info-h2">IRCTC Ticket Booking on ConfirmTkt</h2>
        <p className="ct-info-text">
          ConfirmTkt is one of the highest rated App to book IRCTC train tickets online. You can book a train ticket on ConfirmTkt App or website with your existing IRCTC login credentials or create a new one. Increase your chance of getting a Confirm train ticket with our best-in-market same-train alternates and prediction feature. IRCTC train enquiry and booking are backed by a unique and efficient algorithm that predicts your IRCTC PNR in seconds based on historical trends.
        </p>

        <h3 className="ct-info-h3">IRCTC Booking Types</h3>
        <p className="ct-info-text">
          • <strong>IRCTC UTS (Unreserved Ticketing System)</strong>: Paperless ticketing app for unreserved coaches.<br/>
          • <strong>IRCTC Full Tariff Rate (FTR)</strong>: Booking entire coaches or trains for tours/occasions.<br/>
          • <strong>IRCTC General Booking</strong>: Advance train booking with prepone/postpone flexibility.<br/>
          • <strong>IRCTC Tatkal Booking</strong>: Last-minute emergency tickets opening at 10:00 AM (AC) and 11:00 AM (Non-AC).<br/>
          • <strong>IRCTC Ladies Quota</strong>: Reserved sleeper/3A berths for women traveling alone or with infants.
        </p>

        <h3 className="ct-info-h3">How to Book IRCTC Ticket and Use IRCTC Login on ConfirmTkt</h3>
        <p className="ct-info-text">
          1. Select source and destination stations.<br/>
          2. Select date of journey and quota (General/Tatkal).<br/>
          3. Select train from list of available express trains.<br/>
          4. Select class (Sleeper, 3rd AC, 2nd AC, 1st AC).<br/>
          5. Enter passenger details & berth preferences (Lower, Middle, Upper).<br/>
          6. Enter mobile & email for e-ticket delivery.<br/>
          7. Opt for Free Cancellation protection for 100% full refund.<br/>
          8. Pay securely via ConfirmTkt UPI, Card, or NetBanking.<br/>
          9. Enter IRCTC password credentials.<br/>
          10. Receive instant e-Ticket (ERS Slip) via SMS and Email.
        </p>

        <h3 className="ct-info-h3">Valid ID Cards During Train Journey</h3>
        <p className="ct-info-text">
          Passengers must carry one original ID proof during the journey: Aadhaar Card, Passport, Voter ID Card, Driving License, PAN Card, Govt Photo ID, Bank Passbook with photo, Student ID, or Laminated Credit Card.
        </p>

        <h3 className="ct-info-h3">IRCTC Train Ticket Booking FAQ</h3>
        <div className="ct-faq-card">
          <div className="ct-faq-q">Q) What is TATKAL Booking in IRCTC and how is it done?</div>
          <div className="ct-faq-a">A: Tatkal bookings are meant for last-minute travel. AC Tatkal opens at 10:00 AM and Non-AC Tatkal opens at 11:00 AM 1 day prior to journey departure date. Confirmed Tatkal tickets are non-refundable.</div>
        </div>
        <div className="ct-faq-card">
          <div className="ct-faq-q">Q) What is the maximum number of tickets allowed per booking?</div>
          <div className="ct-faq-a">A: Up to 6 passengers per booking in General Quota, and maximum 4 passengers per booking under Tatkal Quota.</div>
        </div>
        <div className="ct-faq-card">
          <div className="ct-faq-q">Q) How does ConfirmTkt increase my chance of getting a confirmed ticket?</div>
          <div className="ct-faq-a">A: ConfirmTkt uses historical data algorithms to calculate CNF prediction scores and suggests same-train alternate boarding points to guarantee a seat.</div>
        </div>

        <h3 className="ct-info-h3">Top Train Routes in India</h3>
        <div className="ct-routes-grid">
          <div className="ct-route-card">
            <div className="ct-route-dest">Trains to Bengaluru</div>
            <div className="ct-route-links">via Chennai • Mysore • Hyderabad • New Delhi</div>
          </div>
          <div className="ct-route-card">
            <div className="ct-route-dest">Trains to New Delhi</div>
            <div className="ct-route-links">via Patna • Varanasi • Mumbai • Lucknow</div>
          </div>
          <div className="ct-route-card">
            <div className="ct-route-dest">Trains to Mumbai</div>
            <div className="ct-route-links">via New Delhi • Pune • Ahmedabad • Surat</div>
          </div>
        </div>
      </section>
    </>
  );
}
