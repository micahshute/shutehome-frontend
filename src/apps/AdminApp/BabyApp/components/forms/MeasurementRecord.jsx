import { useEffect } from "react"
import { useState } from "react"
import DateTimePicker from "react-datetime-picker"
import { useToasts } from "react-toast-notifications"
import { useLazyRest } from "../../../../../hooks/useLazyRest"
import { weightFloatToPoundsOunces } from "../../../../../lib/helpers/helpers"
import LoadingButton from "../../../../../lib/LoadingButton"

export default function MeasurementRecord({babyId, onComplete, measurementRecord=null}){

    const { addToast } = useToasts()

    const WEIGHT = 'weight'
    const HEIGHT = 'height'
    const HEAD_CIRCUMFERENCE = 'head_circumference'

    const getInitialType = () => {
        if(!measurementRecord) { return WEIGHT }
        if(measurementRecord.weight) { return WEIGHT }
        if(measurementRecord.height) { return HEIGHT }
        if(measurementRecord.head_circumference) { return HEAD_CIRCUMFERENCE }
        return WEIGHT
    }

    const getInitialValue = () => {
        if(!measurementRecord) { return 0 }
        return measurementRecord.weight || measurementRecord.height || measurementRecord.head_circumference
    }

    const initialType = getInitialType()
    const initialValue = getInitialValue()
    const initialTime = measurementRecord?.time || new Date()
    const initialNotes = measurementRecord?.notes || ''

    const [time, setTime] = useState(initialTime)
    const [type, setType] = useState(initialType)
    const [value, setValue] = useState(initialValue)
    const [notes, setNotes] = useState(initialNotes)

    const handleSelectType = e => setType(e.target.value)
    const handleChangeValue = e => setValue(e.target.value)
    const handleUpdateNotes = e => setNotes(e.target.value)
    const handleChangeLbs = e => {
        const { oz } = weightFloatToPoundsOunces(value) 
        const lbs = Number.parseInt(e.target.value) || 0
        setValue(lbs + (oz / 16))
    }

    const handleChangeOz = e => {
        const oz = Number.parseInt(e.target.value) || 0
        if(oz >= 16 || oz < 0) {
            setValue(Number.parseInt(value))
        }else{
            const lbs = Number.parseInt(value)
            setValue(lbs + (oz / 16))
        }
    }


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
        call(`/measurements/${measurementRecord.id}`, "DELETE")
    }

    const handleSubmit = () => {
        const body = {
            time,
            category: type,
            value,
        }


        if(measurementRecord){
            call(`/measurements/${measurementRecord.id}`, "PUT", body)
        }else{
            call(`/babies/${babyId}/measurements`, "POST", body)
        }
    }

    const renderValueInput = () => {
        switch(type){
            case WEIGHT:
                const {lbs, oz} = weightFloatToPoundsOunces(value)
                return (
                    <>
                        <div>
                            <label for="pounds">Pounds</label>
                            <input type="text" onChange={handleChangeLbs} value={lbs} />
                        </div>
                        <div>
                            <label for="ounces">Ounces</label>
                            <input type="text" onChange={handleChangeOz} value={oz} />
                        </div>
                    </>
                )
            case HEIGHT:
                return (
                    <div>
                        <label for="value">Inches</label>
                        <input type="text" onChange={handleChangeValue} value={value} />
                    </div>
                )
            case HEAD_CIRCUMFERENCE: 
                return (
                    <div>
                        <label for="value">Inches</label>
                        <input type="text" onChange={handleChangeValue} value={value} />
                    </div>

                )
            default:
                return (
                    <p className="danger">Please select a measurement type</p>
                )

        }
    }

    return (
        <div>
            <div>
                <label for="time">Time</label>
                <DateTimePicker onChange={setTime} value={time} />
            </div>
            <div>
                <label for="type">Measurement</label>
                <select onChange={handleSelectType} value={type} >
                    <option value={WEIGHT}>Weight</option>
                    <option value={HEIGHT}>Height</option>
                    <option value={HEAD_CIRCUMFERENCE}>Head Circumference</option>
                </select>
            </div>
            { renderValueInput() }
            <div>
                <label for="notes">Notes</label>
                <textarea id="notes" value={notes} onChange={handleUpdateNotes} rows={10}/>
            </div>
            <div className="mt-30"></div>
            { measurementRecord && <LoadingButton onClick={handleDelete} loading={loading} text="Delete" type="danger" />}
            <LoadingButton onClick={handleSubmit} loading={loading} text="Submit" className="float-right" />
        </div>
    )
}
