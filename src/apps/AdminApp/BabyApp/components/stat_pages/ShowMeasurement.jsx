import { useMemo } from "react"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useRest } from "../../../../../hooks/useRest"
import { useUser } from "../../../../../hooks/useUser"
import AddElementButton from "../../../../../lib/AddElementButton"
import Card from "../../../../../lib/Card"
import { getAgeStrAtDate, getDate, getFullDate, getTime } from "../../../../../lib/helpers/helpers"
import Loader from "../../../../../lib/Loader"
import { AiFillEdit } from "react-icons/ai"
import MeasurementRecord from "../forms/MeasurementRecord"
import Modal from 'react-modal';
import MeasurementChart from "../charts/MeasurementChart"

export default function ShowMeasurement(){

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [makeNewRecord, setMakeNewRecord] = useState(false)
    const [recordToEdit, setRecordToEdit] = useState(null)

    const navigate = useNavigate()
    const { id } = useParams()
    const { babies } = useUser().user
    const baby = useMemo(() => babies.find(baby => baby.id.toString() === id.toString()), [babies, id])
    const { 
        data,
        error,
        loading,
        reload,
    } = useRest(`/babies/${baby.id}/measurements?forDateRange=12weeks`, 'get', null, {useTimezone: true})


    const renderDatapoint = datum => {
        return (
            <tr>
                <td className="text-center">{getDate(datum.time)}</td>
                <td className="text-center">{datum.category}</td>
                <td className="text-center">{datum.value}</td>
                <td className="text-center"><AiFillEdit 
                    style={{cursor: 'pointer'}}
                    onClick={() => openEditModal(datum)}
                /></td>
            </tr>
        )
    }


    const renderDatapoints = (sortedData) => {
        return (
            <Card>
                <table>
                    <thead>
                        <tr>
                            <th className="p-10">Date</th>
                            <th className="p-10">Category</th>
                            <th className="p-10">Value</th>
                            <th className="p-4">Manage</th>
                        </tr>

                    </thead>
                    <tbody>
                        { sortedData.map(datum => {
                            return renderDatapoint(datum)
                        })}
                    </tbody>
                </table>
            </Card>
        )
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
                contentLabel="Update measurement record"
            >
                <div>
                    <button className="x" onClick={handleCloseModal}>Close</button>
                    <MeasurementRecord babyId={baby.id} onComplete={handleUpdate} measurementRecord={recordToEdit} />
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

    const sortedMeasurementData = data.map(datum => ({
        ...datum,
        time: new Date(datum.time)
    })).sort((a,b) => {
        if(a.time > b.time){
            return 1;
        }else if(a.time < b.time){
            return -1;
        }
        return 0
    })

    // console.log('rendering')
    // console.log(recordToEdit)

    return (
        <div className="page">
            <h1>{baby.name}'s Measurements</h1>
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
                <Card>
                    <MeasurementChart sortedMeasurementData={sortedMeasurementData}/>
                </Card>
            </div>
            <div className="mt-30">
                { renderDatapoints(sortedMeasurementData) }
            </div>
            { renderEditModal() }
            <div className="flex space-between align-center mt-30">
                <button 
                    onClick={() => navigate(`/baby-tracker/babies/${baby.id}`)}
                    className="btn btn-primary"     
                >Back</button>
            </div>
        </div>
    )
}