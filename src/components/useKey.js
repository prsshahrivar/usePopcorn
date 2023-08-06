

import {useEffect} from "react";

export function useKey(key, action){

    useEffect(function () {

        const callback = function (e) {
            // console.log(e.code)
            if (e.code.toLowerCase() === key.toLowerCase()) {
                action();
            }
        }

        document.addEventListener("keydown", callback)

        // CleanUp Function
        return function () {
            document.removeEventListener("keydown", callback)
        }

    }, [key, action])


}