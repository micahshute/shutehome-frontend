import { useEffect, useState } from "react"
import procareLogo from '../../../../../../assets/procare.png'
import { useLazyRest } from "../../../../../../hooks/useLazyRest"
import LoadingButton from "../../../../../../lib/LoadingButton"


export default function ProcareStep1({ onStepComplete }){

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { data, loading, error, call } = useLazyRest()

    const handleChangeEmail = (e) => {
        setEmail(e.target.value)
    }

    const handleChangePassword = e => {
        setPassword(e.target.value)
    }

    const verifyAndSaveCredentials = () => {
        call('/integrations/procare/verify', "POST", {
            email, 
            password
        })
    }

    useEffect(() => {
        if(!loading && !error && data){
            onStepComplete()
        }

    }, [data, loading, error])

    return (
        <div className="flex flex-col justify-center align-center" >
            <div>
                <img src={procareLogo} />
            </div>
            <div style={{marginBottom: '40px'}}>
                <h3>Please enter your Procare Credentials</h3>
            </div>
            <div>
                <label htmlFor="email">Email</label>
                <input 
                    id="email" 
                    type="text" 
                    value={email} 
                    onChange={handleChangeEmail} 
                    style={{ width: '20em', maxWidth: '70vw'}}
                />
            </div>
            <div >
                <label htmlFor="password">Password</label>
                <input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={handleChangePassword} 
                    style={{ width: '20em', maxWidth: '70vw'}}
                />
            </div>
            <div className="mt-30 flex justify-end" style={{width: '20em', maxWidth: "70%"}}>
                <LoadingButton onClick={verifyAndSaveCredentials} loading={loading} text="Connect" />
            </div>
        </div>
    )
}