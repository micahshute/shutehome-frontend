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
import { getVerboseDate, round } from '../../../../lib/helpers/helpers'
import { useState } from 'react'
import ContentCard from '../../../../lib/ContentCard'
import { MDDateTimePicker } from './DatePicker'
import { FaBackward, FaList } from 'react-icons/fa'

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
    SOLID: 'solid'
}

const QUANTITY_TYPES = {
    TIME: 'time',
    AMOUNT: 'amount',
    SOLID: 'solid'
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
    const { data: dayStatsData, loading: dayStatsLoading, error: dayStatsError, reload: refetchDayStats } = useRest(`/babies/${babyId}/day_stats`, 'GET', null, { useTimezone: true })
    const { data: createEventData, loading: createEventLoading, error: createEventError, call: createEventCall, reset: createEventReset} = useLazyRest()
    const { data: currentEventData, loading: currentEventLoading, error: currentEventError, call: callCurrentEvent } = useLazyRest()
    const { data: updatedEventData, loading: updateEventLoading, error: updateEventError, call: callUpdateEvent } = useLazyRest()

    const loading = fetchEventLoading || currentEventLoading || createEventLoading || dayStatsLoading || updateEventLoading
    const error = fetchEventError || currentEventError || dayStatsError || createEventError || updateEventError

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
        if(!updateEventLoading && !updateEventError && updatedEventData){
            refetchCurrentEvent()
            addToast('Updated Event Successfully', { appearance: 'success' })
        }

        if(!updateEventLoading && updateEventError){
            addToast('Failed to update event', { appearance: 'error'})
        }
    }, [updateEventLoading, updateEventError, updatedEventData])

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
                <ContentCard 
                    header={`${getVerboseDate(new Date())}`}
                    headerIcon={<FaList />}
                    color='sage'     
                >
                    <div style={{textAlign: 'left', paddingLeft: '8px'}}>
                        <h3>So far today {baby.name} has:</h3>
                        <ul>
                            <li>Eaten {dayStatsData.feeds.total_feeds} times</li>
                            { dayStatsData.feeds.has_breastfed && <li>Breastfed for {dayStatsData.feeds.total_breastfeed_time} mins</li> }
                            { dayStatsData.feeds.has_bottlefed && <li>Bottlefed {dayStatsData.feeds.total_bottlefed_amount } fl oz.</li>}
                            { dayStatsData.feeds.has_solids && <li>Eaten {dayStatsData.feeds.total_solids_amount } oz of solids</li>}
                            <li>Slept {dayStatsData.sleeps.total_night_sleep_time} hours last night</li>
                            <li>Napped {dayStatsData.sleeps.total_naps} times for a total of {dayStatsData.sleeps.total_nap_hours} hours</li>
                            <li>Been changed {dayStatsData.diapers.total_diaper_changes} times, with {dayStatsData.diapers.total_poops} poops and {dayStatsData.diapers.total_pees} pees</li>
                            <li>Done {dayStatsData.tummy_times.total_tummy_time_minutes} minutes of tummy time in {dayStatsData.tummy_times.total_tummy_times} sessions </li>
                        </ul>
                    </div>
                </ContentCard>
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
        const quantity_type = feedType === FEED_TYPES.BREAST ? QUANTITY_TYPES.TIME : (feedType === FEED_TYPES.SOLID) ? QUANTITY_TYPES.SOLID : QUANTITY_TYPES.AMOUNT
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
            <div className="flex justify-between mt-50 w-100 margin-auto">
                <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <MDDateTimePicker 
                    onChange={updateEvent} 
                    value={new Date(fetchEventData.current_event.start_time)} 
                    small={true} 
                    buttonType='tertiary' 
                    hideTimeDisplay={true}
                    renderAsModal={true}
                />
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
            <div className="w-180 margin-auto mt-30">
                <label>Type</label>
                <select value={feedType} onChange={e => setFeedType(e.target.value)}>
                    <option value={FEED_TYPES.FORMULA}>Formula</option>
                    <option value={FEED_TYPES.BOTTLE_BREAST}>Bottled Breastmilk</option>
                    <option value={FEED_TYPES.BREAST}>Breast Feed</option>
                    <option value={FEED_TYPES.SOLID}>Solids</option>
                </select>
                { feedType === FEED_TYPES.BREAST ? (
                    <label className="checkmark-container">
                        Did Latch?
                        <input type="checkbox" checked={didLatch} onChange={e => setDidLatch(e.target.checked)} />
                        <span className="checkmark"></span>
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
                <label className="checkmark-container">
                    Pee?
                    <input type="checkbox" checked={hasLiquid} onChange={e => setHasLiquid(e.target.checked)} />
                    <span className="checkmark"></span>
                </label>
                <label className="checkmark-container">
                    Poo?
                    <input type="checkbox" checked={hasSolid} onChange={e => setHasSolid(e.target.checked)} />
                    <span className="checkmark"></span>
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
        let component;
        switch(fetchEventData.current_event.name){
            case SLEEPING: 
                component = renderSleepingEvent()
                break
            case EATING:
                component = renderEatingEvent()
                break
            case TUMMY_TIME:
                component = renderTummyTimeEvent()
                break
            case POST_FEEDING:
                component = renderPostFeedingEvent()
                break
            case CHANGING:
                component = renderChangingEvent()
                break
            case TIMER:
                component = renderTimerEvent()
                break
            default: 
                throw new Error("Unknown event")
        }

        return (
            <>
                <div className="text-center">
                    { renderSleepAndFeedTimers() }
                </div>
                { component }
            </>
        )
    }

    const startEvent = eventType => {
        const url = `/babies/${babyId}/current_event`
        callCurrentEvent(url, "POST", {
            name: eventType,
            startTime: new Date()
        })
    }

    const updateEvent = newStartTime => {
        const url = `/babies/${babyId}/current_event`
        callUpdateEvent(url, "PUT", {
            startTime: newStartTime
        })
    }

    const renderSleepTimer = () => {
        if(fetchEventData.has_current_event && fetchEventData.current_event.name === SLEEPING) {
            return null
        }

        const SLEEP_TIME_WINDOW_MINUTES = 90

        return (
            <div className='w-80'>
                <p>Time since last sleep</p>
                <Timer skinny startTime={new Date(dayStatsData.sleeps.last_sleep_time)} minutesUntilDanger={SLEEP_TIME_WINDOW_MINUTES} />
            </div>
        )
    }

    const renderFeedTimer = () => {
        if(fetchEventData.has_current_event && fetchEventData.current_event.name === EATING) {
            return null
        }

        const shouldRenderRightBorder = !(fetchEventData.has_current_event && fetchEventData.current_event.name === SLEEPING)
        const EAT_TIME_WINDOW_MINUTES = 150

        return (
            <div className='w-80'>
                <p>Time since last feed</p>
                <div className={shouldRenderRightBorder ? "border-right" : null}>
                    <Timer skinny startTime={new Date(dayStatsData.feeds.last_feed_time)} minutesUntilDanger={EAT_TIME_WINDOW_MINUTES} />
                </div>
            </div>
        )
    }

    const renderSleepAndFeedTimers = () => {
        return (
            <div className="flex space-around border-bottom">
                { dayStatsData.feeds.last_feed_time && renderFeedTimer() }
                { dayStatsData.sleeps.last_sleep_time && renderSleepTimer() }
            </div>
        )
    }

    const renderHasNoEventDashboard = () => {
        return (
            <div className='text-center'>
                    { renderSleepAndFeedTimers() }
                <div className='control-panel'>
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
            </div>
        )
    }

    return (
        <div className="page">
            <div className="flex space-between align-center">
                <button 
                    onClick={() => navigate(`/baby-tracker/babies/${baby.id}`)}
                    className="btn btn-primary btn-small pullup"     
                ><FaBackward /></button>
            </div>
            { renderDashboardSummary() }
            { fetchEventData.has_current_event ? renderHasEventDashboard() : renderHasNoEventDashboard() }
        </div>

    )

}