import {useState, useEffect} from "react";

// API KEY
const KEY = "7e88d9a3";

export function useMovies(query){

    const [movies, setMovies] = useState([]);
    const [isLoading, setISLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(function () {

        // handleCloseMovie();
        // Calling The Callback Function that May be Passed in as an Argument with Optional Chaining
        // callback?.();

        // Browser API for Canceling Previous Type Query After Typing Again
        const controller = new AbortController();

        // URL of Fetch Requests
        const URL = `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`;


        // Async Fetching Movie Objects From API
        async function fetchMovies() {
            try {
                setISLoading(true);
                setError("");
                const res = await fetch(URL, {signal: controller.signal});

                // If Response Promise Has Problem Or Cancelled :
                if (!res.ok) {
                    throw new Error('Failed to Fetch Movies ! ')
                }

                // Converting Promise Object to JS Object
                const data = await res.json();

                // If No Movie Was Found :
                if (data.Response === 'False') {
                    throw new Error('No Movie was Found By Us  ! ')
                }

                setMovies(data.Search);
                setError("");

            } catch (err) {

                if (err.name !== "AbortError") {
                    setError(err.message)
                }

            } finally {
                setISLoading(false);
            }

        }

        // Run Fetch Requests Only After Typed Characters are More Than 2
        if (query.length < 3) {
            setMovies([]);
            setError('');
            return
        }

        fetchMovies();

        return function () {
            controller.abort();
        }

        // Running This Effect Whenever query Changed
    }, [query]);


    return {movies, error, isLoading};

}