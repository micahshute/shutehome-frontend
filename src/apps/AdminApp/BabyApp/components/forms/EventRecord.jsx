import { useEffect } from "react"
import { useState } from "react"
import { useToasts } from "react-toast-notifications"
import { useLazyRest } from "../../../../../hooks/useLazyRest"
import LoadingButton from "../../../../../lib/LoadingButton"
import { MDDateTimePicker } from "../DatePicker"

export default function EventRecord({babyId, onComplete, eventRecord=null}){

    const { addToast } = useToasts()

    const getInitialDate = () => {
        if(eventRecord){
            return new Date(eventRecord.time)
        }
        return new Date()
    }


    const initialName = eventRecord?.name || ''
    const initialTime = getInitialDate()
    const initialNotes = eventRecord?.notes || ''

    const [name, setName] = useState(initialName)
    const [time, setTime] = useState(initialTime)
    const [notes, setNotes] = useState(initialNotes)

    const handleUpdateNotes = e => setNotes(e.target.value)

    const {
        data, 
        error, 
        loading,
        call
    } = useLazyRest()

    useEffect(() => {
        if(!error && !loading && data){
            addToast('Saved record successfully', { appearance: 'success' })
            onComplete()
        }else if(error){
            addToast('There was a problem saving your record', { appearance: 'error' })
        }
    }, [data, error, loading])


    const handleDelete = () => {
        call(`/events/${eventRecord.id}`, "DELETE")
    }

    const handleSubmit = () => {
        const body = {
            name,
            time,
            notes
        }
        if(eventRecord){
            call(`/events/${eventRecord.id}`, "PUT", body)
        }else{
            call(`/babies/${babyId}/events`, "POST", body)
        }
    }

    return (
        <div>
            <div>
                <label for="name">Event</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
                <label for="time">Time</label>
                <MDDateTimePicker onChange={setTime} value={time} />
            </div>
            <div>
                <label for="notes">Notes</label>
                <textarea id="notes" value={notes} onChange={handleUpdateNotes} rows={10}/>
            </div>
            <div className="mt-30"></div>
            { eventRecord && <LoadingButton onClick={handleDelete} loading={loading} text="Delete" type="danger" />}
            <LoadingButton onClick={handleSubmit} loading={loading} text="Submit" className="float-right" />
        </div>
    )
}