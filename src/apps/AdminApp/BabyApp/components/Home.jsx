import BabyCard from "./BabyCard";
import { useUser } from "../../../../hooks/useUser";
import AddElementButton from "../../../../lib/AddElementButton";
import Card from "../../../../lib/Card";
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect'
import Modal from 'react-modal';
import { useState } from "react";
import RegisterBaby from "./RegisterBaby";


Modal.setAppElement('#root')

export default function Home(){

    const [createModalIsOpen, setCreateModalIsOpen] = useState(false)
    const { user } = useUser()

    const renderBabyCards = () => (
        user.babies.map(baby => (
            <BabyCard 
                key={baby.id} 
                baby={baby} 
            />
        ))
    )

    return (
        <>
            <div className="page">
                <div className="w-75 center">
                    <Card header={`${user.name}'s family`}>
                        <div className="text-center">
                            <p>Welcome! Manage your family here.</p>
                        </div>
                    </Card>

                    <h2 className="baby-header">Your children:</h2>
                    <div className={isMobile ?  '' : 'baby-container'}>
                        { renderBabyCards() }
                    </div>
                    <AddElementButton onClick={() => setCreateModalIsOpen(true)} />
                </div>
                <Modal 
                    isOpen={createModalIsOpen}
                    onRequestClose={() => setCreateModalIsOpen(false)}
                    contentLabel="Register a new baby"
                >
                    <div className="ml-30 mt-30">
                        <button className="x" onClick={() => setCreateModalIsOpen(false)}>Close</button>
                        <RegisterBaby closeModal={() => setCreateModalIsOpen(false)}/>
                    </div>
                </Modal>
            </div>
        </>
    )
}