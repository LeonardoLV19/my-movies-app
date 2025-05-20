'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Star, Clock } from 'lucide-react';
import Image from 'next/image';
import { getGuestSession } from '@/services/auth/getGuestSession';
import { getFavoritesMovies } from '@/services/Movies/getFavoritesMovies';
import { markAsFavorite } from '@/services/Movies/markFavorite';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default function MyFavoritesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Obtener o crear sesión
        let session = localStorage.getItem('tmdb_guest_session');
        
        if (!session) {
          const response = await getGuestSession();
          if (!response.success) throw new Error(response.error);
          session = response.sessionId;
          localStorage.setItem('tmdb_guest_session', session);
        }

        setSessionId(session);

        // 2. Obtener favoritos
        const favoritesResponse = await getFavoritesMovies(session);
        if (!favoritesResponse.success) {
          throw new Error(favoritesResponse.error);
        }

        setMovies(favoritesResponse.movies);
      } catch (err: any) {
        setError(err.message || 'Error al cargar favoritos');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleRemoveFavorite = async (movieId: number) => {
    if (!sessionId) return;

    try {
      // Actualización optimista
      setMovies(prev => prev.filter(movie => movie.id !== movieId));
      
      await markAsFavorite(movieId, false, sessionId);
    } catch (error) {
      console.error("Error removing favorite:", error);
      // Recargar si falla
      const response = await getFavoritesMovies(sessionId);
      if (response.success) {
        setMovies(response.movies);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/50 p-6 rounded-xl border border-red-700 max-w-md text-center">
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Heart className="w-8 h-8 fill-red-500 text-red-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-600">
                Mis Favoritas
              </span>
            </h1>
            <p className="text-gray-400 mt-2">
              {movies.length} {movies.length === 1 ? 'película' : 'películas'} guardadas
            </p>
          </div>
        </div>

        {/* Grid de películas */}
        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="group relative aspect-[2/3] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg"
              >
                <Image
                  src={movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : '/placeholder-movie.jpg'}
                  alt={movie.title}
                  fill
                  className="object-cover group-hover:opacity-70 transition-opacity cursor-pointer"
                  onClick={() => router.push(`/movie/${movie.id}`)}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                  <h3 className="font-bold text-sm sm:text-base truncate">
                    {movie.title}
                  </h3>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-1 text-xs sm:text-sm">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(movie.id);
                      }}
                      className="p-1 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                      aria-label="Remover de favoritos"
                    >
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No hay favoritos</h2>
            <p className="text-gray-400 max-w-md">
              Las películas que marques como favoritas aparecerán aquí
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors"
            >
              Explorar películas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}