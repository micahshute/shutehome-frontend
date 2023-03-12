import { useState } from "react";
import { useEffect } from "react";
import { pad } from "../../../../lib/helpers/helpers";


export function Timer({startTime, skinny, minutesUntilWarning=Infinity, minutesUntilDanger=Infinity}){

    const DANGER_COLOR_CLASS = 'red'
    const WARNING_COLOR_CLASS= 'amber'

    const getSecondsFromStartTime = () => {
        const now = new Date()
        const diffMs = now - startTime
        return Math.floor(diffMs / 1000)
    }

    const [seconds, setSeconds] = useState(getSecondsFromStartTime())
    const [colorClass, setColorClass] = useState('black')

    useEffect(() => {
        const interval = setInterval(() => {
            const currentSeconds = getSecondsFromStartTime()
            if(colorClass !== DANGER_COLOR_CLASS && currentSeconds / 60 >= minutesUntilWarning && currentSeconds / 60 < minutesUntilDanger){
                setColorClass(WARNING_COLOR_CLASS)
            }
            if(colorClass !== DANGER_COLOR_CLASS && currentSeconds / 60 >= minutesUntilDanger){
                setColorClass(DANGER_COLOR_CLASS)
            }
            setSeconds(currentSeconds)
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
        <div className={skinny ? 'skinny-timer': 'timer'}>
            <p className={`bold ${colorClass}`}>{formatTimeDiff()}</p>
        </div>
    )

}