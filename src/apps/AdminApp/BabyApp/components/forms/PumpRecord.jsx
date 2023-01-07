import { useEffect } from "react"
import { useState } from "react"
import { useToasts } from "react-toast-notifications"
import { useLazyRest } from "../../../../../hooks/useLazyRest"
import LoadingButton from "../../../../../lib/LoadingButton"
import { MDDateTimePicker } from "../DatePicker"

export default function PumpRecord({babyId, onComplete, pumpRecord=null}){

    const { addToast } = useToasts()

    
    const getInitialDate = (strOrNull) => {
        if(strOrNull){
            return new Date(strOrNull)
        }

        return new Date()
    }

    const initialStartTime = getInitialDate(pumpRecord?.start_time)
    const initialEndTime = getInitialDate(pumpRecord?.end_time)
    const initialYield = pumpRecord?.yield || 0
    const initialUnits = pumpRecord?.units || 'oz'
    const initialNotes = pumpRecord?.notes || ''

    const [startTime, setStartTime] = useState(initialStartTime)
    const [endTime, setEndTime] = useState(initialEndTime)
    const [pumpYield, setPumpYield] = useState(initialYield)
    const [units] = useState(initialUnits)
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
        call(`/pumps/${pumpRecord.id}`, "DELETE")
    }

    const handleSubmit = () => {
        const body = {
            start_time: startTime,
            end_time: endTime,
            yield: pumpYield,
            units,
            notes
        }
        if(pumpRecord){
            call(`/pumps/${pumpRecord.id}`, "PUT", body)
        }else{
            call(`/babies/${babyId}/pumps`, "POST", body)
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
                <label for="yield">Yield</label>
                <input type="text" value={pumpYield} onChange={e => setPumpYield(e.target.value)} />
                <span>oz</span>
            </div>
            <div>
                <label for="notes">Notes</label>
                <textarea id="notes" value={notes} onChange={handleUpdateNotes} rows={10}/>
            </div>
            <div className="mt-30"></div>
            { pumpRecord && <LoadingButton onClick={handleDelete} loading={loading} text="Delete" type="danger" />}
            <LoadingButton onClick={handleSubmit} loading={loading} text="Submit" className="float-right" />
        </div>
    )
}
