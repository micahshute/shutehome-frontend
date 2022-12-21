import { useEffect } from "react"
import { useState } from "react"
import DateTimePicker from "react-datetime-picker"
import { useToasts } from "react-toast-notifications"
import { useLazyRest } from "../../../../../hooks/useLazyRest"
import LoadingButton from "../../../../../lib/LoadingButton"

export default function DiaperRecord({babyId, onComplete, diaperRecord=null}){
    const LIQUID = 'liquid'
    const SOLID = 'solid'
    const NONE = 'none'
    const BOTH = 'both'


    const { addToast } = useToasts()

    const getInitialContents = () => {
        if(!diaperRecord) { return NONE }
        if(diaperRecord.has_liquid && diaperRecord.has_solid){
            return BOTH
        }else if(diaperRecord.has_liquid){
            return LIQUID
        }else if(diaperRecord.has_solid){
            return SOLID
        }

        return NONE
    }

    const initialTime = diaperRecord?.time || new Date()
    const initialContents = getInitialContents()
    const initialColor = diaperRecord?.color || ''
    const initialNotes = diaperRecord?.notes || ''

    const [time, setTime] = useState(initialTime)
    const [contents, setContents] = useState(initialContents)
    const [color, setColor] = useState(initialColor)
    const [notes, setNotes] = useState(initialNotes)

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

    const handleSelectContents = e => setContents(e.target.value)
    const handleUpdateColor = e => setColor(e.target.value)
    const handleUpdateNotes = e => setNotes(e.target.value)

    const handleDelete = () => {
        call(`/diapers/${diaperRecord.id}`, "DELETE")
    }

    const handleSubmit = () => {
        const has_liquid = contents === LIQUID || contents === BOTH
        const has_solid = contents === SOLID || contents === BOTH
        const body = {
            time,
            has_liquid,
            has_solid,
            color,
            notes
        }
        if(diaperRecord){
            call(`/diapers/${diaperRecord.id}`, "PUT", body)
        }else{
            call(`/babies/${babyId}/diapers`, "POST", body)
        }
    }

    return (
        <div>
            <div>
                <label for="startTime">Change Time</label>
                <DateTimePicker onChange={setTime} value={time} />
            </div>
            <div>
                <label for="contents">Contents</label>
                <select onChange={handleSelectContents} value={contents}>
                    <option value={SOLID}>Solid</option>
                    <option value={LIQUID}>Liquid</option>
                    <option value={BOTH}>Both</option>
                    <option value={NONE}>Empty</option>
                </select>
            </div>
            <div>
                <label for="color">Color</label>
                <input type="text" onChange={handleUpdateColor} value={color} />
            </div>
            <div>
                <label for="notes">Notes</label>
                <textarea id="notes" value={notes} onChange={handleUpdateNotes} rows={10}/>
            </div>
            <div className="mt-30"></div>
            { diaperRecord && <LoadingButton onClick={handleDelete} loading={loading} text="Delete" type="danger" />}
            <LoadingButton onClick={handleSubmit} loading={loading} text="Submit" className="float-right" />
        </div>
    )
}