import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/PageFooter.css'

export default function PageFooter() {
  return (
    <footer className="page-footer">
      <div className="container page-footer__inner">
        <div className="page-footer__block">
          <strong className="page-footer__brand">DentalClinic</strong>
          <p className="page-footer__muted">Professional Care Network</p>
        </div>
        <div className="page-footer__block">
          <h2 className="page-footer__heading">Hours</h2>
          <p>Mon–Fri · 8:00 – 18:00</p>
          <p>Sat · 9:00 – 14:00</p>
        </div>
        <div className="page-footer__block">
          <h2 className="page-footer__heading">Contact</h2>
          <p>
            <a href="tel:+15551234567">+1 (555) 123-4567</a>
          </p>
          <p>
            <a href="mailto:hello@dentalclinic.com">hello@dentalclinic.com</a>
          </p>
        </div>
        <div className="page-footer__block page-footer__links">
          <Link to="/privacy">Privacy</Link>
          <Link to="/login">Sign in</Link>
          <Link to="/register">Sign up</Link>
        </div>
      </div>
      <div className="page-footer__bar">
        <div className="container page-footer__bar-inner">
          <span>© {new Date().getFullYear()} DentalClinic</span>
        </div>
      </div>
    </footer>
  )
}
