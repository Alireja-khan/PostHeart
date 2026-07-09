'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { PenLine, Mailbox, Clock, Vault, Heart, Map, Settings, User, LogIn, UserPlus, LogOut, Users, Bell, Globe } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 h-full flex flex-col bg-[#111111] border-r border-[#222] z-20">
      
      {/* Brand logo container */}
      <div className="p-8 border-b border-[#222] flex flex-col items-start pt-12">
        <Link href="/" className="group">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white flex items-baseline">
            Dear You<span className="text-[#c2410c] ml-1">.</span>
          </h1>
        </Link>
        <p className="text-[10px] tracking-widest text-[#888] mt-2 uppercase font-medium">A Private Space</p>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 py-8 flex flex-col space-y-1 overflow-y-auto">
        <NavItem href="/" icon={<Mailbox size={18} />} label="Mailbox" active={pathname === '/'} />
        
        {session && (
          <>
            <NavItem href="/write" icon={<PenLine size={18} />} label="Write Letter" active={pathname === '/write'} />
            <NavItem href="/scheduled" icon={<Clock size={18} />} label="In Transit" active={pathname === '/scheduled'} />
            
            <div className="my-6 border-t border-[#222] mx-6"></div>
            
            <NavItem href="/timeline" icon={<Map size={18} />} label="Timeline" active={pathname === '/timeline'} />
            <NavItem href="/vault" icon={<Vault size={18} />} label="Keepsake Box" active={pathname === '/vault'} />
            <NavItem href="/mood" icon={<Heart size={18} />} label="Couple Board" active={pathname === '/mood'} />
            <NavItem href="/world" icon={<Globe size={18} />} label="My World" active={pathname === '/world'} />
            <NavItem href="/connect" icon={<Users size={18} />} label="Partner" active={pathname === '/connect'} />
            
            <div className="my-6 border-t border-[#222] mx-6"></div>
          </>
        )}
        
        {!session && (
          <>
            <div className="my-6 border-t border-[#222] mx-6"></div>
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
              className="flex items-center px-8 py-3 w-full text-left transition-all duration-200 font-serif text-sm group text-[#888] hover:bg-[#222] hover:text-white border-l-2 border-transparent"
            >
              <span className="mr-4 transition-colors duration-200 text-[#888] group-hover:text-white">
                <LogOut size={18} />
              </span>
              <span className="font-medium tracking-wide">Logout</span>
            </button>
          </>
        )}
      </nav>
    </aside>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center px-8 py-3 transition-all duration-200 font-serif text-sm group ${
        active 
          ? 'bg-[#222] text-white border-l-2 border-[#fff]' 
          : 'text-[#888] hover:bg-[#222] hover:text-white border-l-2 border-transparent'
      }`}
    >
      <span className={`mr-4 transition-colors duration-200 ${
        active ? 'text-white' : 'text-[#888] group-hover:text-white'
      }`}>
        {icon}
      </span>
      <span className="font-medium tracking-wide">{label}</span>
    </Link>
  );
}
