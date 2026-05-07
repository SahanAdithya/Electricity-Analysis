'use client'
import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Check if user has explicitly requested light mode
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme === 'light') {
      setIsDark(false)
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      setIsDark(true)
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <button 
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-muted/10 border border-border text-muted hover:text-foreground transition-all shadow-sm active:scale-95"
      title={isDark ? 'Switch to Light Mode' : 'Switch to OLED Dark'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
