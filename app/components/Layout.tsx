import { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import mine from '@/public/mine.avif';
import smeltery from '@/public/smeltery.avif';
import manufacturer from '@/public/manufacturer.avif';
import trader from '@/public/trading.avif';
import Image from 'next/image';
import { Role } from './rolesConfig';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';

export default async function MainLayout({ children }: { children: ReactNode }) {
  async function validateJwt() {
    try {
      const token = (await cookies()).get('access_token')?.value;
      const response = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/jwt/validate`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
  
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
  
      const {email, roles} = (await response.json()).jwt;
      return { email, roles };
    } catch (error: any) {
      // console.error('Error validating JWT:', error);
      return {email: '', roles: []};
    }
  }
  
  async function retrieveUser(email: string) {
    try {
      const response = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/user?email=${email}`, {
        method: 'GET',
        headers: {
          Authorization: `${process.env.FUSIONAUTH_API_KEY}`,
          'Content-Type': 'application/json',
          'X-FusionAuth-TenantId': `${process.env.FUSIONAUTH_TENANTID}`
        },
      });
  
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
  
      const user: {firstName: string, lastName: string} = (await response.json()).user;
      return {firstName: user.firstName, lastName: user.lastName}
    } catch (error) {
      // console.error('Error retrieving user:', error);
      return {firstName: '', lastName: ''};
    }
  }
  // Make a call to validate JWT and get user data
  const {email, roles} = await validateJwt();
  const {firstName, lastName} = await retrieveUser(email);
  const initials: string = firstName.charAt(0) + lastName.charAt(0);

  const user = { roles, firstName, lastName, initials }

  // const rolesHeader = headers().get('X-User-Roles');
  // console.log('action headr', rolesHeader, headers().entries())
  // const userRoles = (rolesHeader ? rolesHeader.split(',') : []) as Role[];

  const backgroundImage = roles.includes('mine')
    ? mine
    : roles.includes('smeltery')
      ? smeltery
        : roles.includes('manufacturer')
          ? manufacturer
          : roles.includes('trader')
            ? trader
            : null;

  return (
    <div className="flex h-screen">
      <Sidebar user={user} />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Navbar user={user} />
        {backgroundImage && (
          <div className="fixed overflow-hidden h-full w-full -z-10 opacity-20">
            <Image
              alt="Background"
              src={backgroundImage}
              placeholder="blur"
              quality={100}
              fill
              sizes="100vw"
              style={{
                objectFit: 'cover',
              }}
            />
          </div>
        )}
        <main className="flex-1 p-8 mt-20">{children}</main>
      </div>
    </div>
  );
}
