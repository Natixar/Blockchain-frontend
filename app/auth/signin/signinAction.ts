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

		// if (!token || !refreshToken || !user?.memberships?.[0]?.groupId) {
		// 	throw new Error('Missing essential data in login response');
		// }
		// Test 1: Validate token
		if (!token) {
			const errorMessage = 'Authentication token is missing in login response.';
			console.log(`Login Validation Error: ${errorMessage}`);
			throw new Error(errorMessage);
		}

		// Test 2: Validate refreshToken
		if (!refreshToken) {
			const errorMessage = 'Refresh token is missing in login response.';
			console.log(`Login Validation Error: ${errorMessage}`);
			throw new Error(errorMessage);
		}

		// Test 3: Validate user object
		if (!user) {
			const errorMessage = 'User object is missing in login response.';
			console.log(`Login Validation Error: ${errorMessage}`);
			throw new Error(errorMessage);
		}

		// Test 4: Validate user memberships and groupId (user object is confirmed to exist)
		// This covers the logic of !user.memberships?.[0]?.groupId
		if (!user.memberships || user.memberships.length === 0 || !user.memberships[0]?.groupId) {
			let errorMessage: string;
			if (!user.memberships || user.memberships.length === 0) {
				errorMessage = 'User memberships array is missing or empty in login response for user : ' + user;
			} else {
				// At this point, user.memberships exists and is not empty.
				// The failure must be due to missing groupId on the first membership.
				errorMessage = 'Group ID is missing in the first user membership.';
			}
			console.log(`Login Validation Error: ${errorMessage}`);
			throw new Error(errorMessage);
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

		(await cookies()).set({
			name: 'access_token',
			value: token,
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
		});

		(await cookies()).set({
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
		console.log('Login process encountered an error:', error);
		redirectUrl = '/auth/signin?error=invalid-credentials';
	}
	// As per the Next.js official documentation: "redirect internally throws an error so it should be called outside of try/catch blocks."
	redirect(redirectUrl);
}
