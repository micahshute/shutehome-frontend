import { useMemo } from "react"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useRest } from "../../../../../hooks/useRest"
import { useUser } from "../../../../../hooks/useUser"
import AddElementButton from "../../../../../lib/AddElementButton"
import Card from "../../../../../lib/Card"
import { getAgeStrAtDate, getFullDate } from "../../../../../lib/helpers/helpers"
import Loader from "../../../../../lib/Loader"
import { AiFillEdit } from "react-icons/ai"
import EventRecord from "../forms/EventRecord"
import Modal from 'react-modal';

export default function ShowEvent(){

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [makeNewRecord, setMakeNewRecord] = useState(false)
    const [eventRecordToEdit, setEventRecordToEdit] = useState(null)

    const navigate = useNavigate()
    const { id } = useParams()
    const { babies } = useUser().user
    const baby = useMemo(() => babies.find(baby => baby.id.toString() === id.toString()), [babies, id])
    const { 
        data,
        error,
        loading,
        reload,
    } = useRest(`/babies/${baby.id}/events`, 'get', null, {useTimezone: true})

    const renderEvent = (event) => {
        const cardHeader = (
            <>
                <span className="p-6 float-left"><AiFillEdit 
                    style={{cursor: 'pointer'}}
                    onClick={() => openEditModal(event)}
                /></span>
                <h2>{event.name} - {getFullDate(event.time)}</h2>
                
            </>
        )
        return (
            <div className="mt-30" key={event.id}>
                <Card header={cardHeader}>
                    <div>
                        <h2>Holden was {getAgeStrAtDate(new Date(baby.birthdate), new Date(event.time))} old</h2>
                    </div>
                    {
                        event.notes && event.notes.length > 0 && (
                            <>
                                <label>Notes</label>
                                <p className="italic">{event.notes}</p> 
                            </>
                        )
                    }
                </Card>
            </div>
        )
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
                    <EventRecord babyId={baby.id} onComplete={handleUpdate} eventRecord={eventRecordToEdit} />
                </div>
            </Modal>
        ) 
    }

    if(loading){
        return (
            <div className="page">
                <Loader />
            </div>
        )
    }

    if(error){
        return (
            <div className="page">
                <p className="danger">There was an error loading your events</p>
            </div>
        )
    }

    if(!data) { return null }

    const sortedData = data.sort((a,b) => {
        if(a.time < b.time){
            return 1
        }else if(a.time > b.time){
            return -1
        }
        return 0
    })

    return (
        <div className="page">
            <h1>{baby.name}'s Events</h1>
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
            <div className="mt-30">
                { sortedData.map(event => renderEvent(event))}
            </div>
            { renderEditModal() }
        </div>
    )
}