'use client';

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from "clsx"
import { Film } from 'lucide-react'

const links = [
  { href: '/top-rated', label: 'Top Rated' },
  { href: '/popular', label: 'Popular' },
  { href: '/my-favorites', label: 'Mis Favoritas' },
  { href: '/now-playing', label: 'En Cartelera' },
]

const Header = () => {
  const pathname = usePathname()

  return (
    <header className="w-full bg-gradient-to-b from-gray-900 to-black text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600"
        >
          <Film className="w-6 h-6" />
          MoviesDB
        </Link>

        {/* Navigation */}
        <nav className="flex gap-4 sm:gap-6 text-sm sm:text-base">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "transition-colors hover:text-yellow-400",
                pathname === href ? "text-yellow-400 font-semibold" : "text-gray-300"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Header
