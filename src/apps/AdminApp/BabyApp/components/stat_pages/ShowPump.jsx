import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useRest } from "../../../../../hooks/useRest"
import { useUser } from "../../../../../hooks/useUser"
import Card from "../../../../../lib/Card"
import { DateMath, Day } from "../../../../../lib/helpers/time/dateMath"
import { getDate, getTime, getTimeDiff, round } from "../../../../../lib/helpers/helpers"
import PumpDayChart from "../charts/PumpDayChart"
import { AiFillEdit } from "react-icons/ai"
import Modal from 'react-modal';
import PumpRecord from "../forms/PumpRecord";
import AddElementButton from "../../../../../lib/AddElementButton";
import PumpStatsChart from "../charts/PumpOverviewChart"
import Loader from "../../../../../lib/Loader"


export default function ShowPump(){

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [makeNewRecord, setMakeNewRecord] = useState(false)
    const [pumpRecordToEdit, setPumpRecordToEdit] = useState(null)

    const navigate = useNavigate()
    const { id } = useParams()
    const { babies } = useUser().user
    const baby = useMemo(() => babies.find(baby => baby.id.toString() === id.toString()), [babies, id])
    const { 
        data,
        error,
        loading,
        reload,
    } = useRest(`/babies/${baby.id}/pumps?forDateRange=2weeks`, 'get', null, {useTimezone: true})

    const {
        data: statData,
        error: statError,
        loading: statLoading,
        reload: statReload
    } = useRest(`/babies/${baby.id}/pumps/stats`, 'get', null, { useTimezone: true })

    const pumpByDay = (pumpData) => {
        if(!pumpData){
            return []
        }

        const pumpDataBuckets = pumpData.reduce((mem, pumpDatum) => {
            const pumpTime = new Date(pumpDatum.start_time)
            const day = new Day(pumpTime)
            if(mem[day.toString()]){
                mem[day.toString()].push(pumpDatum)
            }else{
                mem[day.toString()] = [pumpDatum]
            }
            return mem
        }, {})

        // console.log('pumpdatabuckets', pumpDataBuckets)
        return Object.values(pumpDataBuckets).map(pumpsByDay => {
            return {
                day: DateMath.beginningOfDay(new Date(pumpsByDay[0].start_time)),
                pumpData: pumpsByDay
            }
        }).sort((a,b) => {
            if(a.day > b.day) return -1
            if(a.day < b.day) return 1
            return 0
        })
    }

    const handleUpdate = () => {
        setModalIsOpen(false)
        setPumpRecordToEdit(null)
        reload()
        statReload()
    }

    const openEditModal = (pumpRecord) => {
        setModalIsOpen(true)
        setPumpRecordToEdit(pumpRecord)
    }

    const openCreateModal = () => {
        setMakeNewRecord(true)
        setModalIsOpen(true)
    }

    const handleCloseModal = () => {
        setMakeNewRecord(false)
        setModalIsOpen(false)
        setPumpRecordToEdit(null)
    }
    
    const modalShouldBeRendered = () => {
        return (modalIsOpen && pumpRecordToEdit) || (modalIsOpen && makeNewRecord)
    }

    const renderEditModal = () => {
        return (
            <Modal 
                isOpen={modalShouldBeRendered()}
                onRequestClose={handleCloseModal}
                contentLabel="Update pump record"
            >
                <div className="ml-30 mt-30 mr-30">
                    <button className="x" onClick={handleCloseModal}>Close</button>
                    <PumpRecord babyId={baby.id} onComplete={handleUpdate} pumpRecord={pumpRecordToEdit} />
                </div>
            </Modal>
        )
    }


    const renderPumpRows = (dataForDay) => {
        return dataForDay.map(datum => {
            return (
                <tr key={datum.id}>
                    <td className="text-center">{getTime(datum.start_time)}</td>
                    <td classname="text-center">{getTimeDiff(datum.start_time, datum.end_time)}</td>
                    <td className="text-center">{datum.yield}{` `}{datum.units}</td>
                    <td className="text-center">
                        <AiFillEdit 
                            style={{cursor: 'pointer'}} 
                            onClick={() => openEditModal(datum)}
                        />
                    </td>
                </tr>
            )
        })
    }

    const renderPumpCardsByDay = () => {
        const pumpDataByDay = pumpByDay(data)
        // console.log('pumpdatabyday', pumpDataByDay)
        return pumpDataByDay.map(pumpDataForDay => {

            const totalPumpings = pumpDataForDay.pumpData.length
            let totalTimeMinutes = 0
            const totalAmount = pumpDataForDay.pumpData.reduce((mem, fdata) => {
                const start = new Date(fdata.start_time)
                const finish = new Date(fdata.end_time)
                const diffMins = (finish - start) / 1000 / 60
                totalTimeMinutes += diffMins
                mem += fdata.yield
                return mem
            }, 0)

            // console.log('pumpdataforday', pumpDataForDay)
            return(
                <div key={pumpDataForDay.day.toString()} className="w-85 m-10">
                    <Card header={getDate(pumpDataForDay.day.toString())}>
                        <>
                            <div className="flex space-between flex-wrap align-start width-full"> 
                                <table className="text-left text-sm">
                                    <thead>
                                        <tr>
                                            <th className="p-10">Time</th>
                                            <th className="p-10">Duration</th>
                                            <th className="p-10">Yield</th>
                                            <th className="p-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderPumpRows(pumpDataForDay.pumpData)}
                                    </tbody>
                                </table> 
                                <PumpDayChart 
                                    pumpData={pumpDataForDay.pumpData} 
                                    width={window.innerWidth > 1000 ? '70%' : '100%' }
                                />
                            </div>
                            <p style={{fontSize: '1.5em'}}><strong>Total Time: {round(totalTimeMinutes, 1)} Mins</strong></p>
                            <p style={{fontSize: '1.5em'}}><strong>Total Amount: {totalAmount} Oz</strong></p>
                            <p><strong>Pumped {totalPumpings} times</strong></p>
                        </>
                    </Card>
                </div>
            )

        })
    }

    const renderStatData = () => {
        if(statLoading) {
            return <Loader dark />
        }

        if(statError) {
            return <p className="danger">There was an error loading your stats</p>
        }
       
        if(statData){
            return (
                <div className="mt-30">
                    <Card header="Two Week Daily Breakdown">
                        <PumpStatsChart pumpStatsData={statData} />
                        <div>
                            <p className="text-lg">Average Pump Time: {round(statData.average_time_per_day, 2)} mins</p>
                            <p className="text-lg">Time StdDev: {round(statData.time_std, 2)} mins</p>
                            <p className="text-lg">Average Pump Volume: {round(statData.average_volume_per_day, 2)} oz</p>
                            <p className="text-lg">Vol. StdDev: {round(statData.volume_std, 2)} oz</p>
                        </div>
                    </Card>
                </div>
            )
        }
    }

    if(loading){
        return (
            <div className="page">
                <Loader dark />
            </div>
        )
    }

    return (
        <div className="page">
            <h1 className="text-center">Pump Record</h1>
            <div className="flex space-between align-center">
                <button 
                    onClick={() => navigate(`/baby-tracker/babies/${baby.id}`)}
                    className="btn btn-primary"     
                >Back</button>
                <div className="w-15 minw-100p mt-0">
                    <div className="flex flex-col align-center flex-center">
                        <p className="text-bottom text-lg bold mt-0">Add Record</p>
                        <AddElementButton onClick={openCreateModal} center className="mt-0"/>
                    </div>
                </div>
            </div>
            <div className="flex flex-start">
            </div>
            { renderStatData() }
            <h2 className="text-center mt-30">Daily Breakdown</h2>
            <div className="flex justify-center align-center w-full flex-col">
                { renderPumpCardsByDay() }

            </div>
            <button 
                onClick={() => navigate(`/baby-tracker/babies/${baby.id}`)}
                className="btn btn-primary"     
            >Back</button>
            { renderEditModal() }
        </div>
    )
}








// import { useMemo, useState } from "react"
// import { useRest } from "../../../../../hooks/useRest"
// import { useUser } from "../../../../../hooks/useUser"
// import Card from "../../../../../lib/Card"
// import { getDate, getTime, round } from "../../../../../lib/helpers/helpers"
// import { Day } from "../../../../../lib/helpers/time/dateMath"
// import { DateRange } from "../../../../../lib/helpers/time/dateRange"
// import Loader from "../../../../../lib/Loader"
// import RangedEventDayChart from "../charts/RangedEventDayChart"
// import { useNavigate, useParams } from "react-router-dom"
// import { AiFillEdit } from "react-icons/ai"
// import Modal from 'react-modal';
// import PumpRecord from "../forms/PumpRecord"
// import AddElementButton from "../../../../../lib/AddElementButton"

// export default function ShowPump(){

//     const { id } = useParams()
//     const { babies } = useUser().user
//     const navigate = useNavigate()

//     const [modalIsOpen, setModalIsOpen] = useState(false)
//     const [eventRecordToEdit, setEventRecordToEdit] = useState(null)
//     const [makeNewRecord, setMakeNewRecord] = useState(true)

//     const baby = useMemo(() => babies.find(baby => baby.id.toString() === id.toString()), [babies, id])

//     const {
//         data,
//         error,
//         loading,
//         reload
//     } = useRest(`/babies/${baby.id}/pumps?forDateRange=2weeks`, 'get', null, { useTimezone: true})

//     // NOTE: Graphs displayed on this page assume non-overlapping events


//     if(!data || loading){
//         return (
//             <div className="page">
//                 <Loader dark />
//             </div>
//         )
//     }

//     if(error){
//         return (
//             <div className="page">
//                 <h1 className="danger">Oh no! There was a problem loading your data..</h1>
//             </div>
//         )
//     }
//     const today = new Date()
//     const days = Array.from({length: 14}, (_,i) => i).map(daysBeforeToday => {
//         const date = Day.subtract(daysBeforeToday).from(today)
//         const day = new Day(date)
//         return day.toString()
//     })

//     let totalEventTimeMinutes = 0

//     const sortedEvents = data.map(eventDatum => {
//         const eventDateRange = DateRange.fromString(eventDatum.start_time, eventDatum.end_time)
//         totalEventTimeMinutes += eventDateRange.durationMinutes()
//         return {
//             dateRange: eventDateRange,
//             data: eventDatum
//         }
//     }).sort((a, b) => {
//         if(a.dateRange.startTime < b.dateRange.startTime){
//             return 1
//         }else if(a.dateRange.endTime > b.dateRange.startTime){
//             return -1 
//         }
//         return 0
//     })

//     // Events date ranges are sorted by start date, with the most
//     // recent one first. The days in the variable "days" from today 
//     // towards the past (the most recent day first). As we "reduce"
//     // through "days" we will iterate them in order, and assign 
//     // date ranges to days, keeping track of the index of the date
//     // ranges we are checking against the days. Since they are sorted
//     // in the same way, we can do a single pass through both to bucket
//     // events into days

//     let currEventIndex = 0
//     const daysToDayEventTotalMinutes = {}

//     const daysToApplicableDateRanges = days.reduce((mem, dayStr) => {
//         const dayOfConcern = Day.fromString(dayStr)
//         let totalEventMinutes = 0
//         while(currEventIndex < sortedEvents.length && !sortedEvents[currEventIndex].dateRange.isAfter(dayOfConcern)){
//             if(sortedEvents[currEventIndex].dateRange.includes(dayOfConcern)){
//                 if(mem[dayStr]){
//                     // NOTE UNSHIFT IN JS DOESN'T SEEM TO BE O(1) :(
//                     // dateRanges need to be ordred earlier->later
//                     // since these are going into charts and tables
//                     // Refactor could be using push then reversing
//                     // I don't think we have enough values to care here
//                     mem[dayStr].unshift(currEventIndex)
//                 }else{
//                     mem[dayStr] = [currEventIndex]
//                 }
//                 const eventDateRange = sortedEvents[currEventIndex].dateRange
//                 const nextDay = new Day(Day.add(1).to(dayOfConcern.startTime))
//                 const prevDay = new Day(Day.subtract(1).from(dayOfConcern.endTime))
//                 const doesEventExtendPastDay = nextDay.includes(eventDateRange)
//                 const doesEventExtendToPrevDay = prevDay.includes(eventDateRange)
//                 if(doesEventExtendPastDay){
//                     let dateRangeOfConcern = new DateRange(eventDateRange.startTime, dayOfConcern.endTime)
//                     totalEventMinutes += dateRangeOfConcern.durationMinutes()
//                 }else if(doesEventExtendToPrevDay){
//                     let dateRangeOfConcern = new DateRange(dayOfConcern.startTime, eventDateRange.endTime)
//                     totalEventMinutes += dateRangeOfConcern.durationMinutes()
//                 }else{
//                     totalEventMinutes += eventDateRange.durationMinutes()
//                 }
//             }
//             currEventIndex++
//         }
//         daysToDayEventTotalMinutes[dayStr] = totalEventMinutes
//         if(currEventIndex > sortedEvents.length){
//             return mem
//         }
//         // Do this for when a event extends over 2 days (eg a normal night's event)
//         if(currEventIndex > 0) { currEventIndex-- }
//         return mem
//     }, {})    


//     const renderCardForDay = dayStr => {
//         const shouldRender = (daysToApplicableDateRanges[dayStr] || []).length > 0
//         if(shouldRender){
//             const totalEventMinutes = daysToDayEventTotalMinutes[dayStr]
//             const eventHours = round(totalEventMinutes / 60, 2)
//             return (
//                 <Card header={getDate(Day.fromString(dayStr).startTime)}>
//                     {renderChartForDay(dayStr)}
//                     {renderTableForDay(dayStr)}
//                     <p>24 hr total: {eventHours} hrs</p>
//                 </Card>
//             )
//         }

//         return null
//     }

//     const renderChartForDay = (dayStr) => {
//         const eventDataIndices = daysToApplicableDateRanges[dayStr] || []
//         const eventRangeAndData = eventDataIndices.map(i => sortedEvents[i])//sortedEvents[eventDataIndex]
//         return <RangedEventDayChart rangeData={eventRangeAndData} dayStr={dayStr} />
//     }

//     const renderTableForDay = dayStr => {
//         const eventDataIndices = daysToApplicableDateRanges[dayStr] || []
//         const eventRangeAndData = eventDataIndices.map(i => sortedEvents[i])
//         return (
//             <table className="text-left text-sm">
//                 <thead>
//                     <tr>
//                         <th className="p-6">Start Time</th>
//                         <th className="p-6">Duration</th>
//                         <th className="p-6">Yield</th>
//                         <th classname="p-6">Units</th>
//                         <th className="p-6"></th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     { eventRangeAndData.map(eventDatum => (
//                         <tr key={eventDatum.id}>
//                             <td className="p-6">{getTime(eventDatum.data.start_time)}</td>
//                             <td className="p-6">{getTime(eventDatum.data.end_time)}</td>
//                             <td className="p-6">{round(eventDatum.dateRange.durationMinutes() / 60, 2)} hrs</td>
//                             <td className="p-6"><AiFillEdit 
//                                 style={{cursor: 'pointer'}}
//                                 onClick={() => openEditModal(eventDatum.data)}
//                             /></td>
//                         </tr>
//                         )
//                     )}
//                 </tbody>
//             </table>
//         )
//     }

//     const renderDayCards = () => {
//         return days.map(dayStr => {
//             return (
//                 <div key={dayStr} className="m-10">
//                     { renderCardForDay(dayStr) }
//                 </div>
//             )
//         })
//     }

//     const handleUpdate = () => {
//         setModalIsOpen(false)
//         setEventRecordToEdit(null)
//         reload()
//     }

//     const openEditModal = datum => {
//         setModalIsOpen(true)
//         setEventRecordToEdit(datum)
//     }

//     const openCreateModal = () => {
//         setMakeNewRecord(true)
//         setModalIsOpen(true)
//     }

//     const handleCloseModal = () => {
//         setMakeNewRecord(false)
//         setModalIsOpen(false)
//         setEventRecordToEdit(null)
//     }

//     const modalShouldBeRendered = () => {
//         return !!((modalIsOpen && eventRecordToEdit) || (modalIsOpen && makeNewRecord))
//     }


//     const renderEditModal = () => {
//         return(
//             <Modal
//                 isOpen={modalShouldBeRendered()} 
//                 onRequestClose={handleCloseModal}
//                 contentLabel="Update event record"
//             >
//                 <div>
//                     <button className="x" onClick={handleCloseModal}>Close</button>
//                     <PumpRecord babyId={baby.id} onComplete={handleUpdate} sleepRecord={eventRecordToEdit} />
//                 </div>
//             </Modal>
//         ) 
//     }

//     const numberOfDaysWithData = Object.values(daysToDayEventTotalMinutes).filter(mins => mins && mins > 0).length
//     const averageHoursPerDay = round((totalEventTimeMinutes / 60) / numberOfDaysWithData, 2)

//     return (
//         <div className="page">
//             <div className="flex space-between align-center">
//                 <button 
//                     onClick={() => navigate(`/baby-tracker/babies/${baby.id}`)}
//                     className="btn btn-primary"     
//                 >Back</button>
//                 <div className="flex flex-col align-center flex-center">
//                     <p className="text-bottom text-lg bold mt-0">Add Record</p>
//                     <AddElementButton onClick={openCreateModal} center className="mt-0"/>
//                 </div>
//             </div>
//             { numberOfDaysWithData > 0 && <h2 className="mt-30">Average {averageHoursPerDay} hrs/day</h2> }
//             <p className="text-sm">Coming soon: Avg bedtime</p>
//             { renderDayCards() }
//             <button 
//                 onClick={() => navigate(`/baby-tracker/babies/${baby.id}`)}
//                 className="btn btn-primary"     
//             >Back</button>
//             { renderEditModal() }
//         </div>
//     )
// }