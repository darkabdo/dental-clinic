import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import PageMeta from '../components/PageMeta'
import '../styles/Landing.css'
import oralSurgeryImage from '../assets/landing/oral-surgery.jpeg'
import followUpImage from '../assets/landing/follow-up.jpg'
import digitalClinicalRecordsImage from '../assets/landing/digital-clinical-records.jpg'

const Landing = () => {
  const [dentists, setDentists] = useState([])
  const fallbackVisual = (title, tone = '#0f4c81') =>
    `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${tone}" />
            <stop offset="100%" stop-color="#1f7cc0" />
          </linearGradient>
        </defs>
        <rect width="1200" height="700" fill="url(#g)"/>
        <circle cx="1020" cy="120" r="160" fill="rgba(255,255,255,0.15)"/>
        <circle cx="210" cy="580" r="190" fill="rgba(255,255,255,0.12)"/>
        <text x="80" y="360" fill="white" font-size="64" font-family="Arial" font-weight="700">${title}</text>
      </svg>
    `)}`

  const portraitFallback = (fullName) => {
    const initials = fullName
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0] || '')
      .join('')
      .toUpperCase()
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260">
        <defs>
          <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f4c81"/>
            <stop offset="100%" stop-color="#2a86cf"/>
          </linearGradient>
        </defs>
        <rect width="260" height="260" fill="url(#p)"/>
        <circle cx="130" cy="104" r="50" fill="rgba(255,255,255,0.82)"/>
        <path d="M58 228c16-40 52-62 72-62s56 22 72 62" fill="rgba(255,255,255,0.82)"/>
        <text x="130" y="242" text-anchor="middle" fill="#fff" font-size="30" font-family="Arial" font-weight="700">${initials}</text>
      </svg>
    `)}`
  }

  const withFallback = (label, tone) => (e) => {
    e.currentTarget.src = fallbackVisual(label, tone)
  }

  const dentistProfilePhotos = [
    'https://randomuser.me/api/portraits/women/65.jpg',
    'https://randomuser.me/api/portraits/men/44.jpg',
    'https://randomuser.me/api/portraits/women/32.jpg',
    'https://randomuser.me/api/portraits/men/71.jpg',
    'https://randomuser.me/api/portraits/women/50.jpg',
  ]
  const trustHighlights = [
    {
      title: 'Premium sterilization',
      text: 'Modern protocols and monitored sterilization rooms',
      image:
        'https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Transparent treatment',
      text: 'Clear plans, follow-ups, and explained procedures',
      image:
        'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Specialist network',
      text: 'Ortho, cosmetic, surgery, and restorative experts',
      image:
        'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Digital clinical records',
      text: 'Organized timelines with diagnosis and treatment notes',
      image: digitalClinicalRecordsImage,
    },
  ]

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const response = await axios.get('/api/dentist/list')
        setDentists(response.data)
      } catch (error) {
        setDentists([])
      }
    }
    fetchDentists()
  }, [])

  return (
    <div className="landing">
      <PageMeta
        title="Home"
        description="Advanced dental care — book visits and stay connected with your clinical team."
      />
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Advanced Dental Care, Fully Connected</h1>
          <p>
            A modern clinic platform where patients, dentists, treatment history, and
            follow-up care stay linked in one professional journey.
          </p>
          <div className="hero-buttons">
            <Link to="/patient-workspace/book" className="btn btn-primary">
              Book an Appointment
            </Link>
            <Link to="/register" className="btn btn-outline">
              Sign up
            </Link>
          </div>
        </div>
      </section>

      <section className="live-strip">
        <div className="container live-strip-grid">
          <article>
            <strong>+1,200</strong>
            <span>Patients managed through unified clinical files.</span>
          </article>
          <article>
            <strong>98%</strong>
            <span>Follow-up adherence with organized treatment plans.</span>
          </article>
          <article>
            <strong>24/7</strong>
            <span>Always-visible dentist availability and appointment flow.</span>
          </article>
        </div>
      </section>

      <section className="services services-premium">
        <div className="container">
          <h2>Designed for Trust and Clarity</h2>
          <div className="feature-grid">
            <div className="feature-tile">
              <img
                className="feature-media"
                data-variant="a"
                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80"
                alt="Appointment coordination visual"
                onError={withFallback('Connected Appointments', '#0f4c81')}
              />
              <h3>Connected Appointments</h3>
              <p>Bookings link patients to verified dentist profiles and clinic details.</p>
            </div>
            <div className="feature-tile">
              <img
                className="feature-media"
                data-variant="b"
                src="https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=1200&q=80"
                alt="Clinical context visual"
                onError={withFallback('Clinical Context', '#12795f')}
              />
              <h3>Clinical Context</h3>
              <p>Symptoms, urgency, diagnosis, and plans stay organized in one timeline.</p>
            </div>
            <div className="feature-tile">
              <img
                className="feature-media"
                data-variant="c"
                src={followUpImage}
                alt="Follow-up treatment visual"
                onError={withFallback('Follow-up Planning', '#4c56bc')}
              />
              <h3>Follow‑up Planning</h3>
              <p>Every visit can produce notes, medications, procedures, and follow‑up dates.</p>
            </div>
            <div className="feature-tile">
              <img
                className="feature-media"
                data-variant="d"
                src="https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&w=1200&q=80"
                alt="Schedule management visual"
                onError={withFallback('Schedule Visibility', '#ad6e0d')}
              />
              <h3>Schedule Visibility</h3>
              <p>Dentists see daily workload and patients pick only available slots.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container">
          <div className="trust-strip-header">
            <h2>Why Patients Feel Confident Here</h2>
            <p>Every touchpoint is designed to feel clear, modern, and trustworthy.</p>
          </div>
          <div className="trust-strip-inner">
            {trustHighlights.map((item) => (
              <article className="trust-item" key={item.title}>
                <img src={item.image} alt={item.title} onError={withFallback(item.title, '#0f4c81')} />
                <div className="trust-item-body">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="care-path">
        <div className="container">
          <h2>Your Care Path, Step by Step</h2>
          <div className="care-path-grid">
            <article>
              <strong>01</strong>
              <h3>Book and Confirm</h3>
              <p>Select a dentist, pick your day, and reserve a verified slot in seconds.</p>
            </article>
            <article>
              <strong>02</strong>
              <h3>Clinical Assessment</h3>
              <p>Your symptoms and urgency are captured before consultation starts.</p>
            </article>
            <article>
              <strong>03</strong>
              <h3>Treatment Planning</h3>
              <p>Dentists document diagnosis, procedures, and medication in one file.</p>
            </article>
            <article>
              <strong>04</strong>
              <h3>Follow-up Tracking</h3>
              <p>Every visit stays linked so your treatment history is always clear.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="clinic-gallery">
        <div className="container">
          <h2>Inside Our Clinical Environment</h2>
          <div className="gallery-grid">
            <img
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80"
              alt="Modern dental treatment room"
              onError={withFallback('Clinical Environment', '#0f4c81')}
            />
            <img
              src="https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?auto=format&fit=crop&w=1200&q=80"
              alt="Dentist consultation with patient"
              onError={withFallback('Dentist Consultation', '#1a6ca8')}
            />
            <img
              src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80"
              alt="Professional dental instruments setup"
              onError={withFallback('Dental Instruments', '#205f94')}
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="container">
          <h2>Our Services</h2>
          <div className="service-tiles">
            <div className="service-tile">
              <img
                src="https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=1200&q=80"
                alt="General dentistry service"
                onError={withFallback('General Dentistry', '#0f4c81')}
              />
              <div className="service-body">
                <h3>General Dentistry</h3>
                <p>Checkups, cleanings, prevention, and restorative care.</p>
              </div>
            </div>
            <div className="service-tile">
              <img
                src="https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=1200&q=80"
                alt="Cosmetic dentistry service"
                onError={withFallback('Cosmetic Dentistry', '#0d5f98')}
              />
              <div className="service-body">
                <h3>Cosmetic Dentistry</h3>
                <p>Whitening, veneers, bonding, and aesthetic smile design.</p>
              </div>
            </div>
            <div className="service-tile">
              <img
                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80"
                alt="Orthodontics service"
                onError={withFallback('Orthodontics', '#165f95')}
              />
              <div className="service-body">
                <h3>Orthodontics</h3>
                <p>Aligners and braces plans with progress monitoring.</p>
              </div>
            </div>
            <div className="service-tile">
              <img
                src={oralSurgeryImage}
                alt="Oral surgery service"
                onError={withFallback('Oral Surgery', '#134f81')}
              />
              <div className="service-body">
                <h3>Oral Surgery</h3>
                <p>Extractions, surgical planning, and post‑op follow‑ups.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team">
        <div className="container">
          <h2>Meet Our Dentists</h2>
          <div className="team-grid">
            {dentists.length === 0 ? (
              <div className="team-member">
                <div className="member-avatar">DC</div>
                <h3>Dental Team</h3>
                <p>Professional multi-specialty support</p>
                <span className="specialty">Register dentists to see live profiles</span>
              </div>
            ) : (
              dentists.map((dentist, index) => (
                <div className="team-member" key={dentist._id}>
                  <img
                    className="member-photo"
                    src={dentistProfilePhotos[index % dentistProfilePhotos.length]}
                    alt={`${dentist.fullName} portrait`}
                    onError={(e) => {
                      e.currentTarget.src = portraitFallback(dentist.fullName)
                    }}
                  />
                  <h3>{dentist.fullName}</h3>
                  <p>{dentist.specialty}</p>
                  <span className="specialty">{dentist.experienceYears || 1}+ years experience</span>
                  <p className="specialty">{dentist.currentFocus || 'Patient consultations'}</p>
                  <p className="specialty">Status: {(dentist.currentStatus || 'available').replace('_', ' ')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Book Your Appointment?</h2>
          <p>Join our growing family of satisfied patients</p>
          <Link to="/patient-workspace/book" className="btn btn-primary btn-large">
            Schedule Now
          </Link>
        </div>
      </section>

      <section className="location-contact">
        <div className="container location-contact-grid">
          <div className="location-panel">
            <h2>Visit Our Clinic</h2>
            <p>123 Smile Avenue, Downtown Health District</p>
            <p>Mon - Fri: 9:00 AM - 6:00 PM | Sat: 10:00 AM - 4:00 PM</p>
            <p>Phone: (555) 123-4567 | Email: hello@dentalclinic.com</p>
            <iframe
              title="Clinic map"
              src="https://www.google.com/maps?q=dental%20clinic&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <form className="contact-panel" onSubmit={(e) => e.preventDefault()}>
            <h3>Quick Contact</h3>
            <p>Send us a message and our team will call you back.</p>
            <input type="text" placeholder="Full name" />
            <input type="tel" placeholder="Phone number" />
            <input type="email" placeholder="Email address" />
            <textarea rows="4" placeholder="How can we help?" />
            <button type="submit" className="btn btn-primary">Send Request</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>DentalClinic</h4>
              <p>Your trusted partner in dental health</p>
            </div>
            <div className="footer-section">
              <h4>Hours</h4>
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 10:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Phone: (555) 123-4567</p>
              <p>Email: hello@dentalclinic.com</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 DentalClinic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
