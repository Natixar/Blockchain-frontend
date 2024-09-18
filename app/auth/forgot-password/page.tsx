/**
 * This component renders a "Forgot Password" page where users can request a password reset link by providing their email address.
 * Upon form submission, the `handleForgotPassword` action is triggered to send the password reset link to the provided email.
 * 
 * The component includes form validation for the email input, and it displays a user-friendly interface with a reset button.
 * @module
 */

import { handleForgotPassword } from './resetpwdAction';

export const metadata = {
  title: 'Forgot Password',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-center text-blue-900">NATIXAR</h1>
        <h2 className="text-2xl font-semibold text-center text-gray-800">Reset Password</h2>
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
      </div>
    </div>
  );
}
