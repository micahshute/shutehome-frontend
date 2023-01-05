import { useState } from "react";
import { useEffect } from "react";
import { pad } from "../../../../lib/helpers/helpers";


export function Timer({startTime}){

    const now = new Date()
    const diffMs = now - startTime
    const [seconds, setSeconds] = useState(Math.floor(diffMs / 1000))

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds + 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const formatTimeDiff = () => {
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)

        const displaySeconds = seconds % 60
        const displayMinutes = minutes % 60
        return `${pad(hours, 2, '0')}:${pad(displayMinutes, 2, '0')}:${pad(displaySeconds, 2, '0')}`
    }

    return (
        <div className="timer">
            <p className="bold">{formatTimeDiff()}</p>
        </div>
    )

}