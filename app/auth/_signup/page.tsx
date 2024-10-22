import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Sign Up',
    description: 'Create a new account',
};

async function handleSignup(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    const response = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/user/registration`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${process.env.FUSIONAUTH_API_KEY}`,
        },
        body: JSON.stringify({
            user: {
                email,
                password,
                fullName: name,
            },
            registration: {
                applicationId: process.env.FUSIONAUTH_APP_ID,
            },
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to sign up');
    }

    return response.json();
}

export default async function SignupPage(
    props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
    const searchParams = await props.searchParams;
    const error = searchParams.error;

    async function handleSubmit(formData: FormData) {
        'use server';
        try {
            await handleSignup(formData);
            redirect('/mine/list');
        } catch (error) {
            console.error('Failed to sign up', error);
            redirect('/signup?error=signup-failed');
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-md">
                <h1 className="text-3xl font-bold text-center text-blue-900">NATIXAR</h1>
                <h2 className="text-2xl font-semibold text-center text-gray-800">Sign Up</h2>
                {error && <p className="text-sm text-center text-red-600">An error occurred, please try again.</p>}
                <form action={handleSubmit} className="space-y-6" encType="multipart/form-data">
                    <div className="relative">
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="block w-full px-4 pt-6 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
                            placeholder="Name"
                            required
                        />
                        <label
                            htmlFor="name"
                            className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
                        >
                            Name
                        </label>
                    </div>
                    <div className="relative">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="block w-full px-4 pt-6 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
                            placeholder="Email"
                            required
                        />
                        <label
                            htmlFor="email"
                            className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
                        >
                            Email
                        </label>
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="block w-full px-4 pt-6 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
                            placeholder="Password"
                            required
                        />
                        <label
                            htmlFor="password"
                            className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
                        >
                            Password
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-700 rounded-md shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
}
