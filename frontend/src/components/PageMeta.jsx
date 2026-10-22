import { useEffect } from 'react'

const DEFAULT_TITLE = 'Dental Clinic — Your Smile, Our Priority'
const DEFAULT_DESC =
  'Book visits, manage your health timeline, and connect with our dental care network.'

export default function PageMeta({ title, description }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · DentalClinic` : DEFAULT_TITLE
    const prevTitle = document.title
    document.title = fullTitle

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    const prevDesc = meta.getAttribute('content')
    meta.setAttribute('content', description || DEFAULT_DESC)

    return () => {
      document.title = prevTitle
      if (prevDesc != null) meta.setAttribute('content', prevDesc)
    }
  }, [title, description])

  return null
}
