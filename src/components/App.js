import {useState, useEffect, useRef} from "react";
import StarRating from "./StarRating";
import {useMovies} from "./useMovies";
import {useKey} from "./useKey";


const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// API KEY
const KEY = "7e88d9a3";


// Main Component That will be Exported to index.js
export default function App() {

    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    // These Are Returning from useMovies.js
    const {movies, error, isLoading} = useMovies(query)

    const [watched, setWatched] = useState([]);
    // const [watched, setWatched] = useState(function () {
    //     const storedValue = localStorage.getItem('watched');
    //     return JSON.parse(storedValue);
    // });


    // Fetching to API with Search Query
    const URL = `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`;


    function handleSelectMovie(id) {
        setSelectedId(selectedId === id ? null : id);
    }

    function handleCloseMovie() {
        setSelectedId(null);
    }


    function handleAddWatched(movie) {
        setWatched(watched => [...watched, movie]);
        // localStorage.setItem('watched', JSON.stringify([...watched, movie]));
    }

    function handleDeleteWatched(movie) {

        setWatched((watched) => watched.filter((watchedMovie) => watchedMovie !== movie))

    }

    useEffect(function () {

        localStorage.setItem('watched', JSON.stringify(watched));

    }, [watched])


    return (
        <>

            <NavBar>
                <Search query={query} setQuery={setQuery}/>
                <NumResults movies={movies}/>
            </NavBar>


            <Main>

                <Box>
                    {error ? <ErrorMessage message={error}/> : (isLoading ? <Loader/> :
                        <MovieList movies={movies} onSelect={handleSelectMovie}/>)}
                </Box>

                <Box>
                    {selectedId ? <MovieDetails selectedId={selectedId}
                                                watched={watched}
                                                onClose={handleCloseMovie}
                                                onAddWatched={handleAddWatched}/>
                        :
                        <>
                            <WatchedSummary watched={watched}/>
                            <WatchedList watched={watched} onDeleteWatched={handleDeleteWatched}/>
                        </>}
                </Box>

            </Main>

        </>
    );
}


function Loader({children}) {

    return <p className='loader'> {children} </p>

}


function ErrorMessage({message}) {

    return <p className='error'>
        <span>❌</span> {message}
    </p>

}

function NavBar({children}) {

    return <nav className="nav-bar">

        <Logo/>
        {children}

    </nav>

}


function Logo() {

    return <div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
    </div>
}

function Search({query, setQuery}) {

    const searchEl = useRef(null);


    useKey('Enter', function () {
        if (document.activeElement === searchEl.current) return;
        searchEl.current.focus()
        setQuery("")
    })


    return <input
        className="search"
        type="text"
        placeholder="Search Movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={searchEl}
    />
}

function NumResults({movies}) {

    return <p className="num-results">
        Found <strong>{movies.length}</strong> results
    </p>

}


function Main({children}) {


    return <main className="main">

        {children}

    </main>
}


function Box({children}) {

    const [isOpen, setIsOpen] = useState(true);

    return <div className="box">
        <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
        >
            {isOpen ? "–" : "+"}
        </button>


        {isOpen && children}


    </div>

}

function MovieList({movies, onSelect}) {


    return <ul className="list">
        {movies?.map((movie) => (<Movie movie={movie} onSelect={onSelect} key={movie.imdbID}/>))}
    </ul>

}


function Movie({movie, onSelect}) {

    return <li onClick={() => onSelect(movie.imdbID)}>
        <img src={movie.Poster} alt={`${movie.Title} poster`}/>
        <h3>{movie.Title}</h3>
        <div>
            <p>
                <span>🗓</span>
                <span>{movie.Year}</span>
            </p>
        </div>
    </li>
}


function MovieDetails({selectedId, watched, onClose, onAddWatched}) {

    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userRating, setUserRating] = useState("");

    const isWatched = watched.map(movie => movie.imdbID).includes(selectedId)
    const userWatchedRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating

    const countUserRate = useRef(0)

    useEffect(function () {

        if (userRating) countUserRate.current += 1

    }, [userRating])


    // Fetching Selected Movie Details When Clicked on a Movie in MovieList
    useEffect(function () {

            async function getMovieDetails() {

                setIsLoading(true);
                const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
                const data = await res.json();
                setMovie(data);
                setIsLoading(false);
            }

            getMovieDetails();

        },
        [selectedId])


    // Changing Tab Title When new Movie Loads
    useEffect(function () {
            if (!movie.Title) return
            document.title = movie.Title;

            return function () {
                document.title = "usePopcorn"
            }
        }
        , [movie.Title])


    useKey('escape', onClose)


    // Handling the "Add to Watched List" Behavior
    function handleAdd() {

        // Creating New Object that Combines with Old Watched List
        const newWatchedMovie = {
            imdbID: selectedId,
            Title: movie.Title,
            Year: movie.Year,
            Poster: movie.Poster,
            imdbRating: Number(movie.imdbRating),
            runtime: Number(movie.Runtime.split(' ').at(0)),
            userRating: userRating,
            countRatingDecisions: countUserRate
        }

        console.log(newWatchedMovie)

        onAddWatched(newWatchedMovie);
        onClose();
    }

    return (
        <div className='details'>

            {isLoading ? <Loader>Movie Is Loading...</Loader> :
                <>

                    <header>
                        <button className="btn-back" onClick={onClose}> &larr; </button>
                        <img src={movie.Poster} alt={`Poster of ${movie.Title}`}/>
                        <div className="details-overview">

                            <h2>{movie.Title}</h2>
                            <p>{movie.Released} &bull; {movie.Runtime} </p>
                            <p>{movie.Genre}</p>
                            <p>
                                <span>⭐️</span>
                                {movie.imdbRating} IMDB Rating
                            </p>

                        </div>
                    </header>

                    <section>
                        <div className="rating">
                            {!isWatched ?
                                <>
                                    <StarRating maxRating={10} size={20} color={"#e03131"} onSetRating={setUserRating}/>
                                    {userRating > 0 &&
                                    <button className='btn-add' onClick={handleAdd}> + Add to Watched List</button>}
                                </>
                                :
                                <p> You Rated this Movie. {userWatchedRating}⭐️ </p>
                            }
                        </div>
                        <p>
                            <em>{movie.Plot}</em>
                        </p>
                        <p>Starring {movie.Actors}</p>
                        <p>Directed By {movie.Director}</p>


                    </section>

                </>
            }

        </div>

    )

}


function WatchedSummary({watched}) {

    // Calculating the Stats
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating)).toFixed(2);
    const avgUserRating = average(watched.map((movie) => movie.userRating)).toFixed(2);
    const avgRuntime = average(watched.map((movie) => movie.runtime)).toFixed(2);


    return <div className="summary">
        <h2>Movies you watched</h2>
        <div>
            <p>
                <span>#️⃣</span>
                <span>{watched.length} movies</span>
            </p>
            <p>
                <span>⭐️</span>
                <span>{avgImdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{avgUserRating}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{avgRuntime} min</span>
            </p>
        </div>
    </div>


}

function WatchedList({watched, onDeleteWatched}) {

    // Listing the Watched Movies with map Function
    return <ul className="list">
        {watched.map((movie) => (<WatchedMovie movie={movie} onDeleteWatched={onDeleteWatched} key={movie.imdbID}/>))}
    </ul>
}


function WatchedMovie({movie, onDeleteWatched}) {

    return <li>
        <img src={movie.Poster} alt={`${movie.Title} poster`}/>
        <h3>{movie.Title}</h3>
        <div>
            <p>
                <span>⭐️</span>
                <span>{movie.imdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{movie.userRating}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{movie.runtime} min</span>
            </p>

            <button className="btn-delete" onClick={() => onDeleteWatched(movie)}> X</button>
        </div>
    </li>
}