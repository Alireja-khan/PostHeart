'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { PenLine, Mailbox, Clock, Vault, Heart, Map, Settings, User, LogIn, UserPlus, LogOut, Users, Bell, Globe, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Close the sidebar menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Hamburger Menu Button for Mobile */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-bg-secondary border border-border-primary text-text-primary hover:bg-bg-tertiary transition-colors shadow-md"
      >
        <Menu size={20} />
      </button>

      {/* Backdrop for Mobile Sidebar */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-35 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 h-full flex flex-col bg-bg-primary border-r border-border-primary z-40 transform transition-transform duration-300 md:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Close Button inside Sidebar (Mobile only) */}
        <div className="md:hidden absolute top-4 right-4 z-50">
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Brand logo container */}
        <div className="p-8 border-b border-border-primary flex flex-col items-start pt-12">
          <Link href="/" className="group">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-text-primary flex items-baseline">
              Dear You<span className="text-[#c2410c] ml-1">.</span>
            </h1>
          </Link>
          <p className="text-[10px] tracking-widest text-text-secondary mt-2 uppercase font-medium">A Private Space</p>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 py-8 flex flex-col space-y-1 overflow-y-auto">
          <NavItem href="/" icon={<Mailbox size={18} />} label="Mailbox" active={pathname === '/'} />
          
          {session && (
            <>
              <NavItem href="/write" icon={<PenLine size={18} />} label="Write Letter" active={pathname === '/write'} />
              
              <div className="my-6 border-t border-border-primary mx-6"></div>
              
              <NavItem href="/world" icon={<Globe size={18} />} label="My World" active={pathname === '/world'} />
              <NavItem href="/connect" icon={<Users size={18} />} label="Partner" active={pathname === '/connect'} />
              
              <div className="my-6 border-t border-border-primary mx-6"></div>
            </>
          )}
          
          {!session && (
            <>
              <div className="my-6 border-t border-border-primary mx-6"></div>
              <NavItem href="/login" icon={<LogIn size={18} />} label="Login" active={pathname === '/login'} />
              <NavItem href="/register" icon={<UserPlus size={18} />} label="Register" active={pathname === '/register'} />
            </>
          )}

          {session && (
            <>
              <NavItem href="/profile" icon={<User size={18} />} label="Profile" active={pathname === '/profile'} />
              <NavItem href="/settings" icon={<Settings size={18} />} label="Settings" active={pathname === '/settings'} />
              <button 
                onClick={() => signOut()}
                className="flex items-center px-8 py-3 w-full text-left transition-all duration-200 font-serif text-sm group text-text-secondary hover:bg-bg-tertiary hover:text-text-primary border-l-2 border-transparent"
              >
                <span className="mr-4 transition-colors duration-200 text-text-secondary group-hover:text-text-primary">
                  <LogOut size={18} />
                </span>
                <span className="font-medium tracking-wide">Logout</span>
              </button>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center px-8 py-3 transition-all duration-200 font-serif text-sm group ${
        active 
          ? 'bg-[#222] text-text-primary border-l-2 border-[#fff]' 
          : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary border-l-2 border-transparent'
      }`}
    >
      <span className={`mr-4 transition-colors duration-200 ${
        active ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
      }`}>
        {icon}
      </span>
      <span className="font-medium tracking-wide">{label}</span>
    </Link>
  );
}
