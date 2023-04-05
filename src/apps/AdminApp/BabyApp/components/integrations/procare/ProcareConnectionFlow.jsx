import ProcareStep1 from "./ProcareStep1"
import ProcareStep2 from "./ProcareStep2"
import { useState } from "react"

export default function ProcareConnectionFlow( {onSetupComplete, skipAuth }){

    const [step, setStep] = useState(skipAuth ? 2 : 1)
    console.log(step)

    if(step === 1) {
        return <ProcareStep1 onStepComplete={() => setStep(2)} />
    }

    return <ProcareStep2 onStepComplete={onSetupComplete} />

}