import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import Search from "./components/Search";
import Spinner from "./Spinner";
import MovieCard from "./components/MovieCard";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Track total pages

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000, [searchTerm]);

  const fetchMovies = async (query = "", page = 1) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
            query
          )}&page=${page}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch movies: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data); // Log the API response

      if (!data.results || data.results.length === 0) {
        setErrorMessage("No movies found.");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
      setTotalPages(data.total_pages); // Update total pages
    } catch (error) {
      console.error(`Error fetching Movies: ${error}`);
      setErrorMessage("Error fetching Movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm, currentPage);
  }, [debouncedSearchTerm, currentPage]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img src="../public/hero.png" alt="Hero Banner" />
            <h1>
              Find <span className="text-gradient">Movies</span> You'll Enjoy
              Without Hassle
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>
          <section className="all-movies">
            <h2 className="mt-[40px]">All Movies</h2>
            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <>
                <ul>
                  {movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </ul>
                {/* Pagination Controls */}
                <div className="pagination flex justify-center gap-4 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                  >
                    Previous
                  </button>
                  <span className="text-white px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default App;
