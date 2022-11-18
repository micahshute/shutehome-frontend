import { useMemo, useState } from "react";
import AddElementButton from "../../../../lib/AddElementButton";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../../../hooks/useUser";
import { getAgeStr, getDate, getFormattedDateTime, getHeight, getHoroscopeSign, getTime, getTimeDiff, getWeight } from "../../../../lib/helpers";
import Card from "../../../../lib/Card";
import { useRest } from "../../../../hooks/useRest";
import Loader from "../../../../lib/Loader";
import SleepRecord from "./SleepRecord";
import Modal from 'react-modal';
import FeedRecord from "./FeedRecord";



export default function BabyOvervirew(){
    const { id } = useParams()
    const { babies } = useUser().user
    const baby = useMemo(() => babies.find(baby => baby.id.toString() === id.toString()), [babies, id])
    const [addSleepModalIsOpen, setAddSleepModalIsOpen] = useState(false)
    const [addFeedModalIsOpen, setAddFeedModalIsOpen] = useState(false)
    const navigate = useNavigate()
    const { 
        data: sleepData,
        error: sleepError,
        loading: sleepLoading, 
        reload: reloadSleepData,
    } = useRest(`/babies/${baby.id}/sleeps?forDateRange=day`)

    const { 
        data: feedData,
        error: feedError,
        loading: feedLoading, 
        reload: reloadFeedData,
    } = useRest(`/babies/${baby.id}/feedings?forDateRange=day`)

    if(!baby){
        return <Navigate to="/" />
    }

    const renderSummaryData = (data, error, loading, getElement) => {
        if(loading) return <Loader dark/>
        if(error) return <p>Error loading</p>
        if(data && data.length === 0) return <p>No records found</p>
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
                            <td>{getHeight(baby.birthweight)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex flex-start mt-30 flex-wrap align-stretch">
                <div className="flex flex-col m-10">
                    <Card 
                        onClick={() => navigate(`/baby-tracker/babies/${baby.id}/sleep`)} 
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
                                { renderSleepTimes() }
                            </div>
                            <div className="text-center">
                                <AddElementButton onClick={() => {}} center />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="flex flex-col m-10">
                    <Card 
                        headerComponent={<h2 className="text-center">Tummy Time</h2>}
                        onClick={() => navigate(`/baby-tracker/babies/${baby.id}/tummy-times`)} 
                    >
                        <div className="ph-20 w-175 text-center">
                            <div>
                                { renderSleepTimes() }
                            </div>
                            <div className="text-center">
                                <AddElementButton onClick={() => {}} center />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="flex flex-col m-10">
                    <Card 
                        headerComponent={<h2 className="text-center">Measurement</h2>}
                        onClick={() => navigate(`/baby-tracker/babies/${baby.id}/measurements`)} 
                    >
                        <div className="ph-20 w-175 text-center">
                            <div>
                                { renderSleepTimes() }
                            </div>
                            <div className="text-center">
                                <AddElementButton onClick={() => {}} center />
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="flex flex-col m-10">
                    <Card 
                        headerComponent={<h2 className="text-center">Event</h2>}
                        onClick={() => navigate(`/baby-tracker/babies/${baby.id}/events`)} 
                    >
                        <div className="ph-20 w-175 text-center">
                            <div>
                                { renderSleepTimes() }
                            </div>
                            <div className="text-center">
                                <AddElementButton onClick={() => {}} center />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}