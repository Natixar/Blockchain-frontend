'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
import logo from '@/public/logo.png';

interface SidebarProps {
    user: {
        roles: Role[]
        firstName: string
        lastName: string
        initials: string
    }
}

export default function Sidebar({ user }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [links, setLinks] = useState<{ path: string, label: string }[]>([]);

    useEffect(() => {
        const uniqueLinks = new Map<string, string>();

        user.roles.forEach((role) => {
            rolesConfig[role as keyof typeof rolesConfig]?.forEach(({ path, label }) => {
                uniqueLinks.set(path, label);
            });
        });

        setLinks(Array.from(uniqueLinks, ([path, label]) => ({ path, label })));
    }, [user.roles]);

    const handleSignout = async () => {
        await fetch('/auth/signout', { method: 'GET' });
        window.location.href = '/auth/signin';
    };

    const icons = {
        'products list': productsSVG,
        'mint product': mintSVG,
        'declare product': defineSVG,
        'transactions list': transactionsSVG,
        'create transaction': transactionSVG,
        'load package': loadSVG,
        'unload package': unloadSVG,
        'smelter product': smeltSVG,
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

    return (
        <div className="h-full hidden lg:block">
            {/* Navbar at the top, full width */}
            <div className="flex items-center justify-between p-4 bg-[rgb(5,55,89)] w-full fixed top-0 left-0 z-50">
                {/* Brand Logo */}
                <div className="flex items-center">
                    <Image
                        src={logo}
                        alt="Logo"
                        width={collapsed ? 60 : 120}
                        height={collapsed ? 60 : 120}
                    />
                </div>

                <div className="flex items-center space-x-4">
                    {/* Account Settings Dropdown */}
                    <div
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    >
                        <div className="w-8 h-8 bg-white text-center text-blue-900 font-bold rounded-full flex items-center justify-center">
                            {user.initials.toUpperCase()}
                        </div>
                        <span className="text-white">{user.firstName} {user.lastName}</span>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`flex flex-col text-white h-full pt-16 ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300`}
                style={{ background: 'linear-gradient(rgb(5, 55, 89), rgb(11, 118, 191))' }}
            >
                {/* Collapsed button aligned to sidebar right border */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-white ml-auto mr-4 my-2"
                >
                    {collapsed ? (
                        <svg width="1em" height="1em" fill="currentColor" data-icon="menu-unfold" viewBox="64 64 896 896">
                            <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1 298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z" />
                        </svg>
                    ) : (
                        <svg width="1em" height="1em" fill="currentColor" data-icon="menu-fold" viewBox="64 64 896 896">
                            <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM115.4 518.9 271.7 642c5.8 4.6 14.4.5 14.4-6.9V388.9c0-7.4-8.5-11.5-14.4-6.9L115.4 505.1a8.74 8.74 0 0 0 0 13.8z" />
                        </svg>
                    )}
                </button>
                <div className="flex flex-col justify-between h-full">
                    <div className="px-4">
                        {links.map((link) => (
                            <Link key={link.path} href={link.path as any} className="mb-4 block hover:bg-white hover:bg-opacity-10 p-4 rounded-xl">
                                <div className="flex items-center space-x-4">
                                    <Image src={icons[link.label.toLowerCase() as keyof typeof icons]} alt={link.label} width={24} height={24} />
                                    {!collapsed && <span>{link.label}</span>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {accountMenuOpen && (
                <div className="absolute top-0 right-0 mt-16 mr-4 bg-white rounded-md shadow-lg z-10">
                    <Link href="/account" className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 rounded-md">
                        <svg viewBox="64 64 896 896" focusable="false" data-icon="setting" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                            <path d="M924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.8s-1.6-38.8-4.7-57.8l65.5-56a32.03 32.03 0 009.3-35.2l-.9-2.6a443.74 443.74 0 00-79.7-137.9l-1.8-2.1a32.12 32.12 0 00-35.1-9.5l-81.3 28.9c-30-24.6-63.5-44-99.7-57.6l-15.7-85a32.05 32.05 0 00-25.8-25.7l-2.7-.5c-52.1-9.4-106.9-9.4-159 0l-2.7.5a32.05 32.05 0 00-25.8 25.7l-15.8 85.4a351.86 351.86 0 00-99 57.4l-81.9-29.1a32 32 0 00-35.1 9.5l-1.8 2.1a446.02 446.02 0 00-79.7 137.9l-.9 2.6c-4.5 12.5-.8 26.5 9.3 35.2l66.3 56.6c-3.1 18.8-4.6 38-4.6 57.1 0 19.2 1.5 38.4 4.6 57.1L99 625.5a32.03 32.03 0 00-9.3 35.2l.9 2.6c18.1 50.4 44.9 96.9 79.7 137.9l1.8 2.1a32.12 32.12 0 0035.1 9.5l81.9-29.1c29.8 24.5 63.1 43.9 99 57.4l15.8 85.4a32.05 32.05 0 0025.8 25.7l2.7.5a449.4 449.4 0 00159 0l2.7-.5a32.05 32.05 0 0025.8-25.7l15.7-85a350 350 0 0099.7-57.6l81.3 28.9a32 32 0 0035.1-9.5l1.8-2.1c34.8-41.1 61.6-87.5 79.7-137.9l.9-2.6c4.5-12.3.8-26.3-9.3-35zM788.3 465.9c2.5 15.1 3.8 30.6 3.8 46.1s-1.3 31-3.8 46.1l-6.6 40.1 74.7 63.9a370.03 370.03 0 01-42.6 73.6L721 702.8l-31.4 25.8c-23.9 19.6-50.5 35-79.3 45.8l-38.1 14.3-17.9 97a377.5 377.5 0 01-85 0l-17.9-97.2-37.8-14.5c-28.5-10.8-55-26.2-78.7-45.7l-31.4-25.9-93.4 33.2c-17-22.9-31.2-47.6-42.6-73.6l75.5-64.5-6.5-40c-2.4-14.9-3.7-30.3-3.7-45.5 0-15.3 1.2-30.6 3.7-45.5l6.5-40-75.5-64.5c11.3-26.1 25.6-50.7 42.6-73.6l93.4 33.2 31.4-25.9c23.7-19.5 50.2-34.9 78.7-45.7l37.9-14.3 17.9-97.2c28.1-3.2 56.8-3.2 85 0l17.9 97 38.1 14.3c28.7 10.8 55.4 26.2 79.3 45.8l31.4 25.8 92.8-32.9c17 22.9 31.2 47.6 42.6 73.6L781.8 426l6.5 39.9zM512 326c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm79.2 255.2A111.6 111.6 0 01512 614c-29.9 0-58-11.7-79.2-32.8A111.6 111.6 0 01400 502c0-29.9 11.7-58 32.8-79.2C454 401.6 482.1 390 512 390c29.9 0 58 11.6 79.2 32.8A111.6 111.6 0 01624 502c0 29.9-11.7 58-32.8 79.2z"></path>
                        </svg>
                        <span>Account Settings</span>
                    </Link>
                    <button onClick={handleSignout} className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-gray-200 rounded-md">
                        <svg viewBox="64 64 896 896" focusable="false" data-icon="logout" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                            <path d="M868 732h-70.3c-4.8 0-9.3 2.1-12.3 5.8-7 8.5-14.5 16.7-22.4 24.5a353.84 353.84 0 01-112.7 75.9A352.8 352.8 0 01512.4 866c-47.9 0-94.3-9.4-137.9-27.8a353.84 353.84 0 01-112.7-75.9 353.28 353.28 0 01-76-112.5C167.3 606.2 158 559.9 158 512s9.4-94.2 27.8-137.8c17.8-42.1 43.4-80 76-112.5s70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8 47.9 0 94.3 9.3 137.9 27.8 42.2 17.8 80.1 43.4 112.7 75.9 7.9 7.9 15.3 16.1 22.4 24.5 3 3.7 7.6 5.8 12.3 5.8H868c6.3 0 10.2-7 6.7-12.3C798 160.5 663.8 81.6 511.3 82 271.7 82.6 79.6 277.1 82 516.4 84.4 751.9 276.2 942 512.4 942c152.1 0 285.7-78.8 362.3-197.7 3.4-5.3-.4-12.3-6.7-12.3zm88.9-226.3L815 393.7c-5.3-4.2-13-.4-13 6.3v76H488c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 000-12.6z"></path>
                        </svg>
                        <span>Sign-Out</span>
                    </button>
                </div>
            )}
        </div>
    );
}
