'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface UserData {
	token: string;
	refreshToken: string;
	user: {
		memberships: Array<{
			groupId: string;
		}>;
	};
}

interface GroupData {
	group: {
		roles: {
			[key: string]: Array<{
				name: string;
			}>;
		};
	};
}

const roleDashboards: { [key: string]: string } = {
	mine: '/product/list',
	// transport: '/transport/list',
	smeltery: '/product/list',
	manufacturer: '/manufacturer',
	trader: '/trader',
};

export async function handleSignin(formData: FormData) {
	let redirectUrl = '/auth/signin';
	try {
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!email || !password) {
			throw new Error('Email or password is missing');
		}

		const userResponse = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-FusionAuth-TenantId': `${process.env.FUSIONAUTH_TENANTID}`,
				Authorization: `${process.env.FUSIONAUTH_API_KEY}`,
			},
			body: JSON.stringify({
				loginId: email,
				password,
				applicationId: process.env.FUSIONAUTH_APP_ID,
			}),
		});

		if (!userResponse.ok) {
			throw new Error(`Login failed with status: ${userResponse.status}`);
		}

		const userData: UserData = await userResponse.json();
		const { token, refreshToken, user } = userData;

		if (!token || !refreshToken || !user?.memberships?.[0]?.groupId) {
			throw new Error('Missing essential data in login response');
		}

		const groupResponse = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/group/${user.memberships[0].groupId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-FusionAuth-TenantId': `${process.env.FUSIONAUTH_TENANTID}`,
				Authorization: `${process.env.FUSIONAUTH_API_KEY}`,
			},
		});

		if (!groupResponse.ok) {
			throw new Error(`Group fetch failed with status: ${groupResponse.status}`);
		}

		const groupData: GroupData = await groupResponse.json();

		const userRoles = groupData.group.roles[process.env.FUSIONAUTH_APP_ID as string]?.map(role => role.name);

		if (!userRoles || userRoles.length === 0) {
			throw new Error('No roles found for the user');
		}

		cookies().set({
			name: 'access_token',
			value: token,
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
		});

		cookies().set({
			name: 'refresh_token',
			value: refreshToken,
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
		});

		redirectUrl = roleDashboards[userRoles[0]] || '/account';
		console.log('redirectUrl', redirectUrl)

	} catch (error) {
		console.error('Login process encountered an error:', error);
		redirectUrl = '/auth/signin?error=invalid-credentials';
	}
	// As per the Next.js official documentation: "redirect internally throws an error so it should be called outside of try/catch blocks."
	redirect(redirectUrl);
}
