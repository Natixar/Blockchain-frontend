import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const items = [
    { title: 'Admin', icon: '/icons/admin.svg', link: '/admin' },
    { title: 'Mine', icon: '/icons/mine.svg', link: '/mine' },
    // { title: 'Logistics', icon: '/icons/logistics.svg', link: '/transport' },
    { title: 'Trader', icon: '/icons/trader.svg', link: '/trader' },
    { title: 'Manufacturer', icon: '/icons/manufacturer.svg', link: '/manufacturer' },
  ];

  return (
    <div className="min-h-screen bg-green-700 flex flex-col items-center">
      <header className="w-full bg-blue-900 text-white p-4 flex justify-between items-center sticky top-0">
        <h1 className="text-2xl">Natixar</h1>
        <div className="flex space-x-4">
          <button className="p-2 bg-blue-700 rounded-full">
            <span role="img" aria-label="notification">🔔</span>
          </button>
          <button className="p-2 bg-blue-700 rounded-full">
            <span role="img" aria-label="profile">👤</span>
          </button>
        </div>
      </header>
      <main className="flex flex-wrap justify-center mt-10 gap-12 max-w-screen-lg">
        {items.map((item) => (
          <div key={item.title} className="bg-white rounded-xl shadow-md p-8 w-60 text-center relative">
            <div className="absolute top-0 left-0 right-0 bg-green-600 rounded-t-xl py-2">
              <h2 className="font-medium text-white uppercase">{item.title}</h2>
            </div>
            <div className="pt-12">
              <Image src={item.icon} alt={`${item.title} icon`} width={50} height={50} />
              <Link href={item.link as any} className="mt-4 inline-block text-blue-700 underline underline-offset-8 decoration-green-600">
                Log in
              </Link>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
