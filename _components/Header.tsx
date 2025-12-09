'use client'

import Image from 'next/image'
import logo from '../public/logo.svg'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const menuItems = [
  { name: 'Home', link: '/' },
  { name: 'Pricing', link: '/pricing' },
  { name: 'Contact us', link: '/contact-us' },
]

export default function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMenu = () => setMobileMenuOpen(prev => !prev)
  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image src={logo} height={40} width={40} alt="AI Trip Planner" priority />
              <span className="hidden sm:block font-bold text-2xl text-gray-900">
                AI Trip Planner
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.link}
                  className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/my-trips')}>
                My Trips
              </Button>
              <Button onClick={() => router.push('/create-new-trip')} className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>

            {/* Mobile: Hamburger + Get Started Button */}
            <div className="flex items-center gap-3 md:hidden">
              {/* Get Started Button - Always Visible on Mobile */}
              <Button
                size="sm"
                onClick={() => router.push('/create-new-trip')}
                className="bg-blue-600 hover:bg-blue-700 text-sm"
              >
                Get Started
              </Button>

              {/* Hamburger */}
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Beautiful Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
            onClick={closeMenu}
          />

          {/* Sidebar Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out translate-x-0">
            <div className="flex flex-col h-full">

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <Image src={logo} height={36} width={36} alt="Logo" className="brightness-0 invert" />
                  <span className="font-bold text-xl">AI Trip Planner</span>
                </div>
                <button onClick={closeMenu} className="p-2 hover:bg-white/20 rounded-lg transition">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 px-6 py-10 bg-gray-50">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.link}
                        onClick={closeMenu}
                        className="flex items-center gap-4 py-4 px-5 text-lg font-medium text-gray-800 hover:bg-white hover:text-blue-600 rounded-xl transition-all shadow-sm hover:shadow-md"
                      >
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/my-trips"
                      onClick={closeMenu}
                      className="flex items-center gap-4 py-4 px-5 text-lg font-medium text-blue-600 bg-blue-50 rounded-xl shadow-sm hover:shadow-md border border-blue-200"
                    >
                      <span className="text-xl">My Trips</span>
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Footer */}
              <div className="p-6 border-t bg-white">
                <p className="text-center text-sm text-gray-500">
                  © 2025 AI Trip Planner • Made with love for travelers
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}