import { useMemo, useState } from "react"
import { useRest } from "../../../../../hooks/useRest"
import { useUser } from "../../../../../hooks/useUser"
import Card from "../../../../../lib/Card"
import { getDate, getTime, round } from "../../../../../lib/helpers/helpers"
import { Day } from "../../../../../lib/helpers/time/dateMath"
import { DateRange } from "../../../../../lib/helpers/time/dateRange"
import Loader from "../../../../../lib/Loader"
import RangedEventDayChart from "../charts/RangedEventDayChart"
import { useNavigate, useParams } from "react-router-dom"
import { AiFillEdit } from "react-icons/ai"
import Modal from 'react-modal';
import SleepRecord from "../forms/SleepRecord"
import AddElementButton from "../../../../../lib/AddElementButton"

export default function ShowSleep(){

    const { id } = useParams()
    const { babies } = useUser().user
    const navigate = useNavigate()

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [sleepRecordToEdit, setSleepRecordToEdit] = useState(null)
    const [makeNewRecord, setMakeNewRecord] = useState(true)

    const baby = useMemo(() => babies.find(baby => baby.id.toString() === id.toString()), [babies, id])

    const {
        data,
        error,
        loading,
        reload
    } = useRest(`/babies/${baby.id}/sleeps?forDateRange=2weeks`, 'get', null, { useTimezone: true})

    // NOTE: Graphs displayed on this page assume non-overlapping sleeps


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

    let totalSleepTimeMinutes = 0
    const todayDay = new Day(today)
    let shouldSubtractDaysWithDataByOne = false

    const sortedSleeps = data.map(sleepDatum => {
        const sleepDateRange = DateRange.fromString(sleepDatum.start_time, sleepDatum.end_time)
        if(!sleepDateRange.includes(todayDay)){
            totalSleepTimeMinutes += sleepDateRange.durationMinutes()
        }else{
            shouldSubtractDaysWithDataByOne = true
        }
        return {
            dateRange: sleepDateRange,
            data: sleepDatum
        }
    }).sort((a, b) => {
        if(a.dateRange.startTime < b.dateRange.startTime){
            return 1
        }else if(a.dateRange.endTime > b.dateRange.startTime){
            return -1 
        }
        return 0
    })

    // Sleeps date ranges are sorted by start date, with the most
    // recent one first. The days in the variable "days" from today 
    // towards the past (the most recent day first). As we "reduce"
    // through "days" we will iterate them in order, and assign 
    // date ranges to days, keeping track of the index of the date
    // ranges we are checking against the days. Since they are sorted
    // in the same way, we can do a single pass through both to bucket
    // sleeps into days

    let currSleepIndex = 0
    const daysToDaySleepTotalMinutes = {}

    const daysToApplicableDateRanges = days.reduce((mem, dayStr) => {
        const dayOfConcern = Day.fromString(dayStr)
        let totalSleepMinutes = 0
        while(currSleepIndex < sortedSleeps.length && !sortedSleeps[currSleepIndex].dateRange.isAfter(dayOfConcern)){
            if(sortedSleeps[currSleepIndex].dateRange.includes(dayOfConcern)){
                if(mem[dayStr]){
                    // NOTE UNSHIFT IN JS DOESN'T SEEM TO BE O(1) :(
                    // dateRanges need to be ordred earlier->later
                    // since these are going into charts and tables
                    // Refactor could be using push then reversing
                    // I don't think we have enough values to care here
                    mem[dayStr].unshift(currSleepIndex)
                }else{
                    mem[dayStr] = [currSleepIndex]
                }
                const sleepDateRange = sortedSleeps[currSleepIndex].dateRange
                const nextDay = new Day(Day.add(1).to(dayOfConcern.startTime))
                const prevDay = new Day(Day.subtract(1).from(dayOfConcern.endTime))
                const doesSleepExtendPastDay = nextDay.includes(sleepDateRange)
                const doesSleepExtendToPrevDay = prevDay.includes(sleepDateRange)
                if(doesSleepExtendPastDay){
                    let dateRangeOfConcern = new DateRange(sleepDateRange.startTime, dayOfConcern.endTime)
                    totalSleepMinutes += dateRangeOfConcern.durationMinutes()
                }else if(doesSleepExtendToPrevDay){
                    let dateRangeOfConcern = new DateRange(dayOfConcern.startTime, sleepDateRange.endTime)
                    totalSleepMinutes += dateRangeOfConcern.durationMinutes()
                }else{
                    totalSleepMinutes += sleepDateRange.durationMinutes()
                }
            }
            currSleepIndex++
        }
        daysToDaySleepTotalMinutes[dayStr] = totalSleepMinutes
        if(currSleepIndex > sortedSleeps.length){
            return mem
        }
        // Do this for when a sleep extends over 2 days (eg a normal night's sleep)
        if(currSleepIndex > 0) { currSleepIndex-- }
        return mem
    }, {})    


    const renderCardForDay = dayStr => {
        const shouldRender = (daysToApplicableDateRanges[dayStr] || []).length > 0
        if(shouldRender){
            const totalSleepMinutes = daysToDaySleepTotalMinutes[dayStr]
            const sleepHours = round(totalSleepMinutes / 60, 2)
            return (
                <Card header={getDate(Day.fromString(dayStr).startTime)}>
                    {renderChartForDay(dayStr)}
                    {renderTableForDay(dayStr)}
                    <p>24 hr total: {sleepHours} hrs</p>
                </Card>
            )
        }

        return null
    }

    const renderChartForDay = (dayStr) => {
        const sleepDataIndices = daysToApplicableDateRanges[dayStr] || []
        const sleepRangeAndData = sleepDataIndices.map(i => sortedSleeps[i])//sortedSleeps[sleepDataIndex]
        return <RangedEventDayChart rangeData={sleepRangeAndData} dayStr={dayStr} />
    }

    const renderTableForDay = dayStr => {
        const sleepDataIndices = daysToApplicableDateRanges[dayStr] || []
        const sleepRangeAndData = sleepDataIndices.map(i => sortedSleeps[i])
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
                    { sleepRangeAndData.map(sleepDatum => (
                        <tr key={sleepDatum.id}>
                            <td className="p-6">{getTime(sleepDatum.data.start_time)}</td>
                            <td className="p-6">{getTime(sleepDatum.data.end_time)}</td>
                            <td className="p-6">{round(sleepDatum.dateRange.durationMinutes() / 60, 2)} hrs</td>
                            <td className="p-6"><AiFillEdit 
                                style={{cursor: 'pointer'}}
                                onClick={() => openEditModal(sleepDatum.data)}
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
        setSleepRecordToEdit(null)
        reload()
    }

    const openEditModal = datum => {
        setModalIsOpen(true)
        setSleepRecordToEdit(datum)
    }

    const openCreateModal = () => {
        setMakeNewRecord(true)
        setModalIsOpen(true)
    }

    const handleCloseModal = () => {
        setMakeNewRecord(false)
        setModalIsOpen(false)
        setSleepRecordToEdit(null)
    }

    const modalShouldBeRendered = () => {
        return !!((modalIsOpen && sleepRecordToEdit) || (modalIsOpen && makeNewRecord))
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
                    <SleepRecord babyId={baby.id} onComplete={handleUpdate} sleepRecord={sleepRecordToEdit} />
                </div>
            </Modal>
        ) 
    }

    const numberOfDaysWithData = Object.values(daysToDaySleepTotalMinutes).filter(mins => mins && mins > 0).length
    const daysWithDataExceptToday = shouldSubtractDaysWithDataByOne ? numberOfDaysWithData - 1 : numberOfDaysWithData
    const averageHoursPerDay = round((totalSleepTimeMinutes / 60) / daysWithDataExceptToday, 2)

    return (
        <div className="page">
            <div className="flex space-between align-center">
                <button 
                    onClick={() => navigate(`/baby-tracker/babies/${baby.id}`)}
                    className="btn btn-primary"     
                >Back</button>
                <div className="flex flex-col align-center flex-center">
                    <p className="text-bottom text-lg bold mt-0">Add Record</p>
                    <AddElementButton onClick={openCreateModal} center className="mt-0"/>
                </div>
            </div>
            { daysWithDataExceptToday > 0 && <h2 className="mt-30">Average {averageHoursPerDay} hrs/day</h2> }
            <p className="text-sm">Coming soon: Avg bedtime</p>
            { renderDayCards() }
            <button 
                onClick={() => navigate(`/baby-tracker/babies/${baby.id}`)}
                className="btn btn-primary"     
            >Back</button>
            { renderEditModal() }
        </div>
    )
}