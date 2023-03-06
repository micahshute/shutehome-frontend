import { useEffect, useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { useLazyRest } from '../../../../../hooks/useLazyRest'
import LoadingButton from '../../../../../lib/LoadingButton'
import { MDDateTimePicker } from '../DatePicker'

const FEED_TYPES = {
    BREAST: 'breast',
    FORMULA: 'formula',
    BOTTLE_BREAST: 'bottle_breast',
    SOLID: "solid"
}

const QUANTITY_TYPES = {
    TIME: 'time',
    AMOUNT: 'amount',
    SOLID: 'solid'
}

const FEED_TYPE_QUANTITY_TYPE = {
    [FEED_TYPES.BREAST]: QUANTITY_TYPES.TIME,
    [FEED_TYPES.FORMULA]: QUANTITY_TYPES.AMOUNT,
    [FEED_TYPES.BOTTLE_BREAST]: QUANTITY_TYPES.AMOUNT,
    [FEED_TYPES.SOLID]: QUANTITY_TYPES.SOLID,
}

function getQuantityType(feedType) {
    return FEED_TYPE_QUANTITY_TYPE[feedType]
}

export default function FeedRecord({babyId, onComplete, feedRecord=null}){

    let initialFeedTime = new Date()
    let initialFeedType = FEED_TYPES.FORMULA
    let initialQuantity = 0
    let initialQuantityType = getQuantityType(initialFeedType)
    let initialDidLatch = true
    let initialQuality = 0 
    let initialNotes = ''

    if(feedRecord){
        initialFeedTime = new Date(feedRecord.time)
        initialFeedType = feedRecord.food_type
        initialQuantity = feedRecord.quantity
        initialQuantityType = feedRecord.quantity_type
        initialDidLatch = feedRecord.did_latch
        initialQuality = feedRecord.quality
        initialNotes = feedRecord.notes
    }


    const [feedTime, setFeedTime] = useState(initialFeedTime)
    const [feedType, setFeedType] = useState(initialFeedType)
    const [quantity, setQuantity] = useState(initialQuantity)
    const [quantityType, setQuantityType] = useState(initialQuantityType)
    const [didLatch, setDidLatch] = useState(initialDidLatch)
    const [quality, setQuality] = useState(initialQuality)
    const [notes, setNotes] = useState(initialNotes)

    const { addToast } = useToasts()

    const handleSelectFeedType = e => {
        setQuantity(0)
        setQuantityType(getQuantityType(e.target.value))
        setFeedType(e.target.value)
    }

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
        } else if(error){
            addToast('There was a problem saving your record', { appearance: 'error' })
        }
    }, [data, error, loading])

    const handleDelete = () => {
        const url = `/feedings/${feedRecord.id}`
        call(url, 'delete')
    }

    const handleSubmit = () => {
        const body = {
            time: feedTime,
            food_type: feedType,
            quantity,
            quantity_type: quantityType,
            did_latch: didLatch,
            quality,
            notes 
        }

        if(feedRecord){
            const url = `/feedings/${feedRecord.id}`
            call(url, 'put', body)
        }else{
            const url = `/babies/${babyId}/feedings`
            call(url, 'post', body)
        }
    }

    const handleChangeQuantity = e => setQuantity(e.target.value)

    const handleChangeQuality = e => {
        const val = Number.parseFloat(e.target.value)
        if(val < 0){
            setQuality(0)
        }else if(val > 100){
            setQuality(100)
        }else{
            setQuality(val)
        }
    }

    const timeQuantityComponent = (
        <div className="register-baby-input">
            <label for="quantity">Duration</label>
            <input type="number" value={quantity} onChange={handleChangeQuantity} />
            <span className="register-baby-input-suffix">min.</span>
        </div>
    )

    const amountQuantityComponent = (
        <div className="register-baby-input">
            <label for="quantity">Amount</label>
            <input type="number" value={quantity} onChange={handleChangeQuantity} />
            <span className="register-baby-input-suffix">oz</span>
            <p>Note: 1oz = 30mL</p>
        </div>
    )

    const renderQuantity = () => {
        switch(quantityType){
            case QUANTITY_TYPES.TIME:
                return timeQuantityComponent
            case QUANTITY_TYPES.AMOUNT:
                return amountQuantityComponent
            case QUANTITY_TYPES.SOLID:
                return amountQuantityComponent
            default:
                throw new Error("Unsupported quantity type")
        }
    }

    const handleSelectDidLatch = e => setDidLatch(e.target.value)

    const renderDidLatch = () => {
        if(feedType !== FEED_TYPES.BREAST) return null
        return (
            <div className="register-baby-input">
                <label for="didLatch">Did baby latch?</label>
                <select id="didLatch" onChange={handleSelectDidLatch} value={didLatch}>
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                </select>
            </div>
        )
    }


    const renderQuality = () => {
        if(feedType !== FEED_TYPES.BREAST) return null
        return (
            <div className="register-baby-input">
                <label for="quality">Quality (subjective 0-100 score)</label>
                <input id="quality" value={quality} onChange={handleChangeQuality} />
            </div>
        )
    }

    const handleUpdateNotes = e => setNotes(e.target.value)

    return (
        <div>
            <div className="register-baby-input">
                <label for="feedTime">Feed Time</label>
                <MDDateTimePicker onChange={setFeedTime} value={feedTime} />
            </div>
            <div className="register-baby-input">
                <label for="feedType">Feed Type</label>
                <select id="feedType" onChange={handleSelectFeedType} value={feedType}>
                    <option value={FEED_TYPES.FORMULA}>Formula</option>
                    <option value={FEED_TYPES.BOTTLE_BREAST}>Bottled Breastmilk</option>
                    <option value={FEED_TYPES.BREAST}>Breast Feed</option>
                    <option value={FEED_TYPES.SOLID}>Solid</option>
                </select>
            </div>
            { renderQuantity() }
            { renderDidLatch() }
            { renderQuality() }
            <div className="register-baby-input">
                <label for="notes">Notes</label>
                <textarea id="notes" value={notes} onChange={handleUpdateNotes} rows={10}/>
            </div>
            <div className="mt-30"></div>
            { feedRecord && <LoadingButton onClick={handleDelete} loading={loading} text="Delete" type="danger" />}
            <LoadingButton onClick={handleSubmit} loading={loading} text="Save" className="float-right" />
        </div>
    )
}