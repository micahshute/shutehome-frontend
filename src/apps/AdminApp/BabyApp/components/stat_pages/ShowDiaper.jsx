import { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { useRest } from "../../../../../hooks/useRest"
import { useUser } from "../../../../../hooks/useUser"
import AddElementButton from "../../../../../lib/AddElementButton"
import Modal from 'react-modal';
import Loader from "../../../../../lib/Loader"
import { AiFillEdit } from "react-icons/ai"
import DiaperRecord from "../forms/DiaperRecord"
import { getDate, getTime, sortBy } from "../../../../../lib/helpers/helpers"
import { Day } from "../../../../../lib/helpers/time/dateMath"
import Card from "../../../../../lib/Card"
import BackButton from "../../../../../lib/BackButton"

export default function ShowDiaper(){
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [makeNewRecord, setMakeNewRecord] = useState(false)
    const [recordToEdit, setRecordToEdit] = useState(null)

    const { id } = useParams()
    const { babies } = useUser().user
    const baby = useMemo(() => babies.find(baby => baby.id.toString() === id.toString()), [babies, id])
    const { 
        data,
        error,
        loading,
        reload,
    } = useRest(`/babies/${baby.id}/diapers?forDateRange=2weeks`, 'get', null, {useTimezone: true})

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
                contentLabel="Update event record"
            >
                <div>
                    <button className="x" onClick={handleCloseModal}>Close</button>
                    <DiaperRecord babyId={baby.id} onComplete={handleUpdate} diaperRecord={recordToEdit} />
                </div>
            </Modal>
        ) 
    }

    const renderCardRow = datum => {
        const { has_liquid, has_solid } = datum
        let contents
        if(has_liquid) {
            if(has_solid){
                contents = 'Pee & Poo'
            }else{
                contents = 'Pee'
            }
        }else if(has_solid){
            contents = 'Poo'
        }else{
            contents = 'Empty'
        }

        return (
            <tr key={datum.id}>
                <td className="text-center">{getTime(datum.time)}</td>
                <td className="text-center">{contents}</td>
                <td className="text-center">{datum.color}</td>
                <td className="text-center"><AiFillEdit
                    style={{cursor: 'pointer'}} 
                    onClick={() => openEditModal(datum)}
                /></td>
            </tr>
        )

    }

    const renderDataCard = dayData => {
        return (
            <div className="mt-30" key={dayData[0].time}>
                <Card header={getDate(dayData[0].time)}>
                    <table>
                        <thead>
                            <tr>
                                <th className="p-10">Time</th>
                                <th className="p-10">Contents</th>
                                <th className="p-10">Color</th>
                                <th className="p-4">Manage</th>
                            </tr>
                        </thead>
                        <tbody>
                            { sortBy(dayData, 'time').map(datum => renderCardRow(datum)) }
                        </tbody>
                    </table>
                </Card>
            </div>
        )
    }

    const renderDataCards = (dataGroupedByDay) => {
        return dataGroupedByDay.map(dayData => renderDataCard(dayData))
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

    const dataGroupedByDay = Object.values(data.reduce((mem, datum) => {
        const datumDay = new Day(new Date(datum.time))
        const dayKey = datumDay.toString()
        if(mem[dayKey]){
            mem[dayKey].push(datum)
        }else{
            mem[dayKey] = [datum]
        }
        return mem
    }, {})).sort((dayData1, dayData2) => {
        const date1 = new Date(dayData1[0].time)
        const date2 = new Date(dayData2[0].time)
        if(date1 < date2){
            return 1
        }else if(date1 > date2){
            return -1
        }
        return 0
    })

    return (
        <div className="page">
            <h1>{baby.name}'s Diapers</h1>
            <div className="flex space-between align-center">
                <BackButton pathUrl={`/baby-tracker/babies/${baby.id}`} />
                <div className="flex flex-col align-center flex-center">
                    <div style={{paddingBottom: '10px'}}>
                        <AddElementButton onClick={openCreateModal} center className="mt-0"/>
                    </div>
                </div>
            </div>
            { renderDataCards(dataGroupedByDay) }
            <div className="flex space-between align-center mt-30">
                <div className="mt-30">
                    <BackButton pathUrl={`/baby-tracker/babies/${baby.id}`} />
                </div>
            </div>
            { renderEditModal() }
        </div>
    )
}