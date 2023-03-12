// TODO: USE THIS TO GENERALIZE SIMILAR PAGES (e.g. sleep, tummy times)
import { useMemo, useState } from "react"
import { useRest } from "../../../../../hooks/useRest"
import { useUser } from "../../../../../hooks/useUser"
import Card from "../../../../../lib/Card"
import { getDate, getTime, round } from "../../../../../lib/helpers/helpers"
import { Day } from "../../../../../lib/helpers/time/dateMath"
import { DateRange } from "../../../../../lib/helpers/time/dateRange"
import Loader from "../../../../../lib/Loader"
import SleepDayChart from "../charts/RangedEventDayChart"
import { useParams } from "react-router-dom"
import { AiFillEdit } from "react-icons/ai"
import Modal from 'react-modal';
import SleepRecord from "../forms/SleepRecord"
import AddElementButton from "../../../../../lib/AddElementButton"
import BackButton from "../../../../../lib/BackButton"

export default function ShowRangedData({ urlResourceName }){

    const { id } = useParams()
    const { babies } = useUser().user

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [makeNewRecord, setMakeNewRecord] = useState(true)

    const baby = useMemo(() => babies.find(baby => baby.id.toString() === id.toString()), [babies, id])

    const {
        data,
        error,
        loading,
        reload
    } = useRest(`/babies/${baby.id}/${urlResourceName}?forDateRange=2weeks`, 'get', null, { useTimezone: true})

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

    let totalRangeTimeMinutes = 0

    const sortedData = data.map(datum => {
        const dateRange = DateRange.fromString(datum.start_time, datum.end_time)
        totalRangeTimeMinutes += dateRange.durationMinutes()
        return {
            dateRange: dateRange,
            data: datum
        }
    }).sort((a, b) => {
        if(a.dateRange.startTime < b.dateRange.startTime){
            return 1
        }else if(a.dateRange.endTime > b.dateRange.startTime){
            return -1 
        }
        return 0
    })

    // Date ranges are sorted by start date, with the most
    // recent one first. The days in the variable "days" from today 
    // towards the past (the most recent day first). As we "reduce"
    // through "days" we will iterate them in order, and assign 
    // date ranges to days, keeping track of the index of the date
    // ranges we are checking against the days. Since they are sorted
    // in the same way, we can do a single pass through both to bucket
    // data into days

    let currIndex = 0
    const daysToDayEventTotalMinutes = {}

    const daysToApplicableDateRanges = days.reduce((mem, dayStr) => {
        const dayOfConcern = Day.fromString(dayStr)
        let totalEventMinutes = 0
        while(currIndex < sortedData.length && !sortedData[currIndex].dateRange.isAfter(dayOfConcern)){
            if(sortedData[currIndex].dateRange.includes(dayOfConcern)){
                if(mem[dayStr]){
                    // NOTE UNSHIFT IN JS DOESN'T SEEM TO BE O(1) :(
                    // dateRanges need to be ordred earlier->later
                    // since these are going into charts and tables
                    // Refactor could be using push then reversing
                    // I don't think we have enough values to care here
                    mem[dayStr].unshift(currIndex)
                }else{
                    mem[dayStr] = [currIndex]
                }
                const dateRange = sortedData[currIndex].dateRange
                const nextDay = new Day(Day.add(1).to(dayOfConcern.startTime))
                const prevDay = new Day(Day.subtract(1).from(dayOfConcern.endTime))
                const doesExtendPastDay = nextDay.includes(dateRange)
                const doesExtendToPrevDay = prevDay.includes(dateRange)
                if(doesExtendPastDay){
                    let dateRangeOfConcern = new DateRange(dateRange.startTime, dayOfConcern.endTime)
                    totalEventMinutes += dateRangeOfConcern.durationMinutes()
                }else if(doesExtendToPrevDay){
                    let dateRangeOfConcern = new DateRange(dayOfConcern.startTime, dateRange.endTime)
                    totalEventMinutes += dateRangeOfConcern.durationMinutes()
                }else{
                    totalEventMinutes += dateRange.durationMinutes()
                }
            }
            currIndex++
        }
        daysToDayEventTotalMinutes[dayStr] = totalEventMinutes
        if(currIndex > sortedData.length){
            return mem
        }
        // Do this for when a sleep extends over 2 days (eg a normal night's sleep)
        if(currIndex > 0) { currIndex-- }
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
        const dataIndices = daysToApplicableDateRanges[dayStr] || []
        const rangeAndData = dataIndices.map(i => sortedData[i])
        return <SleepDayChart sleepData={rangeAndData} dayStr={dayStr} />
    }

    const renderTableForDay = dayStr => {
        const dataIndices = daysToApplicableDateRanges[dayStr] || []
        const rangeAndData = dataIndices.map(i => sortedSleeps[i])
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
                    { rangeAndData.map(datum => (
                        <tr key={datum.id}>
                            <td className="p-6">{getTime(datum.data.start_time)}</td>
                            <td className="p-6">{getTime(datum.data.end_time)}</td>
                            <td className="p-6">{round(datum.dateRange.durationMinutes() / 60, 2)} hrs</td>
                            <td className="p-6"><AiFillEdit 
                                style={{cursor: 'pointer'}}
                                onClick={() => openEditModal(datum.data)}
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
        setRecordToEdit(null)
        reload()
    }

    const openEditModal = datum => {
        setModalIsOpen(true)
        setRecordToEdit(datum)
    }

    const openCreateModal = () => {
        setMakeNewRecord(true)
        setModalIsOpen(true)
    }

    const handleCloseModal = () => {
        setMakeNewRecord(false)
        setModalIsOpen(false)
        setRecordToEdit(null)
    }

    const modalShouldBeRendered = () => {
        return !!((modalIsOpen && recordToEdit) || (modalIsOpen && makeNewRecord))
    }


    const renderEditModal = () => {
        return(
            <Modal
                isOpen={modalShouldBeRendered()} 
                onRequestClose={handleCloseModal}
                contentLabel="Update sleep record"
            >
                <div>
                    <button className="x" onClick={handleCloseModal}>Close</button>
                    <SleepRecord babyId={baby.id} onComplete={handleUpdate} sleepRecord={recordToEdit} />
                </div>
            </Modal>
        ) 
    }

    const numberOfDaysWithData = Object.values(daysToDayEventTotalMinutes).filter(mins => mins && mins > 0).length
    const averageHoursPerDay = round((totalEventTimeMinutes / 60) / numberOfDaysWithData, 2)

    return (
        <div className="page">
            <div className="flex space-between align-center">
                <BackButton pathUrl={`/baby-tracker/babies/${baby.id}`} />
                <div className="flex flex-col align-center flex-center">
                    <div style={{paddingBottom: '10px'}}>
                        <AddElementButton onClick={openCreateModal} center className="mt-0"/>
                    </div>
                </div>
            </div>
            { numberOfDaysWithData > 0 && <h2 className="mt-30">Average {averageHoursPerDay} hrs/day</h2> }
            <p className="text-sm">Coming soon: Avg bedtime</p>
            { renderDayCards() }
            <div className="mt-30">
                <BackButton pathUrl={`/baby-tracker/babies/${baby.id}`} />
            </div>
            { renderEditModal() }
        </div>
    )
}