'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, Shield, ShoppingCart, Map, Briefcase, Menu, X } from 'lucide-react'
import { useSoundManager } from '@/components/sound-manager'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { playButtonClick, playHover } = useSoundManager()

  const navItems = [
    { href: '/', label: 'Home', icon: Wallet }
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-blue-50 hover:text-blue-100 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">DL</span>
            </div>
            <span className="text-xl font-bold">DhartiLink</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-50 hover:bg-blue-500/10 transition-colors"
                  onMouseEnter={playHover}
                  onClick={playButtonClick}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-300 hover:text-blue-50"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen)
              playButtonClick()
            }}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start flex items-center gap-2 text-gray-300 hover:text-blue-50 hover:bg-blue-500/10"
                    onClick={() => {
                      setIsMenuOpen(false)
                      playButtonClick()
                    }}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
