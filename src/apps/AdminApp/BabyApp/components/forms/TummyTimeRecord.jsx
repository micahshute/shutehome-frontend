import { useEffect } from "react"
import { useState } from "react"
import { useToasts } from "react-toast-notifications"
import { useLazyRest } from "../../../../../hooks/useLazyRest"
import LoadingButton from "../../../../../lib/LoadingButton"
import { MDDateTimePicker } from "../DatePicker"

export default function TummyTimeRecord({babyId, onComplete, tummyTimeRecord=null}){

    const { addToast } = useToasts()


    const initialStartTime = tummyTimeRecord?.startTime || new Date()
    const initialEndTime = tummyTimeRecord?.endTime || new Date()
    const initialNotes = tummyTimeRecord?.notes || ''

    const [startTime, setStartTime] = useState(initialStartTime)
    const [endTime, setEndTime] = useState(initialEndTime)
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
        call(`/tummy_times/${tummyTimeRecord.id}`, "DELETE")
    }

    const handleSubmit = () => {
        const body = {
            start_time: startTime,
            end_time: endTime,
            notes
        }
        if(tummyTimeRecord){
            call(`/tummy_times/${tummyTimeRecord.id}`, "PUT", body)
        }else{
            call(`/babies/${babyId}/tummy_times`, "POST", body)
        }
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
            { tummyTimeRecord && <LoadingButton onClick={handleDelete} loading={loading} text="Delete" type="danger" />}
            <LoadingButton onClick={handleSubmit} loading={loading} text="Submit" className="float-right" />
        </div>
    )
}