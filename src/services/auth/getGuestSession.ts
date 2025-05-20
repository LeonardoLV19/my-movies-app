export async function getGuestSession() {
    try {
      const res = await fetch('https://api.themoviedb.org/3/authentication/guest_session/new', {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_MOVIE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
  
      const data = await res.json();
      return {
        success: true,
        sessionId: data.guest_session_id,
        expiresAt: data.expires_at
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  