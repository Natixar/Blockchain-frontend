'use server';

export async function handleForgotPassword(formData: FormData) {
  const email = formData.get('email') as string;

  const response = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/user/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.FUSIONAUTH_API_KEY}`,
    },
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    console.log('Password reset email sent');
    // Redirect or show a message
  } else {
    console.log('Failed to send password reset email');
    // Handle error
  }
}
