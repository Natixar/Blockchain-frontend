'use client';

import Link from 'next/link';
import { useState } from 'react';
import rolesConfig, { Role } from './rolesConfig';
import mintSVG from '@/public/mint.svg';
import smeltSVG from '@/public/smelt.svg';
import defineSVG from '@/public/define.svg';
import productsSVG from '@/public/products.svg';
import transactionsSVG from '@/public/transactions.svg';
import transactionSVG from '@/public/transaction.svg';
import loadSVG from '@/public/load.svg';
import unloadSVG from '@/public/unload.svg';
import Image from 'next/image';

interface NavbarProps {
  user: {
    roles: Role[]
    firstName: string
    lastName: string
    initials: string
  }
}

const icons = {
  'commodities stock': productsSVG,
  'mint commodity': mintSVG,
  'define commodity': defineSVG,
  'transactions list': transactionsSVG,
  'create transaction': transactionSVG,
  'load package': loadSVG,
  'unload package': unloadSVG,
  'smelt commodities': smeltSVG,
  'scan new product': (
    <svg viewBox="64 64 896 896" focusable="false" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M184 336h656v528H184V336zm0-96v-56c0-4.4-3.6-8-8-8H96c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8zm576-56v56c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8zm0 752v56c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8h-80c-4.4 0-8 3.6-8 8zm-576 0v56c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H184c-4.4 0-8 3.6-8 8z"></path>
    </svg>
  ),
  'add new product type': (
    <svg viewBox="64 64 896 896" focusable="false" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M832 144H192c-35.3 0-64 28.7-64 64v640c0 35.3 28.7 64 64 64h640c35.3 0 64-28.7 64-64V208c0-35.3-28.7-64-64-64zm-160 328H480v96H416v-96H288v-48h128v-96h64v96h192v48z"></path>
    </svg>
  ),
};

export default function Navbar({ user }: NavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const uniqueLinks = new Map<string, string>();

  user.roles.forEach((role) => {
    rolesConfig[role as Role]?.forEach((link) => {
      uniqueLinks.set(link.path, link.label);
    });
  });

  const links = Array.from(uniqueLinks.entries()).map(([path, label]) => ({
    path,
    label,
  }));

  const handleSignout = async () => {
    await fetch('/auth/signout', { method: 'GET' });
    window.location.href = '/auth/signin';
  };

  return (
    <div className="bg-blue-700 text-white sticky top-0 p-4 flex justify-between items-center lg:hidden z-10" style={{ backgroundColor: 'rgb(5, 55, 89)' }}>
      <span className="text-xl">NATIXAR</span>
      <div className="flex items-center space-x-4 relative">
        <span
          className="placeholder-icon-user cursor-pointer"
          onClick={() => setAccountMenuOpen(!accountMenuOpen)}
        >
          <div className="w-8 h-8 bg-white text-center text-blue-900 font-bold rounded-full flex items-center justify-center">
            {user.initials.toUpperCase()}
          </div>        </span>
        {accountMenuOpen && (
          <div className="absolute right-0 top-10 mt-2 w-48 bg-white text-black rounded-md shadow-lg">
            <Link href="/account" className="block px-4 py-2 hover:bg-gray-200 rounded-md">
              Account Settings
            </Link>
            <button
              onClick={handleSignout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-200 rounded-md"
            >
              Sign-Out
            </button>
          </div>
        )}
        <button onClick={() => setDrawerOpen(true)} data-testid="navbar-menu-button">
          <span className="placeholder-icon-hamburger">☰</span>
        </button>
      </div>
      {drawerOpen && (
        <div
          className="fixed inset-0 text-white p-4 flex flex-col"
          style={{ background: 'linear-gradient(rgb(5, 55, 89), rgb(11, 118, 191))' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xl">NATIXAR</span>
            <button onClick={() => setDrawerOpen(false)}>
              <span className="placeholder-icon-close">X</span>
            </button>
          </div>
          <div className="flex-1 p-4" onClick={() => setDrawerOpen(false)}>
            {links.map((link) => (
              <Link key={link.path} href={link.path as any} className="mt-4 py-4 flex items-center space-x-2">
                <Image src={icons[link.label.toLowerCase() as keyof typeof icons]} alt={link.label} width={24} height={24} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
