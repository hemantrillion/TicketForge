import React from 'react';

export default function Footer() {
  return (
    <footer className="ct-footer">
      <div className="ct-footer-grid">
        <div>
          <div className="ct-footer-title">Book</div>
          <ul className="ct-footer-list">
            <li><a href="#trains">IRCTC Tickets</a></li>
            <li><a href="#pnr">PNR Status</a></li>
            <li><a href="#food">Order Food on Train</a></li>
          </ul>
        </div>
        <div>
          <div className="ct-footer-title">Features</div>
          <ul className="ct-footer-list">
            <li><a href="#pnr">PNR Status</a></li>
            <li><a href="#running">Train Running Status</a></li>
            <li><a href="#schedule">Train Schedule</a></li>
          </ul>
        </div>
        <div>
          <div className="ct-footer-title">About ConfirmTkt</div>
          <ul className="ct-footer-list">
            <li><a href="#contact">Contact Us (08068243910)</a></li>
            <li><a href="#media">Media Kit</a></li>
          </ul>
        </div>
        <div>
          <div className="ct-footer-title">Partners</div>
          <ul className="ct-footer-list">
            <li><a href="#ixigo">ixigo</a></li>
            <li><a href="#abhibus">abhibus</a></li>
          </ul>
        </div>
        <div>
          <div className="ct-footer-title">Legal</div>
          <ul className="ct-footer-list">
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms & Conditions</a></li>
          </ul>
        </div>
      </div>

      <div className="ct-footer-bottom">
        Confirmtkt.com is official partner of IRCTC to book IRCTC train tickets and Railway train enquiry.<br/>
        © Copyright @ Le Travenues Technology Ltd. All Rights Reserved.
      </div>
    </footer>
  );
}
