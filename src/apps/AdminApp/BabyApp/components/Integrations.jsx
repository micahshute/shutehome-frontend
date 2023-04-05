import procareLogo from '../../../../assets/procare.png'
import Card from '../../../../lib/ContentCard'
import { useRest } from '../../../../hooks/useRest'
import { isMobile } from 'react-device-detect'
import Loader from '../../../../lib/Loader'
import { useState } from 'react'
import Modal from 'react-modal'
import ProcareConnectionFlow from './integrations/procare/ProcareConnectionFlow'
import { useUser } from '../../../../hooks/useUser'
import { ImConnection } from 'react-icons/im'
import { FaRocket } from 'react-icons/fa'

export function Integrations() {

    const { user } = useUser()
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [procareNeedsAuth, setProcareNeedsAuth] = useState(true)
    const [integrationToSetup, setIntegrationToSetup] = useState(null)
    const { data, loading, error, reload } = useRest('/integrations')

    const cardContainerClass = isMobile ? "justify-center" : "justify-between"

    const renderProcareCard = () => {
        return (
            <Card header="Procare" color='cambridge-blue'>
                <div className="flex align-center justify-center flex-col">
                    <img src={procareLogo}/>
                    { loading ? renderSpinner() : renderProcareCardData() }
                </div>
            </Card>
        )
    }

    const renderSpinner = () => (
        <Loader />
    )

    

    const renderProcareCardData = () => {
        if(error) {
            return (
                <p className="danger m-4">Error checking your connection</p>
            )
        }

        const isConnected = data?.length > 0 
        let canAddChildren = isConnected 
        if(data?.length){
            canAddChildren = data[0].connected_children.length < user.babies.length 
        }

        if(isConnected){
            return renderProcareConnectionData(canAddChildren)
        }

        return renderProcareLogin()
    }

    const renderProcareLogin = () => (
        <div>
            <button className="btn btn-primary" onClick={() => handleProcareSetup()}>Connect</button>
        </div>
    )

    const renderProcareConnectionData = (canAddChildren) => {
        return (
            <div>
                <p>
                    <ImConnection style={{color: 'green'}}/>
                    {' '}Connected!
                </p>
                { data[0].connected_children.map(child => (
                    <p><FaRocket />{' '}{child}</p>
                ))}
                { canAddChildren ? (
                    <div>
                        <button className="btn btn-tertiary" onClick={() => handleProcareSetup(true)}>Add Child</button>

                    </div>
                ): null}
            </div>
        )
    }

    const handleProcareSetup = (fromAddChild=false) => {
        setIntegrationToSetup("procare")
        setModalIsOpen(true)
        if(fromAddChild){
            setProcareNeedsAuth(false)
        }else{
            setProcareNeedsAuth(true)
        }
    }

    const handleProcareSetupComplete = () => {
        setModalIsOpen(false)
        reload()
    }

    const renderChosenSetupFlow = () => {
        if(integrationToSetup === "procare"){
            return <ProcareConnectionFlow onSetupComplete={handleProcareSetupComplete} skipAuth={!procareNeedsAuth} />
        }
    }

    const handleCloseModal = () => {
        setModalIsOpen(false)
    }


    return (
        <div className="page">
            <div className={`flex ${cardContainerClass} flex-wrap`}>
                { renderProcareCard() }
            </div>
            <Modal 
                isOpen={modalIsOpen} 
                onRequestClose={handleCloseModal}
                contentLabel={`Integrate with ${integrationToSetup}`}
            >
                { renderChosenSetupFlow() }
            </Modal>
        </div>
    )
}