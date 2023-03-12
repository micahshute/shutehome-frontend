import { useMemo, useState } from "react"
import { useRest } from "../../../../../hooks/useRest"
import { useUser } from "../../../../../hooks/useUser"
import Card from "../../../../../lib/Card"
import { getDate, getTime, round } from "../../../../../lib/helpers/helpers"
import { Day } from "../../../../../lib/helpers/time/dateMath"
import { DateRange } from "../../../../../lib/helpers/time/dateRange"
import Loader from "../../../../../lib/Loader"
import RangedEventDayChart from "../charts/RangedEventDayChart"
import { useParams } from "react-router-dom"
import { AiFillEdit } from "react-icons/ai"
import Modal from 'react-modal';
import TummyTimeRecord from "../forms/TummyTimeRecord"
import AddElementButton from "../../../../../lib/AddElementButton"
import BackButton from "../../../../../lib/BackButton"

export default function ShowTummyTime(){

    const { id } = useParams()
    const { babies } = useUser().user

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [eventRecordToEdit, setEventRecordToEdit] = useState(null)
    const [makeNewRecord, setMakeNewRecord] = useState(true)

    const baby = useMemo(() => babies.find(baby => baby.id.toString() === id.toString()), [babies, id])

    const {
        data,
        error,
        loading,
        reload
    } = useRest(`/babies/${baby.id}/tummy_times?forDateRange=2weeks`, 'get', null, { useTimezone: true})

    // NOTE: Graphs displayed on this page assume non-overlapping events


    if(!data || loading){
        return (
            <div className="page">
                <Loader dark />
            </div>
        )
    }

    if(error){
        return (
            <div className="page">
                <h1 className="danger">Oh no! There was a problem loading your data..</h1>
            </div>
        )
    }
    const today = new Date()
    const days = Array.from({length: 14}, (_,i) => i).map(daysBeforeToday => {
        const date = Day.subtract(daysBeforeToday).from(today)
        const day = new Day(date)
        return day.toString()
    })

    let totalEventTimeMinutes = 0

    const sortedEvents = data.map(eventDatum => {
        const eventDateRange = DateRange.fromString(eventDatum.start_time, eventDatum.end_time)
        totalEventTimeMinutes += eventDateRange.durationMinutes()
        return {
            dateRange: eventDateRange,
            data: eventDatum
        }
    }).sort((a, b) => {
        if(a.dateRange.startTime < b.dateRange.startTime){
            return 1
        }else if(a.dateRange.endTime > b.dateRange.startTime){
            return -1 
        }
        return 0
    })

    // Events date ranges are sorted by start date, with the most
    // recent one first. The days in the variable "days" from today 
    // towards the past (the most recent day first). As we "reduce"
    // through "days" we will iterate them in order, and assign 
    // date ranges to days, keeping track of the index of the date
    // ranges we are checking against the days. Since they are sorted
    // in the same way, we can do a single pass through both to bucket
    // events into days

    let currEventIndex = 0
    const daysToDayEventTotalMinutes = {}

    const daysToApplicableDateRanges = days.reduce((mem, dayStr) => {
        const dayOfConcern = Day.fromString(dayStr)
        let totalEventMinutes = 0
        while(currEventIndex < sortedEvents.length && !sortedEvents[currEventIndex].dateRange.isAfter(dayOfConcern)){
            if(sortedEvents[currEventIndex].dateRange.includes(dayOfConcern)){
                if(mem[dayStr]){
                    // NOTE UNSHIFT IN JS DOESN'T SEEM TO BE O(1) :(
                    // dateRanges need to be ordred earlier->later
                    // since these are going into charts and tables
                    // Refactor could be using push then reversing
                    // I don't think we have enough values to care here
                    mem[dayStr].unshift(currEventIndex)
                }else{
                    mem[dayStr] = [currEventIndex]
                }
                const eventDateRange = sortedEvents[currEventIndex].dateRange
                const nextDay = new Day(Day.add(1).to(dayOfConcern.startTime))
                const prevDay = new Day(Day.subtract(1).from(dayOfConcern.endTime))
                const doesEventExtendPastDay = nextDay.includes(eventDateRange)
                const doesEventExtendToPrevDay = prevDay.includes(eventDateRange)
                if(doesEventExtendPastDay){
                    let dateRangeOfConcern = new DateRange(eventDateRange.startTime, dayOfConcern.endTime)
                    totalEventMinutes += dateRangeOfConcern.durationMinutes()
                }else if(doesEventExtendToPrevDay){
                    let dateRangeOfConcern = new DateRange(dayOfConcern.startTime, eventDateRange.endTime)
                    totalEventMinutes += dateRangeOfConcern.durationMinutes()
                }else{
                    totalEventMinutes += eventDateRange.durationMinutes()
                }
            }
            currEventIndex++
        }
        daysToDayEventTotalMinutes[dayStr] = totalEventMinutes
        if(currEventIndex > sortedEvents.length){
            return mem
        }
        // Do this for when a event extends over 2 days (eg a normal night's event)
        if(currEventIndex > 0) { currEventIndex-- }
        return mem
    }, {})    


    const renderCardForDay = dayStr => {
        const shouldRender = (daysToApplicableDateRanges[dayStr] || []).length > 0
        if(shouldRender){
            const totalEventMinutes = daysToDayEventTotalMinutes[dayStr]
            const eventHours = round(totalEventMinutes / 60, 2)
            return (
                <Card header={getDate(Day.fromString(dayStr).startTime)}>
                    {renderChartForDay(dayStr)}
                    {renderTableForDay(dayStr)}
                    <p>24 hr total: {eventHours} hrs</p>
                </Card>
            )
        }

        return null
    }

    const renderChartForDay = (dayStr) => {
        const eventDataIndices = daysToApplicableDateRanges[dayStr] || []
        const eventRangeAndData = eventDataIndices.map(i => sortedEvents[i])//sortedEvents[eventDataIndex]
        return <RangedEventDayChart rangeData={eventRangeAndData} dayStr={dayStr} />
    }

    const renderTableForDay = dayStr => {
        const eventDataIndices = daysToApplicableDateRanges[dayStr] || []
        const eventRangeAndData = eventDataIndices.map(i => sortedEvents[i])
        return (
            <table className="text-left text-sm">
                <thead>
                    <tr>
                        <th className="p-6">Start Time</th>
                        <th className="p-6">End Time</th>
                        <th className="p-6">Duration</th>
                        <th className="p-6"></th>
                    </tr>
                </thead>
                <tbody>
                    { eventRangeAndData.map(eventDatum => (
                        <tr key={eventDatum.id}>
                            <td className="p-6">{getTime(eventDatum.data.start_time)}</td>
                            <td className="p-6">{getTime(eventDatum.data.end_time)}</td>
                            <td className="p-6">{round(eventDatum.dateRange.durationMinutes() / 60, 2)} hrs</td>
                            <td className="p-6"><AiFillEdit 
                                style={{cursor: 'pointer'}}
                                onClick={() => openEditModal(eventDatum.data)}
                            /></td>
                        </tr>
                        )
                    )}
                </tbody>
            </table>
        )
    }

    const renderDayCards = () => {
        return days.map(dayStr => {
            return (
                <div key={dayStr} className="m-10">
                    { renderCardForDay(dayStr) }
                </div>
            )
        })
    }

    const handleUpdate = () => {
        setModalIsOpen(false)
        setEventRecordToEdit(null)
        reload()
    }

    const openEditModal = datum => {
        setModalIsOpen(true)
        setEventRecordToEdit(datum)
    }

    const openCreateModal = () => {
        setMakeNewRecord(true)
        setModalIsOpen(true)
    }

    const handleCloseModal = () => {
        setMakeNewRecord(false)
        setModalIsOpen(false)
        setEventRecordToEdit(null)
    }

    const modalShouldBeRendered = () => {
        return !!((modalIsOpen && eventRecordToEdit) || (modalIsOpen && makeNewRecord))
    }


    const renderEditModal = () => {
        return(
            <Modal
                isOpen={modalShouldBeRendered()} 
                onRequestClose={handleCloseModal}
                contentLabel="Update event record"
            >
                <div>
                    <button className="x" onClick={handleCloseModal}>Close</button>
                    <TummyTimeRecord babyId={baby.id} onComplete={handleUpdate} tummyTimeRecord={eventRecordToEdit} />
                </div>
            </Modal>
        ) 
    }

    const numberOfDaysWithData = Object.values(daysToDayEventTotalMinutes).filter(mins => mins && mins > 0).length
    const averageHoursPerDay = round((totalEventTimeMinutes / 60) / numberOfDaysWithData, 2)

    return (
        <div className="page">
            <h1>{baby.name}'s Tummy Times</h1>
            <div className="flex space-between align-center">
                <BackButton pathUrl={`/baby-tracker/babies/${baby.id}`} />
                <div className="flex flex-col align-center flex-center">
                    <div style={{paddingBottom: '10px'}}>
                        <AddElementButton onClick={openCreateModal} center className="mt-0"/>
                    </div>
                </div>
            </div>
            { numberOfDaysWithData > 0 && <h2 className="mt-30">Average {averageHoursPerDay} hrs/day</h2> }
            { renderDayCards() }
            <div className="mt-30">
                <BackButton pathUrl={`/baby-tracker/babies/${baby.id}`} />
            </div>
            { renderEditModal() }
        </div>
    )
}