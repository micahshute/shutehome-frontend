import React from 'react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLazyRest } from '../../../../hooks/useLazyRest'
import { useRest } from '../../../../hooks/useRest'
import { useUser } from '../../../../hooks/useUser'
import Loader from '../../../../lib/Loader'
import { useToasts } from "react-toast-notifications"
import { useEffect } from 'react'
import { Timer } from './Timer'
import { round } from '../../../../lib/helpers/helpers'
import { useState } from 'react'
import Card from '../../../../lib/Card'

const SLEEPING = 'sleeping'
const TUMMY_TIME = 'tummy_time'
const EATING = 'eating' 
const CHANGING = 'changing'
const POST_FEEDING = 'post_feeding'
const TIMER = 'timer'

const FEED_TYPES = {
    BREAST: 'breast',
    FORMULA: 'formula',
    BOTTLE_BREAST: 'bottle_breast',
}

const QUANTITY_TYPES = {
    TIME: 'time',
    AMOUNT: 'amount'
}

export default function Dashboard(){
    const { id: babyId } = useParams()
    const { user } = useUser()
    const { babies } = user
    const navigate = useNavigate()

    const [feedType, setFeedType] = useState(FEED_TYPES.FORMULA)
    const [feedAmount, setFeedAmount] = useState(0)
    const [didLatch, setDidLatch] = useState(true)
    const [hasLiquid, setHasLiquid] = useState(false)
    const [hasSolid, setHasSolid] = useState(false)
    const [color, setColor] = useState('')
    const [didSaveFeed, setDidSaveFeed] = useState(false)

    const { addToast } = useToasts()

    const baby = useMemo(() => babies.find(baby => baby.id.toString() === babyId.toString()), [babies, babyId])
    const { data: fetchEventData, loading: fetchEventLoading, error: fetchEventError, reload: refetchCurrentEvent } = useRest(`/babies/${babyId}/current_event`, 'GET')
    const { data: dayStatsData, loading: dayStatsLoading, error: dayStatsError, reload: refetchDayStats } = useRest(`/babies/${babyId}/day_stats`, 'GET')
    const { data: createEventData, loading: createEventLoading, error: createEventError, call: createEventCall, reset: createEventReset} = useLazyRest()
    const { data: currentEventData, loading: currentEventLoading, error: currentEventError, call: callCurrentEvent } = useLazyRest()

    const loading = fetchEventLoading || currentEventLoading || createEventLoading || dayStatsLoading
    const error = fetchEventError || currentEventError || dayStatsError || createEventError

    useEffect(() => {
        if(!createEventLoading && !createEventError && createEventData){
            deleteCurrentEvent()
            createEventReset()
            resetFormStates()
            addToast('Saved Event Successfully', { appearance: 'success' })
        }
        if(!createEventLoading && createEventError){
            addToast('Failed to save event', { appearance: 'error' })
        }
    }, [createEventData, createEventError, createEventLoading])

    useEffect(() => {
        if(!currentEventLoading && !currentEventError && currentEventData){
            if(didSaveFeed){
                setDidSaveFeed(false)
                startEvent(POST_FEEDING)
            }
            refetchCurrentEvent()
            refetchDayStats()
        }
    }, [currentEventLoading, currentEventError, currentEventData])

    if(loading) {
        return (
            <div className="page">
                <div className="flex justify-center align-center">
                    <Loader dark />
                </div>
            </div>
        )
    }

    if(error) {
        return (
            <div className="page">
                <p className="danger">There was an error loading your current event: {JSON.stringify(error.message)}</p>
            </div>
        )
    }

    if(!fetchEventData || !dayStatsData){
        return null
    }

    const renderDashboardSummary = () => {
        return (
            <div className="mt-30">
                <Card header={`So far today ${baby.name} has...`}>
                    <ul>
                        <li>Eaten {dayStatsData.feeds.total_feeds} times</li>
                        { dayStatsData.feeds.has_breastfed && <li>Breastfed for {dayStatsData.feeds.total_breastfeed_time} mins</li> }
                        { dayStatsData.feeds.has_bottlefed && <li>Eaten {dayStatsData.feeds.total_bottlefed_amount } oz.</li>}
                        <li>Slept {dayStatsData.sleeps.total_sleeps} times for a total of {dayStatsData.sleeps.total_sleep_time_hours} hours</li>
                        <li>Been changed {dayStatsData.diapers.total_diaper_changes} times, with {dayStatsData.diapers.total_poops} poops and {dayStatsData.diapers.total_pees} pees</li>
                        <li>Done {dayStatsData.tummy_times.total_tummy_time_minutes} minutes of tummy time in {dayStatsData.tummy_times.total_tummy_times} sessions </li>
                    </ul>
                </Card>
            </div>
        )
    }

    const deleteCurrentEvent = () => {
        callCurrentEvent(`/babies/${babyId}/current_event`, 'delete')
    }

    const resetFormStates = () => {
        setColor('')
        setHasLiquid(false)
        setHasSolid(false)
        setDidLatch(true)
        setFeedAmount(0)
        setFeedType(FEED_TYPES.FORMULA)
    }

    const saveSleepEvent = () => {
        const body = {
            start_time: new Date(fetchEventData.current_event.start_time),
            end_time: new Date(),
            notes: '', 
        }
        createEventCall(`/babies/${babyId}/sleeps`, 'post', body)
    }

    const saveChangingEvent = () => {
        const body = {
            time: new Date(fetchEventData.current_event.start_time),
            has_liquid: hasLiquid,
            has_solid: hasSolid,
            color,
            notes: '', 
        }
        createEventCall(`/babies/${babyId}/diapers`, 'post', body)
    }

    const saveTummyTimeEvent = () => {
        const body = {
            start_time: new Date(fetchEventData.current_event.start_time),
            end_time: new Date(),
            notes: '', 
        }
        createEventCall(`/babies/${babyId}/tummy_times`, 'post', body)
    }

    const saveEatingEvent = () => {
        const time = new Date(fetchEventData.current_event.start_time)
        const quantity_type = feedType === FEED_TYPES.BREAST ? QUANTITY_TYPES.TIME : QUANTITY_TYPES.AMOUNT
        let quantity = feedAmount
        if(feedType === FEED_TYPES.BREAST){
            const now = new Date()
            quantity = round((now - time) / 1000 / 60, 2)
        }
        const body = {
            time,
            food_type: feedType,
            quantity,
            quantity_type,
            did_latch: didLatch,
            quality: 100,
            notes: '' 
        }
        setDidSaveFeed(true)
        createEventCall(`/babies/${babyId}/feedings`, 'post', body)
    }

    const renderDisplayTitle = (eventName) => {
        let prefix = `${baby.name} is `
        switch(eventName){
            case SLEEPING:
                return prefix + 'sleeping'
            case EATING:
                return prefix + 'eating'
            case TUMMY_TIME:
                return prefix + 'doing tummy time'
            case CHANGING:
                return prefix + 'getting changed'
            case POST_FEEDING:
                return prefix + 'is staying upright after eating'
            case TIMER:
                return prefix + 'is doing a timed task'
            default:
                throw new Error(`${eventName} is not an accepted event name`)
        }
    }

    const renderTimedEvent = (eventName, onCancel, onSave, options) => {
        const buttons = options?.noSaveOption ? (
            <div className="flex justify-end mt-50 w-80 margin-auto">
                <button className="btn btn-secondary" onClick={onCancel}>Done</button>
            </div>

        ) : (
            <div className="flex justify-between mt-50 w-80 margin-auto">
                <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button className="btn btn-primary" onClick={onSave}>Save</button>
            </div>
        )
        return (
            <div>
                <h2 className="text-center">{renderDisplayTitle(eventName)}</h2>
                <Timer startTime={new Date(fetchEventData.current_event.start_time)} />
                { options?.additionalComponents }
                { buttons }
            </div>
        )

    }

    const renderSleepingEvent = () => {
        return renderTimedEvent(SLEEPING, deleteCurrentEvent, saveSleepEvent)
    }

    const renderEatingEvent = () => {

        const eatingForm = (
            <div className="w-80 margin-auto mt-30">
                <label>Type</label>
                <select value={feedType} onChange={e => setFeedType(e.target.value)}>
                    <option value={FEED_TYPES.FORMULA}>Formula</option>
                    <option value={FEED_TYPES.BOTTLE_BREAST}>Bottled Breastmilk</option>
                    <option value={FEED_TYPES.BREAST}>Breast Feed</option>
                </select>
                { feedType === FEED_TYPES.BREAST ? (
                    <label class="checkmark-container">
                        Did Latch?
                        <input type="checkbox" checked={didLatch} onChange={e => setDidLatch(e.target.checked)} />
                        <span class="checkmark"></span>
                    </label>
                ): (
                    <>
                        <label>Amount</label>
                        <input type="number" value={feedAmount} onChange={e => setFeedAmount(e.target.value)} /> oz
                    </>
                )}
            </div>

        ) 

        return renderTimedEvent(EATING, deleteCurrentEvent, saveEatingEvent, { additionalComponents: eatingForm })
    }

    const renderChangingEvent = () => {
        const diaperForm = (
            <div className="w-80 margin-auto mt-30">
                <label class="checkmark-container">
                    Pee?
                    <input type="checkbox" checked={hasLiquid} onChange={e => setHasLiquid(e.target.checked)} />
                    <span class="checkmark"></span>
                </label>
                <label class="checkmark-container">
                    Poo?
                    <input type="checkbox" checked={hasSolid} onChange={e => setHasSolid(e.target.checked)} />
                    <span class="checkmark"></span>
                </label>
                <label>Color</label>
                <input type="text" value={color} onChange={e => setColor(e.target.value)} />
            </div>
        )
        return renderTimedEvent(CHANGING, deleteCurrentEvent, saveChangingEvent, { additionalComponents: diaperForm })
    }

    const renderPostFeedingEvent = () => {
        return renderTimedEvent(POST_FEEDING, deleteCurrentEvent, null, { noSaveOption: true })
    }

    const renderTimerEvent = () => {
        return renderTimedEvent(TIMER, deleteCurrentEvent, null, { noSaveOption: true })
    }

    const renderTummyTimeEvent = () => {
        return renderTimedEvent(TUMMY_TIME, deleteCurrentEvent, saveTummyTimeEvent)
    }

    const renderHasEventDashboard = () => {
        switch(fetchEventData.current_event.name){
            case SLEEPING: 
                return renderSleepingEvent()
            case EATING:
                return renderEatingEvent()
            case TUMMY_TIME:
                return renderTummyTimeEvent()
            case POST_FEEDING:
                return renderPostFeedingEvent()
            case CHANGING:
                return renderChangingEvent()
            case TIMER:
                return renderTimerEvent()
            default: 
                throw new Error("Unknown event")
        }
    }

    const startEvent = eventType => {
        const url = `/babies/${babyId}/current_event`
        callCurrentEvent(url, "POST", {
            name: eventType,
            startTime: new Date()
        })
    }

    const renderHasNoEventDashboard = () => {
        return (
            <div className='text-center'>
                <div className="event-button-container">
                    <button 
                        className="btn btn-event"
                        onClick={() => startEvent(SLEEPING)} 
                    >Start Sleep</button>
                </div>
                <div className="event-button-container">
                    <button 
                        className="btn btn-event"
                        onClick={() => startEvent(EATING)}     
                    >Start Feed</button>
                </div>
                <div className="event-button-container">
                    <button 
                        className="btn btn-event"
                        onClick={() => startEvent(CHANGING)} 
                    >Start Change</button>
                </div>
                <div className="event-button-container">
                    <button 
                        className="btn btn-event"
                        onClick={() => startEvent(TUMMY_TIME)} 
                    >Start Tummy Time</button>
                </div>
                <div className="event-button-container">
                    <button 
                        className="btn btn-event"
                        onClick={() => startEvent(TIMER)} 
                    >Start Timer</button>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            <div className="flex space-between align-center">
                <button 
                    onClick={() => navigate(`/baby-tracker/babies/${baby.id}`)}
                    className="btn btn-primary"     
                >Back</button>
            </div>
            { renderDashboardSummary() }
            { fetchEventData.has_current_event ? renderHasEventDashboard() : renderHasNoEventDashboard() }
        </div>

    )

}