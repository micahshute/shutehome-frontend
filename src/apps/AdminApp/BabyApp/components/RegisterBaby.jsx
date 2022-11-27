import { useEffect, useReducer, useState } from "react"
import { useToasts } from 'react-toast-notifications'
import DateTimePicker from 'react-datetime-picker'
import { useLazyRest } from "../../../../hooks/useLazyRest"
import LoadingButton from "../../../../lib/LoadingButton"
import { useUser } from "../../../../hooks/useUser"
import { round } from "../../../../lib/helpers/helpers"

export default function RegisterBaby( {closeModal, baby=null} ){

    let initialName = ''
    let initialGender = 'male'
    let initialBirthdate = new Date()
    let initialBirthweightLbs = 0
    let initialBirthweightOz = 0
    let initialBirthlength = 0
    let initialBloodType = 'Unknown'

    if(baby){
        initialName = baby.name
        initialGender = baby.is_male ? 'male' : 'female'
        initialBirthdate = new Date(baby.birthdate)
        initialBirthweightLbs = Math.floor(Number.parseFloat(baby.birthweight))
        initialBirthweightOz = Math.round((Number.parseFloat(baby.birthweight) - initialBirthweightLbs) * 16)
        initialBirthlength = baby.birthlength 
        initialBloodType = baby.blood_type
    }


    const { addToast } = useToasts()
    const [name, setName] = useState(initialName)
    const [gender, setGender] = useState(initialGender)
    const [birthdate, setBirthdate] = useState(initialBirthdate)
    const [birthweightLbs, setBirthweightLbs] = useState(initialBirthweightLbs)
    const [birthweightOz, setBirthweightOz] = useState(initialBirthweightOz)
    const [birthlength, setBirthlength] = useState(initialBirthlength)
    const [bloodType, setBloodType] = useState(initialBloodType)

    const { user, addBaby, updateBaby } = useUser()
    const { data, error, loading, call } = useLazyRest()

    const handleSetName = e => {
        setName(e.target.value)
    }

    const handleSetGender = e => {
        setGender(e.target.value)
    }

    const handleSetBirthweightLbs = e => setBirthweightLbs(e.target.value)
    const handleSetBirthweightOz = e => {
        let ounces = e.target.value
        if(ounces > 15){
            ounces = 15
        }
        setBirthweightOz(ounces)
    }
    const handleSetBloodType = e => setBloodType(e.target.value)
    const handleSetBirthlenth = e => setBirthlength(e.target.value)

    const calculateBirthweight = () => {
        const ozPerLb = 16
        const fractoinalLbs = round(Number.parseInt(birthweightOz) / ozPerLb, 2)
        return Number.parseInt(birthweightLbs) + fractoinalLbs
    }

    const getBabyDataForApi = () => ({
        name,
        is_male: gender === 'male',
        birthdate,
        birthweight: calculateBirthweight(),
        birthlength: birthlength,
        blood_type: bloodType
    })

    const handleSubmit = () => {
        const body = getBabyDataForApi()
        if(baby){
            call(`/babies/${baby.id}`, 'put', body)
        }else{
            call(`/users/${user.id}/babies`, 'post', body)
        }
    }

    const getHeader = () => {
        if(baby) return "Register your baby"
        return "Update your baby"
    }

    const getButtonText = () => {
        if(baby) return "Update"
        return "Create"
    }

    useEffect(() => {
        if(!loading && !error && data) {
            if(baby){
                updateBaby(data)
            }else{
                addBaby(data)
            }
            addToast('Saved child successfully', { appearance: 'success' })
            closeModal()
        }
        if(!loading && error){
            addToast('Error saving baby', { appearance: 'error' })
        }

    }, [loading, error, data])

    return (
        <div>
            <h2 className="register-baby-header">{ getHeader() }</h2>
            <div className="register-baby-input">
                <label for="name">Name</label> 
                <input type="text" id="name" onChange={ handleSetName } value={name} />
            </div>
            <div className="register-baby-input">
                <label for="gender">Gender</label>
                <select id="gender"  value={gender} onChange={handleSetGender}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
            </div>
            <div className="register-baby-input">
                <label for="birthday">Birthday</label>
                <DateTimePicker onChange={setBirthdate} value={birthdate} />
            </div>
            <div className="register-baby-input">
                <div>
                    <label for="birthweight-lbs">Birth Weight</label>
                    <input style={{width: '50px'}} id="birthweight-lbs" type="number" value={birthweightLbs} onChange={handleSetBirthweightLbs} />
                    <span className="register-baby-input-suffix">lbs.</span>
                    <input style={{width: '50px', marginLeft: '5px'}} id="birthweight-oz" type="number" value={birthweightOz} onChange={handleSetBirthweightOz} />
                    <span className="register-baby-input-suffix">oz.</span>
                </div>
            </div>
            <div className="register-baby-input">
                <label for="birthlength">Birth Length</label>
                <input id="birthlength" type="number" value={birthlength} onChange={handleSetBirthlenth} />
                <span className="register-baby-input-suffix">in.</span>
            </div>
            <div className="register-baby-input">
                <label for="blood-type">Blood type</label>
                <select id="blood-type" value={bloodType} onChange={handleSetBloodType} >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="Unknown">Unknown</option>
                </select>
            </div>

            <div>
                <LoadingButton text={ getButtonText() } onClick={handleSubmit} loading={loading} />
            </div>
        </div>

    )
}