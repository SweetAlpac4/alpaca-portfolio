type Props = {
  name: string
  className?: string
}

const icons: Record<string, JSX.Element> = {
  github: (
    <path d="M9 19c-4 1.5-4-2-6-2m12 4v-3.6c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.7 1.8 5.7 2.1 5.7 2.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.3 8.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v1.5" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" />
      <path d="m2 6 10 7 10-7" />
    </>
  ),
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="0" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </>
  ),
  twitter: (
    <path d="M22 4a10 10 0 0 1-3 1 4.5 4.5 0 0 0-8 3v1A11 11 0 0 1 2 4s-4 9 5 13a12 12 0 0 1-7 2c9 5 20 0 20-11v-.5A7 7 0 0 0 22 4z" />
  ),
  youtube: (
    <>
      <rect x="2" y="5" width="20" height="14" />
      <path d="m10 9 5 3-5 3z" fill="currentColor" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </>
  ),
}

export function SocialIcon({ name, className = 'social__icon' }: Props) {
  const icon = icons[name.toLowerCase()] ?? icons.link

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      {icon}
    </svg>
  )
}
