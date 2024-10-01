/**
 * This component renders a "Forgot Password" page where users can request a password reset link by providing their email address.
 * Upon form submission, the `handleForgotPassword` action is triggered to send the password reset link to the provided email.
 *
 * The component includes form validation for the email input and displays a user-friendly interface with a reset button.
 * It uses the same background and UI as the "Sign-In" page.
 *
 * @module
 */

import { handleForgotPassword } from './resetpwdAction';
import Image from 'next/image';
import backgroundImage from '@/public/auth-bg.png';
import natixarLogo from '@/public/logo-blue.png';
import Link from 'next/link';

export const metadata = {
  title: 'Forgot Password',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
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
          <h1 className="text-4xl font-semibold text-center text-blue-900">Reset Password</h1>
          <form action={handleForgotPassword} className="space-y-6">
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
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-700 rounded-md shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Send Reset Link
            </button>
          </form>
          <div className="text-center">
            <Link href="/auth/signin" className="text-sm text-blue-600 hover:underline">
              Remember your password? Sign-in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
