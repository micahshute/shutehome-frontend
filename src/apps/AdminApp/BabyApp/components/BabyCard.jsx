import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLazyRest } from "../../../../hooks/useLazyRest"
import Card from "../../../../lib/Card"
import { useToasts } from 'react-toast-notifications'
import Modal from 'react-modal';
import { useUser } from "../../../../hooks/useUser"
import { getAgeStr, getFormattedDateTime, getWeight, getHeight, getHoroscopeSign } from "../../../../lib/helpers"
import RegisterBaby from "./RegisterBaby"

export default function BabyCard({baby, gotoEdit}){

    const [modalIsOpen, setModalIsOpen] = useState(false)
    const navigate = useNavigate()
    const { deleteBaby } = useUser()
    const { addToast } = useToasts()
    const { data, error, loading, call } = useLazyRest()

    const gotoBaby = () => {
        navigate(`/baby-tracker/babies/${baby.id}`)
    }

    const handleDeleteBaby = (e) => {
        e.stopPropagation()
        call(`/babies/${baby.id}`, 'delete')
    }

    useEffect(() => {
        if(!loading && !data && error){
            addToast('There was a problem deleting your baby', { appearance: 'error' })
        }else if(!loading && !error && data){
            deleteBaby(data.id)
            addToast('Successfully deleted baby data', { appearance: 'success' })
        }
    }, [data, loading, error])

    const handleOpenEdit = (e) => {
        e.stopPropagation()
        setModalIsOpen(true)
    }

    const managementButtons = (
        <div>
            <button className="delete-button" onClick={handleDeleteBaby}>Delete</button>
            <button className="edit-button" onClick={handleOpenEdit}>Edit</button>
        </div>
    )


    return(
        <>
            <Card 
                header={<>{baby.name}<span className='text-sm'> ({baby.is_male ? "M" : "F"})</span></>} 
                onClick={ gotoBaby }
                headerComponent={managementButtons}
            >
                <>
                    <div className="center width-full">
                        <p className="text-center"><strong>🥳</strong> {getFormattedDateTime(baby.birthdate)} {getHoroscopeSign(baby.birthdate)}</p>
                    </div>
                    <table>
                        <tbody className='text-left'>
                            <tr>
                                <th className="baby-card-hdr">Age</th>
                                <td>{getAgeStr(baby.birthdate)}</td>
                            </tr>
                            <tr>
                                <th className="baby-card-hdr">Weight</th>
                                <td>{getWeight(baby.weight) || "no weight"}</td>
                            </tr>
                            <tr>
                                <th className="baby-card-hdr">Height</th>
                                <td>{getHeight(baby.height) || "no height"}</td>
                            </tr>
                        </tbody>
                    </table>
                </>
            </Card>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Update your baby's info"
            >
                <div className="ml-30 mt-30">
                    <button className="x" onClick={() => setModalIsOpen(false)}>Close</button>
                    <RegisterBaby closeModal={() => setModalIsOpen(false)} baby={baby}/>
                </div>
            </Modal>
        </>
    )
}