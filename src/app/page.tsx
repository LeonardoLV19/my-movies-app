'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTopRatedMovies } from '@/services/Movies/getTopRatedMovies';
import { getTrendingMovies } from '@/services/Movies/getTrendingMovies';
import { getUpcomingMovies } from '@/services/Movies/getUpcomingMovies';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

export default function HomePage() {
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fetchData = async () => {
      const top = await getTopRatedMovies();
      const trend = await getTrendingMovies();
      const up = await getUpcomingMovies();

      setTopRated(top.results || []);
      setTrending(trend.results || []);
      setUpcoming(up.results || []);
    };
    fetchData();
  }, []);

  const renderCarousel = (title: string, movies: Movie[]) => (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <div className="flex gap-4 overflow-x-auto no-scrollbar">
        {movies.map((movie) => (
          <Link key={movie.id} href={`/movie/${movie.id}`} className="min-w-[160px]">
            <div className="relative w-[160px] h-[240px] flex-shrink-0 group">
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                fill
                className="object-cover rounded-lg group-hover:opacity-80 transition"
              />
              <div className="absolute bottom-0 w-full bg-black/60 text-sm text-white p-1 truncate">
                {movie.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <main className="bg-black min-h-screen p-6">
      {renderCarousel('🎬 Películas Mejor Calificadas', topRated)}
      {renderCarousel('🔥 Tendencias de la Semana', trending)}
      {renderCarousel('🚀 Próximos Estrenos', upcoming)}
    </main>
  );
}
