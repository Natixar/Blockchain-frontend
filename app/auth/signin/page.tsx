/**
 * This component renders a "Login" page where users can enter their email and password to sign in.
 * Upon form submission, the `handleSignin` action is triggered to authenticate the user.
 * If there is an error (such as invalid credentials), an error message is displayed above the form.
 *
 * The component includes form validation for both email and password inputs,
 * and provides a link to the "Forgot Password" page for users who need to reset their password.
 *
 * @module
 */

import { handleSignin } from './signinAction';
import Image from 'next/image';
import backgroundImage from '@/public/auth-bg.png';
import natixarLogo from '@/public/logo-blue.png';
import Link from 'next/link';

export const metadata = {
  title: 'Sign-in',
  description: 'Sign-in to your account',
};

export default function SigninPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const error = searchParams.error;

  return (
    <div className="flex min-h-screen">
      <Image
        src={backgroundImage}
        alt="Powering the future background"
        fill
        className="absolute inset-0 z-0 object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black opacity-20"></div> {/* Overlay */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-cover bg-center relative">
        <div className="absolute top-0 left-0 m-6 z-10">
          <Image src={natixarLogo} alt="NATIXAR Logo" width={150} height={50} priority />
        </div>
        <div className="relative z-10 text-white p-10 text-center">
          <h1 className="text-9xl font-semibold">Powering the <span className="text-green-400 font-extrabold">future</span> today.</h1>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 relative">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white shadow-xl space-y-8">
          <h1 className="text-4xl font-semibold text-center text-blue-900">Sign-In</h1>
          {error && <p className="text-sm text-center text-red-600">Invalid credentials, please try again.</p>}
          <form action={handleSignin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-700 rounded-md shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Sign-in
            </button>
          </form>
          <div className="text-center">
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
