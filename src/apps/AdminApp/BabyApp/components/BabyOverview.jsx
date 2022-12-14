import { useMemo, useState } from "react";
import AddElementButton from "../../../../lib/AddElementButton";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../../hooks/useUser";
import { getAgeStr, getDate, getFormattedDateTime, getHeight, getHoroscopeSign, getTime, getTimeDiff, getWeight } from "../../../../lib/helpers/helpers";
import Card from "../../../../lib/Card";
import { useRest } from "../../../../hooks/useRest";
import Loader from "../../../../lib/Loader";
import Modal from 'react-modal';
import SleepRecord from "./forms/SleepRecord";
import FeedRecord from "./forms/FeedRecord";
import DiaperRecord from './forms/DiaperRecord'
import TummyTimeRecord from './forms/TummyTimeRecord'
import EventRecord from './forms/EventRecord'
import MeasurementRecord from "./forms/MeasurementRecord";
import PumpRecord from "./forms/PumpRecord";



export default function BabyOvervirew(){
    const { id } = useParams()
    const { babies } = useUser().user
    const baby = useMemo(() => babies.find(baby => baby.id.toString() === id.toString()), [babies, id])
    const [addSleepModalIsOpen, setAddSleepModalIsOpen] = useState(false)
    const [addFeedModalIsOpen, setAddFeedModalIsOpen] = useState(false)
    const [addDiaperModalIsOpen, setAddDiaperModalIsOpen] = useState(false)
    const [addTummyTimeModalIsOpen, setAddTummyTimeModalIsOpen] = useState(false)
    const [addPumpModalIsOpen, setAddPumpModalIsOpen] = useState(false)
    const [addMeasurementModalIsOpen, setAddMeasurementModalIsOpen] = useState(false)
    const [addEventModalIsOpen, setAddEventModalIsOpen] = useState(false)

    const navigate = useNavigate()
    const { 
        data: sleepData,
        error: sleepError,
        loading: sleepLoading, 
        reload: reloadSleepData,
    } = useRest(`/babies/${baby.id}/sleeps?forDateRange=day`, 'get', null, { useTimezone: true})

    const { 
        data: feedData,
        error: feedError,
        loading: feedLoading, 
        reload: reloadFeedData,
    } = useRest(`/babies/${baby.id}/feedings?forDateRange=day`, 'get', null, { useTimezone: true })

    const {
        data: diaperData,
        error: diaperError,
        loading: diaperLoading,
        reload: reloadDiaperData
    } = useRest(`/babies/${baby.id}/diapers?forDateRange=day`, 'get', null, { useTimezone: true })

    const {
        data: tummyTimeData,
        error: tummyTimeError,
        loading: tummyTimeLoading,
        reload: reloadTummyTimeData
    } = useRest(`/babies/${baby.id}/tummy_times?forDateRange=day`, 'get', null, {useTimezone: true})

    const {
        data: pumpData,
        error: pumpError,
        loading: pumpLoading,
        reload: reloadPumpData
    } = useRest(`/babies/${baby.id}/pumps?forDateRange=day`, 'get', null, {useTimezone: true})

    const {
        data: measurementData,
        error: measurementError,
        loading: measurementLoading,
        reload: reloadMeasurementData
    } = useRest(`/babies/${baby.id}/measurements?forDateRange=day`, 'get', null, {useTimezone: true})

    const {
        data: eventData,
        error: eventError,
        loading: eventLoading,
        reload: reloadEventData
    } = useRest(`/babies/${baby.id}/events?forDateRange=day`, 'get', null, { useTimezone: true })

    if(!baby){
        return <Navigate to="/" />
    }

    const renderSummaryData = (data, error, loading, getElement) => {
        if(loading) return <Loader dark/>
        if(error) return <p>Error loading</p>
        if(data && data.length === 0) return <p>No recent records</p>
        if(data) {
            return (
                <table className="text-left text-sm">
                    <tbody>
                        { data.map(event => {
                            return getElement(event)
                          })
                        }
                        <tr>
                        </tr>
                    </tbody>
                </table>
            )
        }

    }

    const renderSleepTimes = () => {
        const getSleepElement = (sleepEvent) => (
            <tr className="divided-tr" key={sleepEvent.start_time}>
                <th>{getDate(sleepEvent.start_time)}</th>
                <td className="pl-10">{getTime(sleepEvent.start_time)}</td>
                <th className="pl-10">For</th>
                <td className="pl-10">{getTimeDiff(sleepEvent.start_time, sleepEvent.end_time)}</td>
            </tr>
        )

        return renderSummaryData(sleepData, sleepError, sleepLoading, getSleepElement)
    }

    const renderFeedings = () => {
        const getFeedElement = (feedEvent) => {
            const quantityType = feedEvent.quantity_type
            let quantityDescriptor = '??';
            let quantityUnit = '??'
            if(quantityType === 'time'){
                quantityDescriptor = 'For'
                quantityUnit = 'mins'
            }else if(quantityType === 'amount'){
                quantityDescriptor = 'Amt'
                quantityUnit = 'oz'
            }

            const quantity = `${feedEvent.quantity} ${quantityUnit}`

            return (
                <tr className="divided-tr">
                    <th>{getDate(feedEvent.time)}</th>
                    <td className="pl-10">{getTime(feedEvent.time)}</td>
                    <th className="pl-10">{quantityDescriptor}</th>
                    <td className="pl-10">{quantity}</td>
                </tr>
            )
        }

        return renderSummaryData(feedData, feedError, feedLoading, getFeedElement)
    }
    
    const renderDiapers = () => {
        const getDiaperElement = (diaperData) => {
            let content;
            if(diaperData.has_liquid){
                content = diaperData.has_solid ? "Pee and Poop" : "Pee"
            }else if(diaperData.has_solid){
                content = "Poop"
            }else{
                content = "Clean"
            }
            return (
                <tr className="divided-tr" key={diaperData.id}>
                    <th>{getDate(diaperData.time)}</th>
                    <td className="pl-10">{getTime(diaperData.time)}</td>
                    <th className="pl-10">Had:</th>
                    <td className="pl-10">{content}</td>
                </tr>
            )
        }

        return renderSummaryData(diaperData, diaperError, diaperLoading, getDiaperElement)
    }

    const renderTummyTimes = () => {
        const getTummyTimeElement = (tummyTimeDatum) => {
            const duration = getTimeDiff(tummyTimeDatum.start_time, tummyTimeDatum.end_time)
            return (
                <tr className="divided-tr" key={tummyTimeDatum.id}>
                    <th>{getDate(tummyTimeDatum.end_time)}</th>
                    <td className="pl-10">{getTime(tummyTimeDatum.end_time)}</td>
                    <th className="pl-10">Length</th>
                    <td className="pl-10">{duration}</td>
                </tr>
            )
        }

        return renderSummaryData(tummyTimeData, tummyTimeError, tummyTimeLoading, getTummyTimeElement)
    }

    const renderMeasurements = () => {
        const getMeasurementElement = (measurementDatum) => {
            const weight = measurementDatum.category === 'weight' ? measurementDatum.value : null
            const height = measurementDatum.category === 'height' ? measurementDatum.value : null
            const headCircumference = measurementDatum.category === 'head_circumference' ? measurementDatum.value : null
            const unconventional = !weight && !height && !headCircumference
            return (
                <tr className="divided-tr" key={measurementDatum.id}>
                    <th>{getDate(measurementDatum.time)}</th>
                    {weight && <th className="pl-10">Weight</th> }
                    {weight && <td className="pl-10">{getWeight(weight)}</td> }
                    {height && <th className="pl-10">Height</th> }
                    {height && <td className="pl-10">{getHeight(height)}</td> }
                    {headCircumference && <th className="pl-10">Head Cir</th> }
                    {headCircumference && <td className="pl-10">{getHeight(headCircumference)}</td> }
                    {unconventional&& <th className="pl-10">{measurementDatum.category}</th> }
                    {unconventional && <td className="pl-10">{measurementDatum.value}</td> }
                </tr>
            )
        }

        return renderSummaryData(measurementData, measurementError, measurementLoading, getMeasurementElement)
    }

    const renderPumps = () => {
        const getPumpElement = (pumpDatum) => {
            return (
                <tr className="divided-tr" key={pumpDatum.id}>
                    <th className="pl-10">{getDate(pumpDatum.start_time)}</th>
                    <td className="pl-10">{getTimeDiff(pumpDatum.start_time, pumpDatum.end_time)}</td>
                    <td className="pl-10">{pumpDatum.yield} {pumpDatum.units}</td>
                </tr>
            )
        }

        return renderSummaryData(pumpData, pumpError, pumpLoading, getPumpElement)
    }

    const renderEvents = () => {
        const getEventElement = (eventDatum) => {
            return (
                <tr className="divided-tr" key={eventDatum.id}>
                    <th className="pl-10">{getDate(eventDatum.time)}</th>
                    <td className="pl-10">{eventDatum.name}</td>
                </tr>
            )
        }

        return renderSummaryData(eventData, eventError, eventLoading, getEventElement)
    }

    const handleAddSleep = () => {
        setAddSleepModalIsOpen(false)
        reloadSleepData()
    }

    const handleGotoSleepModal = e => {
        e.stopPropagation()
        setAddSleepModalIsOpen(true)
    }

    const handleAddFeed = () => {
        setAddFeedModalIsOpen(false)
        reloadFeedData()
    }

    const handleGotoFeedModal = e => {
        e.stopPropagation()
        setAddFeedModalIsOpen(true)
    }

    const handleAddDiaper = () => {
        setAddDiaperModalIsOpen(false)
        reloadDiaperData()
    }

    const handleGoToDiaperModal = e => {
        e.stopPropagation()
        setAddDiaperModalIsOpen(true)
    }

    const handleAddTummyTime = () => {
        setAddTummyTimeModalIsOpen(false)
        reloadTummyTimeData()
    }

    const handleGoToTummyTimeModal = e => {
        e.stopPropagation()
        setAddTummyTimeModalIsOpen(true)
    }

    const handleAddPump = () => {
        setAddPumpModalIsOpen(false)
        reloadPumpData()
    }

    const handleGoToPumpModal = e => {
        e.stopPropagation()
        setAddPumpModalIsOpen(true)
    }

    const handleAddMeasurement = () => {
        setAddMeasurementModalIsOpen(false)
        reloadMeasurementData()
    }

    const handleGoToMeasurementModal = e => {
        e.stopPropagation()
        setAddMeasurementModalIsOpen(true)
    }

    const handleAddEvent = () => {
        setAddEventModalIsOpen(false)
        reloadEventData()
    }

    const handleGoToEventModal = e => {
        e.stopPropagation()
        setAddEventModalIsOpen(true)
    }

    return (
        <div className="page">
            <h1 className="baby-overview-hdr">{baby.name}'s File</h1>

            <div className="flex space-around">
                <table className="baby-summary-table">
                    <caption className="table-header">
                        Overview
                    </caption>
                    <tbody className="text-left">
                        <tr>
                            <th>Age</th>
                            <td>{getAgeStr(baby.birthdate)}</td>
                        </tr>
                        <tr>
                            <th>Current Weight</th>
                            <td>{getWeight(baby.weight)}</td>
                        </tr>
                        <tr>
                            <th>Current Height</th>
                            <td>{getHeight(baby.height)}</td>
                        </tr>
                        <tr>
                            <th>Blood Type</th>
                            <td>{baby.blood_type}</td>
                        </tr>
                    </tbody>
                </table>
                <table className="baby-summary-table">
                    <caption className="table-header">
                        Birth Data
                    </caption>
                    <tbody className="text-left">
                        <tr>
                            <th>Born</th>
                            <td>{getFormattedDateTime(baby.birthdate) } { getHoroscopeSign(baby.birthdate) }</td>
                        </tr>
                        <tr>
                            <th>Birth Weight</th>
                            <td>{getWeight(baby.birthweight)}</td>
                        </tr>
                        <tr>
                            <th>Birth Height</th>
                            <td>{getHeight(baby.birthlength)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex flex-start mt-30 flex-wrap align-stretch">
                <div className="flex flex-col m-10">
                    <Card 
                        onClick={() => navigate(`/baby-tracker/babies/${baby.id}/sleeps`)} 
                        headerComponent={<h2 className="text-center">Sleep</h2>}
                    >
                        <div className="ph-20 w-175 text-center">
                            <div>
                                { renderSleepTimes() }
                            </div>
                            <div className="text-center">
                                <AddElementButton onClick={handleGotoSleepModal} center />
                            </div>
                        </div>
                    </Card>
                    <Modal 
                        isOpen={addSleepModalIsOpen}
                        onRequestClose={() => setAddSleepModalIsOpen(false)}
                        contentLabel="Add sleep record"
                    >
                        <div className="ml-30 mt-30 mr-30">
                            <button className="x" onClick={() => setAddSleepModalIsOpen(false)}>Close</button>
                            <SleepRecord babyId={baby.id} onComplete={handleAddSleep}/>
                        </div>
                    </Modal>
                </div>
                <div className="flex flex-col m-10">
                    <Card 
                        headerComponent={<h2 className="text-center">Eat</h2>}
                        onClick={() => navigate(`/baby-tracker/babies/${baby.id}/feedings`)} 
                    >
                        <div className="ph-20 w-175 text-center">
                            <div>
                                { renderFeedings() }
                            </div>
                            <div className="text-center">
                                <AddElementButton onClick={handleGotoFeedModal} center />
                            </div>
                        </div>
                    </Card>
                    <Modal 
                        isOpen={addFeedModalIsOpen}
                        onRequestClose={() => setAddFeedModalIsOpen(false)}
                        contentLabel="Add feed record"
                    >
                        <div className="ml-30 mt-30 mr-30">
                            <button className="x" onClick={() => setAddFeedModalIsOpen(false)}>Close</button>
                            <FeedRecord babyId={baby.id} onComplete={handleAddFeed}/>
                        </div>
                    </Modal>
                </div>
                <div className="flex flex-col m-10">
                    <Card 
                        headerComponent={<h2 className="text-center">Diaper</h2>}
                        onClick={() => navigate(`/baby-tracker/babies/${baby.id}/diapers`)} 
                    >
                        <div className="ph-20 w-175 text-center">
                            <div>
                                { renderDiapers() }
                            </div>
                            <div className="text-center">
                                <AddElementButton onClick={handleGoToDiaperModal} center />
                            </div>
                        </div>
                    </Card>
                    <Modal 
                        isOpen={addDiaperModalIsOpen}
                        onRequestClose={() => setAddDiaperModalIsOpen(false)}
                        contentLabel="Add diaper record"
                    >
                        <div className="ml-30 mt-30 mr-30">
                            <button className="x" onClick={() => setAddDiaperModalIsOpen(false)}>Close</button>
                            <DiaperRecord babyId={baby.id} onComplete={handleAddDiaper}/>
                        </div>
                    </Modal>
                </div>
                <div className="flex flex-col m-10">
                    <Card 
                        headerComponent={<h2 className="text-center">Tummy Time</h2>}
                        onClick={() => navigate(`/baby-tracker/babies/${baby.id}/tummy-times`)} 
                    >
                        <div className="ph-20 w-175 text-center">
                            <div>
                                { renderTummyTimes() }
                            </div>
                            <div className="text-center">
                                <AddElementButton onClick={handleGoToTummyTimeModal} center />
                            </div>
                        </div>
                    </Card>
                    <Modal 
                        isOpen={addTummyTimeModalIsOpen}
                        onRequestClose={() => setAddTummyTimeModalIsOpen(false)}
                        contentLabel="Add diaper record"
                    >
                        <div className="ml-30 mt-30 mr-30">
                            <button className="x" onClick={() => setAddTummyTimeModalIsOpen(false)}>Close</button>
                            <TummyTimeRecord babyId={baby.id} onComplete={handleAddTummyTime}/>
                        </div>
                    </Modal>
                </div>
                <div className="flex flex-col m-10">
                    <Card 
                        headerComponent={<h2 className="text-center">Pump</h2>}
                        onClick={() => navigate(`/baby-tracker/babies/${baby.id}/pumps`)} 
                    >
                        <div className="ph-20 w-175 text-center">
                            <div>
                                { renderPumps() }
                            </div>
                            <div className="text-center">
                                <AddElementButton onClick={handleGoToPumpModal} center />
                            </div>
                        </div>
                    </Card>
                    <Modal 
                        isOpen={addPumpModalIsOpen}
                        onRequestClose={() => setAddPumpModalIsOpen(false)}
                        contentLabel="Add pump record"
                    >
                        <div className="ml-30 mt-30 mr-30">
                            <button className="x" onClick={() => setAddPumpModalIsOpen(false)}>Close</button>
                            <PumpRecord babyId={baby.id} onComplete={handleAddPump}/>
                        </div>
                    </Modal>
                </div>
                <div className="flex flex-col m-10">
                    <Card 
                        headerComponent={<h2 className="text-center">Measurement</h2>}
                        onClick={() => navigate(`/baby-tracker/babies/${baby.id}/measurements`)} 
                    >
                        <div className="ph-20 w-175 text-center">
                            <div>
                                { renderMeasurements() }
                            </div>
                            <div className="text-center">
                                <AddElementButton onClick={handleGoToMeasurementModal} center />
                            </div>
                        </div>
                    </Card>
                    <Modal 
                        isOpen={addMeasurementModalIsOpen}
                        onRequestClose={() => setAddMeasurementModalIsOpen(false)}
                        contentLabel="Add measurement record"
                    >
                        <div className="ml-30 mt-30 mr-30">
                            <button className="x" onClick={() => setAddMeasurementModalIsOpen(false)}>Close</button>
                            <MeasurementRecord babyId={baby.id} onComplete={handleAddMeasurement}/>
                        </div>
                    </Modal>
                </div>
                <div className="flex flex-col m-10">
                    <Card 
                        headerComponent={<h2 className="text-center">Event</h2>}
                        onClick={() => navigate(`/baby-tracker/babies/${baby.id}/events`)} 
                    >
                        <div className="ph-20 w-175 text-center">
                            <div>
                                { renderEvents() }
                            </div>
                            <div className="text-center">
                                <AddElementButton onClick={handleGoToEventModal} center />
                            </div>
                        </div>
                    </Card>
                    <Modal 
                        isOpen={addEventModalIsOpen}
                        onRequestClose={() => setAddEventModalIsOpen(false)}
                        contentLabel="Add event record"
                    >
                        <div className="ml-30 mt-30 mr-30">
                            <button className="x" onClick={() => setAddEventModalIsOpen(false)}>Close</button>
                            <EventRecord babyId={baby.id} onComplete={handleAddEvent}/>
                        </div>
                    </Modal>
                </div>
            </div>
        </div>
    )
}