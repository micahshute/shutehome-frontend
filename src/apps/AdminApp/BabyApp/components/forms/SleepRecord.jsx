import { useEffect, useState } from 'react'
import DateTimePicker from 'react-datetime-picker'
import { useLazyRest } from '../../../../../hooks/useLazyRest'
import LoadingButton from '../../../../../lib/LoadingButton'

export default function SleepRecord({babyId, onComplete}){

    let initialStartTime = new Date()
    let initialEndTime = new Date()
    let initialNotes = ''
    
    const [startTime, setStartTime] = useState(initialStartTime)
    const [endTime, setEndTime] = useState(initialEndTime)
    const [notes, setNotes] = useState(initialNotes)

    const {
        data,
        loading,
        error,
        call
    } = useLazyRest()

    useEffect(() => {
        if(!loading && !error && data){
            onComplete()
        }
    }, [data, error, loading])

    const handleUpdateNotes = e => {
        setNotes(e.target.value)
    }

    const handleSubmit = () => {
        const body = {
            start_time: startTime,
            end_time: endTime,
            notes
        }

        call(`/babies/${babyId}/sleeps`, 'post', body)
    }

    return (
        <div>
            <div>
                <label for="startTime">Start Time</label>
                <DateTimePicker onChange={setStartTime} value={startTime} />
            </div>
            <div>
                <label for="endTime">End Time</label>
                <DateTimePicker onChange={setEndTime} value={endTime} />
            </div>
            <div>
                <label for="notes">Notes</label>
                <textarea id="notes" value={notes} onChange={handleUpdateNotes} rows={10}/>
            </div>
            <div className="mt-30"></div>
            <LoadingButton onClick={handleSubmit} loading={loading} text="Submit"/>
        </div>
    )
}