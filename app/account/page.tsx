/**
 * This component allows users to update their account information, including their email address, password, 
 * and first/last name. It includes validation for email and password input, and users must confirm their actions 
 * before proceeding with sensitive changes such as updating the password.
 * 
 * The component manages state for user inputs, loading indicators, error messages, and success notifications. 
 * It also includes a confirmation modal for password updates and provides feedback after each update.
 * @module
 */
'use client';

import { useState, ChangeEvent } from 'react';

export default function ChangeUserInfoPage() {
  const [newEmail, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Clear input fields after a successful update
  function clearFields() {
    setEmail('');
    setPassword('');
    setCurrentPassword('');
    setFirstName('');
    setLastName('');
  }

  // Real-time validation for email
  function handleEmailInput(e: ChangeEvent<HTMLInputElement>) {
    const email = e.target.value;
    setEmail(email);
    setMessage(email.includes('@') ? '' : 'Please enter a valid email address.');
  }

  // Real-time validation for password strength
  function handlePasswordInput(e: ChangeEvent<HTMLInputElement>) {
    const pass = e.target.value;
    setPassword(pass);
    setMessage(pass.length >= 8 ? '' : 'Password must be at least 8 characters long.');
  }

  /**
   * Updates the user's email address.
   */
  async function updateEmail() {
    if (!newEmail.includes('@')) {
      setMessage('Error: Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/account/update/email', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newEmail }),
      });

      if (!response.ok) {
        throw new Error(`Error updating email: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.emailVerificationId) {
        setVerificationId(result.emailVerificationId);
        setMessage('Email updated. Please verify your email to complete the process.');
      } else {
        setMessage('Email updated successfully.');
      }
      clearFields();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Updates the user's password.
   */
  async function updatePassword() {
    if (password.length < 8) {
      setMessage('Error: Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/account/update/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, password }),
      });

      if (!response.ok) {
        throw new Error(`Error updating password: ${response.statusText}`);
      }

      setMessage('Password updated successfully.');
      clearFields();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * Updates the user's first and last name.
   */
  async function updateUserInfo() {
    if (!firstName || !lastName) {
      setMessage('Error: Both first and last names are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/account/update/infos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName }),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      setMessage('User info updated successfully.');
      clearFields();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * A confirmation modal for sensitive actions (e.g., password updates).
   * @param {Function} onConfirm - Callback function for confirmation.
   * @param {Function} onCancel - Callback function for canceling the action.
   */
  function ConfirmPasswordModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded shadow-md text-center max-w-sm mx-auto">
          <p>Are you sure you want to change your password?</p>
          <div className="mt-4 flex justify-center">
            <button onClick={onConfirm} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
              Yes, change it
            </button>
            <button onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl p-4 sm:p-6 lg:max-w-2xl">
      <h1 className="text-3xl font-light text-center mb-8 underline decoration-green-500">
        Manage Account Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Update Email Section */}
        <div className="rounded-lg shadow-lg bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Change Email</h2>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              New Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your new email"
              value={newEmail}
              onChange={handleEmailInput}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <button
            onClick={updateEmail}
            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Email'}
          </button>
        </div>

        {/* Update Password Section */}
        <div className="rounded-lg shadow-lg bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <div className="mb-4">
            <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              autoComplete="off"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              autoComplete="new-password"
              placeholder="Enter new password"
              value={password}
              onChange={handlePasswordInput}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Name Update Section */}
      <div className="mt-6 rounded-lg shadow-lg bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">
          Change First & Last Name
          <button
            onClick={() => setShowNameForm(!showNameForm)}
            className="ml-4 text-sm text-blue-500 hover:underline"
          >
            {showNameForm ? 'Hide' : 'Change Name'}
          </button>
        </h2>

        {showNameForm && (
          <div className="grid grid-cols-1 gap-6">
            <div className="mb-4">
              <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>
            <button
              onClick={updateUserInfo}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Names'}
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`alert mt-4 p-4 rounded ${message.includes('Error') ? 'bg-red-500' : 'bg-green-500'
            } text-white flex justify-between items-center`}
          role="alert"
          aria-live="assertive"
        >
          <p>{message}</p>
          <button onClick={() => setMessage('')} className="text-white hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showPasswordModal && (
        <ConfirmPasswordModal
          onConfirm={() => {
            setShowPasswordModal(false);
            updatePassword();
          }}
          onCancel={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};
