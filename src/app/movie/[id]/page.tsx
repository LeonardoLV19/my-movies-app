'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { getMovieDetails } from '@/services/Movies/getMovieDetails';
import type { MovieDetails } from '@/services/Movies/getMovieDetails';
import { getRecommendedMovies } from '@/services/Movies/getRecommendend';
import { markAsFavorite } from '@/services/Movies/markFavorite';
import { getFavoritesMovies } from '@/services/Movies/getFavoritesMovies';


interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
  genres: { id: number; name: string }[];
  runtime: number;
  backdrop_path: string;
}

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [recommended, setRecommended] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loadMovie = async () => {
      setLoading(true);
      let sessionId = localStorage.getItem('tmdb_guest_session');

      const expiresAt = localStorage.getItem('tmdb_guest_session_expires');
      if (!sessionId || (expiresAt && new Date(expiresAt) < new Date())) {
        const session = await import('@/services/auth/getGuestSession').then(mod => mod.getGuestSession());
        if (session.success) {
          sessionId = session.sessionId;
          localStorage.setItem('tmdb_guest_session', session.sessionId);
          localStorage.setItem('tmdb_guest_session_expires', session.expiresAt);
        }
      }

      const [movieData, favoritesData, recommendedData] = await Promise.all([
        getMovieDetails(id),
        getFavoritesMovies(sessionId || ''),
        getRecommendedMovies(id),
      ]);

      setMovie(movieData);
      setRecommended(recommendedData.results?.slice(0, 10) || []);
      setFavorites(new Set(favoritesData.movies?.map(m => m.id) || []))
      setLoading(false);
    };

    loadMovie();
  }, [id]);

  const toggleFavorite = async () => {
    const sessionId = localStorage.getItem('tmdb_guest_session');
    if (!sessionId || !movie) return;

    const isFav = favorites.has(movie.id);
    setFavorites(prev => {
      const newSet = new Set(prev);
      isFav ? newSet.delete(movie.id) : newSet.add(movie.id);
      return newSet;
    });

    await markAsFavorite(movie.id, !isFav, sessionId);
  };

  if (loading || !movie) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">Cargando...</div>
    );
  }

  const isFavorite = favorites.has(movie.id);

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="relative w-full h-[60vh]">
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          fill
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black p-6 flex flex-col justify-end">
          <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
          <div className="flex gap-4 text-sm text-gray-300">
            <span>{movie.release_date?.slice(0, 4)}</span>
            <span>{movie.runtime} min</span>
            <span className="text-yellow-400 font-bold">
              ★ {movie.vote_average?.toFixed(1)}
            </span>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap text-xs">
            {movie.genres.map((genre) => (
              <span
                key={genre.id}
                className="bg-yellow-600 px-2 py-1 rounded-full text-black font-semibold"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <p className="text-gray-300">{movie.overview}</p>

        <button
          onClick={toggleFavorite}
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isFavorite ? 'bg-red-600' : 'bg-yellow-500 text-black'
          } hover:opacity-90 transition`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          {isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        </button>

        {recommended.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mt-8 mb-4">Películas recomendadas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {recommended.map((rec) => (
                <div key={rec.id} className="group relative cursor-pointer">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${rec.poster_path}`}
                    alt={rec.title}
                    width={300}
                    height={450}
                    className="rounded-lg object-cover group-hover:opacity-80 transition"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-sm font-semibold truncate">
                    {rec.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
