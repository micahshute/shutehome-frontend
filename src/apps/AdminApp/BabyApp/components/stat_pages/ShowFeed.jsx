import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useRest } from "../../../../../hooks/useRest"
import { useUser } from "../../../../../hooks/useUser"
import Card from "../../../../../lib/Card"
import { DateMath, Day } from "../../../../../lib/helpers/time/dateMath"
import { getDate, getTime, round } from "../../../../../lib/helpers/helpers"
import FeedDayChart from "../charts/FeedDayChart"
import { AiFillEdit } from "react-icons/ai"
import Modal from 'react-modal';
import FeedRecord from "../forms/FeedRecord";
import AddElementButton from "../../../../../lib/AddElementButton";
import FeedStatsChart from "../charts/FeedOverviewChart"
import Loader from "../../../../../lib/Loader"


export default function ShowFeed(){

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [makeNewRecord, setMakeNewRecord] = useState(false)
    const [feedRecordToEdit, setFeedRecordToEdit] = useState(null)

    const navigate = useNavigate()
    const { id } = useParams()
    const { babies } = useUser().user
    const baby = useMemo(() => babies.find(baby => baby.id.toString() === id.toString()), [babies, id])
    const { 
        data,
        error,
        loading,
        reload,
    } = useRest(`/babies/${baby.id}/feedings?forDateRange=2weeks`, 'get', null, {useTimezone: true})

    const {
        data: statData,
        error: statError,
        loading: statLoading,
        reload: statReload
    } = useRest(`/babies/${baby.id}/feedings/stats`, 'get', null, { useTimezone: true })

    const feedByDay = (feedData) => {
        if(!feedData){
            return []
        }

        const feedDataBuckets = feedData.reduce((mem, feedDatum) => {
            const feedTime = new Date(feedDatum.time)
            const day = new Day(feedTime)
            if(mem[day.toString()]){
                mem[day.toString()].push(feedDatum)
            }else{
                mem[day.toString()] = [feedDatum]
            }
            return mem
        }, {})

        return Object.values(feedDataBuckets).map(feedsByDay => {
            return {
                day: DateMath.beginningOfDay(new Date(feedsByDay[0].time)),
                feedData: feedsByDay
            }
        }).sort((a,b) => {
            if(a.day > b.day) return -1
            if(a.day < b.day) return 1
            return 0
        })
    }

    const handleUpdate = () => {
        setModalIsOpen(false)
        setFeedRecordToEdit(null)
        reload()
        statReload()
    }

    const openEditModal = (feedRecord) => {
        setModalIsOpen(true)
        setFeedRecordToEdit(feedRecord)
    }

    const openCreateModal = () => {
        setMakeNewRecord(true)
        setModalIsOpen(true)
    }

    const handleCloseModal = () => {
        setMakeNewRecord(false)
        setModalIsOpen(false)
        setFeedRecordToEdit(null)
    }
    
    const modalShouldBeRendered = () => {
        return (modalIsOpen && feedRecordToEdit) || (modalIsOpen && makeNewRecord)
    }

    const renderEditModal = () => {
        return (
            <Modal 
                isOpen={modalShouldBeRendered()}
                onRequestClose={handleCloseModal}
                contentLabel="Update feed record"
            >
                <div className="ml-30 mt-30 mr-30">
                    <button className="x" onClick={handleCloseModal}>Close</button>
                    <FeedRecord babyId={baby.id} onComplete={handleUpdate} feedRecord={feedRecordToEdit} />
                </div>
            </Modal>
        )
    }


    const renderFeedRows = (dataForDay) => {
        return dataForDay.map(datum => {
            return (
                <tr key={datum.id}>
                    <td className="text-center">{getTime(datum.time)}</td>
                    <td className="text-center">{datum.quantity}</td>
                    <td className="text-center">{datum.quantity_type === 'time' ? 'mins' : 'oz'}</td>
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

    const renderFeedCardsByDay = () => {
        const feedDataByDay = feedByDay(data)
        return feedDataByDay.map(feedDataForDay => {

            const totalFeedings = feedDataForDay.feedData.length
            let totalFormulaAmount = 0
            let totalBreastmilkAmount = 0
            const totalAmount = feedDataForDay.feedData.reduce((mem, fdata) => {
                if(fdata.quantity_type === 'amount'){
                    mem += fdata.quantity
                    if(fdata.food_type === 'formula') {
                        totalFormulaAmount += fdata.quantity
                    }else if(fdata.food_type === 'bottle_breast'){
                        totalBreastmilkAmount += fdata.quantity
                    }
                }
                return mem
            }, 0)
            const totalTime = feedDataForDay.feedData.reduce((mem, fdata) => {
                if(fdata.quantity_type === 'time'){
                    mem += fdata.quantity
                }
                return mem
            }, 0)

            return(
                <div key={feedDataForDay.day.toString()} className="w-85 m-10">
                    <Card header={getDate(feedDataForDay.day.toString())}>
                        <>
                            <div className="flex space-between flex-wrap align-start width-full"> 
                                <table className="text-left text-sm">
                                    <thead>
                                        <tr>
                                            <th className="p-10">Time</th>
                                            <th className="p-10">Quantity</th>
                                            <th className="p-10">Unit</th>
                                            <th className="p-4">Update</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {renderFeedRows(feedDataForDay.feedData)}
                                    </tbody>
                                </table> 
                                <FeedDayChart 
                                    feedData={feedDataForDay.feedData} 
                                    width={window.innerWidth > 1000 ? '70%' : '100%' }
                                    showBreastfeed={totalTime > 0}
                                    showBottle={totalAmount > 0}
                                />
                            </div>
                            { totalAmount > 0 && (<p><strong>Total Pumped Breastmilk: {totalBreastmilkAmount} Oz</strong></p>) }
                            { totalAmount > 0 && (<p><strong>Total Formula: {totalFormulaAmount} Oz</strong></p>) }
                            { totalAmount > 0 && (<p style={{fontSize: '1.5em'}}><strong>Total Amount: {totalAmount} Oz</strong></p>) }
                            { totalTime > 0 && (<p style={{fontSize: '1.5em'}}><strong>Total Time: {totalTime} mins</strong></p>)}
                            <p><strong>Fed {totalFeedings} times</strong></p>
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
                        <FeedStatsChart feedStatsData={statData} />
                        <div>
                            { statData.any_times_exist && <p className="text-lg">Average Breastfeed Time: {round(statData.average_time_per_day, 2)} mins</p>}
                            { statData.any_times_exist && <p className="text-lg">Time StdDev: {round(statData.time_std, 2)} mins</p>}
                            { statData.any_volumes_exist && <p className="text-lg">Average Feed Volume: {round(statData.average_volume_per_day, 2)} oz</p>}
                            { statData.any_volumes_exist && <p className="text-lg">Vol. StdDev: {round(statData.volume_std, 2)} oz</p>}
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
            <h1 className="text-center">{baby.name}'s Eat Record</h1>
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
                { renderFeedCardsByDay() }

            </div>
            <button 
                onClick={() => navigate(`/baby-tracker/babies/${baby.id}`)}
                className="btn btn-primary"     
            >Back</button>
            { renderEditModal() }
        </div>
    )
}