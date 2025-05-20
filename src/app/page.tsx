import Link from 'next/link';
import { Film, Heart, Star, Clapperboard, TrendingUp } from 'lucide-react';

export default function Home() {
  const categories = [
    { name: 'En Cartelera', path: '/movies/now-playing', icon: <Clapperboard /> },
    { name: 'Populares', path: '/movies/popular', icon: <TrendingUp /> },
    { name: 'Mejor Valoradas', path: '/movies/top-rated', icon: <Star /> },
    { name: 'Mis Favoritas', path: '/movies/my-favorites', icon: <Heart /> }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-12 text-center">MovieFlix</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.path}
            href={category.path}
            className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-colors flex flex-col items-center"
          >
            <div className="text-blue-400 mb-3">
              {category.icon}
            </div>
            <h2 className="text-xl font-semibold">{category.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}