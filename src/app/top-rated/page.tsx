'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Heart } from 'lucide-react';
import Image from 'next/image';
import { getTopRatedMovies } from '@/services/Movies/getTopRatedMovies';
import { markAsFavorite } from '@/services/Movies/markFavorite';
import { getFavoritesMovies } from '@/services/Movies/getFavoritesMovies';
import { getGuestSession } from '@/services/auth/getGuestSession';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default function TopRatedPage() {
  const [data, setData] = useState<{
    movies: Movie[];
    loading: boolean;
    error: string | null;
  }>({
    movies: [],
    loading: true,
    error: null
  });

  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      try {
        let sessionId = localStorage.getItem('tmdb_guest_session');
        let sessionExpired = false;
  
        const expiresAt = localStorage.getItem('tmdb_guest_session_expires');
        if (expiresAt && new Date(expiresAt) < new Date()) {
          sessionExpired = true;
        }
  
        if (!sessionId || sessionExpired) {
          const sessionResponse = await getGuestSession();
          if (!sessionResponse.success) {
            throw new Error(sessionResponse.error);
          }
  
          if (!sessionResponse.sessionId) {
            throw new Error('No sessionId returned');
          }
  
          sessionId = sessionResponse.sessionId;
          if (sessionId) {
            localStorage.setItem('tmdb_guest_session', sessionId);
          }
          localStorage.setItem('tmdb_guest_session_expires', sessionResponse.expiresAt);
        }
  
        // Forzamos que sessionId es string (seguro por la validación previa)
        const safeSessionId = sessionId as string;
  
        const [topRatedRes, favoritesRes] = await Promise.all([
          getTopRatedMovies(),
          getFavoritesMovies(safeSessionId),
        ]);
  
        setData({
          movies: topRatedRes.results.slice(0, 50),
          loading: false,
          error: null,
        });
  
        setFavorites(new Set(
          favoritesRes.movies?.map((m: any) => m.id) || []
        ));
      } catch (error) {
        setData({
          movies: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    };
  
    initialize();
  }, []);
  

  const handleFavorite = async (movieId: number) => {
    const sessionId = localStorage.getItem('tmdb_guest_session');
    
   
    if (!sessionId) {
      console.error('No hay sesión activa');
      return;
    }
  
    try {
      const newFavoriteStatus = !favorites.has(movieId);
      
   
      setFavorites(prev => {
        const newSet = new Set(prev);
        newFavoriteStatus ? newSet.add(movieId) : newSet.delete(movieId);
        return newSet;
      });
  
      
      await markAsFavorite(movieId, newFavoriteStatus, sessionId);
    } catch (error) {
      console.error("Error updating favorite:", error);
    
      setFavorites(prev => new Set(prev));
    }
  };

  if (data.loading) return <LoadingSpinner />;
  if (data.error) return <ErrorDisplay message={data.error} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Header title="Top 20 Mejor Valoradas" count={data.movies.length} />
        
        <MovieGrid
          movies={data.movies}
          favorites={favorites}
          onFavoriteClick={handleFavorite}
          onMovieClick={(id) => router.push(`/movie/${id}`)}
        />
      </div>
    </div>
  );
}


const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="bg-red-900/50 p-6 rounded-xl border border-red-700 max-w-md text-center">
      <h3 className="text-xl font-bold mb-2">Error</h3>
      <p>{message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-colors"
      >
        Reintentar
      </button>
    </div>
  </div>
);

const Header = ({ title, count }: { title: string; count: number }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
        <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
          {title}
        </span>
      </h1>
      <p className="text-gray-400 mt-2">Las películas mejor calificadas según TMDb</p>
    </div>
    <div className="text-sm bg-gray-800 px-3 py-1 rounded-full">
      {count} películas
    </div>
  </div>
);

const MovieGrid = ({
  movies,
  favorites,
  onFavoriteClick,
  onMovieClick
}: {
  movies: Movie[];
  favorites: Set<number>;
  onFavoriteClick: (id: number) => void;
  onMovieClick: (id: number) => void;
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
    {movies.map((movie, index) => (
      <MovieCard
        key={movie.id}
        movie={movie}
        position={index + 1}
        isFavorite={favorites.has(movie.id)}
        onFavoriteClick={onFavoriteClick}
        onClick={onMovieClick}
      />
    ))}
  </div>
);

const MovieCard = ({
  movie,
  position,
  isFavorite,
  onFavoriteClick,
  onClick
}: {
  movie: Movie;
  position: number;
  isFavorite: boolean;
  onFavoriteClick: (id: number) => void;
  onClick: (id: number) => void;
}) => (
  <div 
    className="group relative aspect-[2/3] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer shadow-lg"
    onClick={() => onClick(movie.id)}
  >
    <Image
      src={movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '/placeholder-movie.jpg'}
      alt={movie.title}
      width={500}
      height={750}
      className="object-cover group-hover:opacity-70 transition-opacity"
    />
    
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-3 flex flex-col justify-end">
      <h3 className="font-bold text-sm sm:text-base truncate">{movie.title}</h3>
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-1 text-xs sm:text-sm">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
          <span>{movie.vote_average.toFixed(1)}</span>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteClick(movie.id);
          }}
          className={`p-1 rounded-full transition-colors ${
            isFavorite 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-gray-800/80 hover:bg-gray-700'
          }`}
        >
          <Heart 
            className={`w-3 h-3 sm:w-4 sm:h-4 ${
              isFavorite ? 'fill-white text-white' : 'text-white'
            }`}
          />
        </button>
      </div>
    </div>
    
    <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
      #{position}
    </div>
  </div>
);