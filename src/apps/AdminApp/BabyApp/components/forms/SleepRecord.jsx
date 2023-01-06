import { useEffect, useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { useLazyRest } from '../../../../../hooks/useLazyRest'
import LoadingButton from '../../../../../lib/LoadingButton'
import { MDDateTimePicker } from '../DatePicker'

export default function SleepRecord({babyId, onComplete, sleepRecord=null}){

    let initialStartTime = new Date()
    let initialEndTime = new Date()
    let initialNotes = ''

    if(sleepRecord){
        initialStartTime = new Date(sleepRecord.start_time)
        initialEndTime = new Date(sleepRecord.end_time)
        initialNotes = sleepRecord.notes
    }
    
    const [startTime, setStartTime] = useState(initialStartTime)
    const [endTime, setEndTime] = useState(initialEndTime)
    const [notes, setNotes] = useState(initialNotes)

    const { addToast } = useToasts()

    const {
        data,
        loading,
        error,
        call
    } = useLazyRest()

    useEffect(() => {
        if(!loading && !error && data){
            addToast('Saved record successfully', { appearance: 'success' })
            onComplete()
        }else if(error){
            addToast('There was a problem saving your record', { appearance: 'error' })
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
        if(sleepRecord){
            call(`/sleeps/${sleepRecord.id}`, 'put', body)
        }else{
            call(`/babies/${babyId}/sleeps`, 'post', body)
        }
    }

    const handleDelete = () => {
        const url = `/sleeps/${sleepRecord.id}`
        call(url, 'delete')
    }

    return (
        <div>
            <div>
                <label for="startTime">Start Time</label>
                <MDDateTimePicker onChange={setStartTime} value={startTime} />
            </div>
            <div>
                <label for="endTime">End Time</label>
                <MDDateTimePicker onChange={setEndTime} value={endTime} />
            </div>
            <div>
                <label for="notes">Notes</label>
                <textarea id="notes" value={notes} onChange={handleUpdateNotes} rows={10}/>
            </div>
            <div className="mt-30"></div>
            { sleepRecord && <LoadingButton onClick={handleDelete} loading={loading} text="Delete" type="danger" />}
            <LoadingButton onClick={handleSubmit} loading={loading} text="Submit" className="float-right" />
        </div>
    )
}