import { useEffect, useState } from "react"
import { useLazyRest } from "../../../../../../hooks/useLazyRest"
import { useRest } from "../../../../../../hooks/useRest"
import { useUser } from "../../../../../../hooks/useUser"
import Loader from '../../../../../../lib/Loader'
import LoadingButton from "../../../../../../lib/LoadingButton"
import { useToasts } from 'react-toast-notifications'

export default function ProcareStep2( { onStepComplete }){
    const [babyMap, setBabyMap] = useState({})
    const { data, loading, error } = useRest('/integrations/procare/kids')
    const { data: saveMapData, loading: saveMapLoading, error: saveMapError, call: callSaveMap } = useLazyRest()
    const { user } = useUser()
    const babies = user.babies
    const { addToast } = useToasts()

    useEffect(() => {
        if(saveMapError){
            addToast("There was a problem connecting your child", { appearance: "error" })
        }else if(!saveMapLoading && saveMapData){
            addToast("Successfully connected to Procare", { appearance: "success" })
            onStepComplete()
        }
    }, [saveMapData, saveMapLoading, saveMapError])

    const handleSelectBabyMap = (e, procareChild) => {
        setBabyMap(prevObj => ({
            ...prevObj,
            [procareChild.id]: {babyId: e.target.value, babyIcon: procareChild.avatar_url}
        }))
    }

    const renderTableData = () => {
        return data.map(procareChild => {
            return (
                <tr>
                    <td>{procareChild.first_name}</td>
                    <td>
                        <select value={babyMap[procareChild.id]?.babyId} onChange={(e) => handleSelectBabyMap(e, procareChild)} required >
                        <option value="" disabled selected hidden>Please Choose...</option>
                        { babies.map(shBaby => (
                            <option value={shBaby.id}>{shBaby.name}</option>
                        ))}
                        </select>
                    </td>
                </tr>
            )

        })        
    }

    const renderProcareChildrenMapper = () => {
        if(!data || loading){
            return (
                <Loader dark />
            )
        }

        return (
            <table className="styled-table text-sm">
                <caption className="table-header">
                    Child Mapper
                </caption>
                <thead>
                    <tr>
                        <th>Procare Name</th>
                        <th>Connect</th>
                    </tr>
                </thead>
                <tbody>
                    { renderTableData() }
                </tbody>
            </table>
        )


    }

    const renderError = () => (
        error && <p className="danger">There was a problem finding your Procare kids</p>
    )

    const handleSave = () => {
        callSaveMap('/integrations/procare/child-map', "POST", { babyMap })
    }
    

    return (
        <div>
            <p>{renderProcareChildrenMapper()}</p>
            { renderError() }
            <LoadingButton onClick={handleSave} text="Save" loading={saveMapLoading} />
        </div>
    )
}