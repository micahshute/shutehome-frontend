import { deepCopy, round } from "../../../../../../lib/helpers/helpers"


export function interpolateMissingData(data, labelKey='name'){
    const keysToLastSeenIndexValuePair = {}

    for(let dataIndex = 0; dataIndex < data.length; dataIndex++){
        const datum = data[dataIndex]
        const dataKeys = Object.keys(datum).filter(k => k !== labelKey)
        for(let keyIndex = 0; keyIndex < dataKeys.length; keyIndex++){
            const key = dataKeys[keyIndex]
            if(keysToLastSeenIndexValuePair[key]){
                const lastSeenIndex = keysToLastSeenIndexValuePair[key].index
                if(lastSeenIndex !== dataIndex - 1){
                    const m = (datum[key] - keysToLastSeenIndexValuePair[key].value) / (dataIndex - lastSeenIndex)
                    const b = keysToLastSeenIndexValuePair[key].value
                    const f = (x) => m*x + b
                    for(let backfillIndex = lastSeenIndex + 1; backfillIndex < dataIndex; backfillIndex++){
                        const x = backfillIndex - lastSeenIndex
                        const y = f(x) 
                        data[backfillIndex][key] = round(y, 3)
                    }
                }
            }

            keysToLastSeenIndexValuePair[key] = { index: dataIndex, value: datum[key] }
        }
    }

    return data
}


export function getDerivatives(data, labelKey='name'){
    const cleanedData = interpolateMissingData(deepCopy(data), labelKey)
    const emptyFirstIndex = { [labelKey]: cleanedData[0][labelKey] }
    const emptySecondIndex = { [labelKey]: cleanedData[1][labelKey] }
    const derivativeData = [emptyFirstIndex, emptySecondIndex]
    for(let i = 2; i < cleanedData.length - 2; i++){
        const datum = cleanedData[i]
        const derivativeDatum = { [labelKey]: datum[labelKey] }
        const keys = Object.keys(datum).filter(key => key !== labelKey)
        for(let j = 0; j < keys.length; j++){
            const key = keys[j]
            const fxM2 = cleanedData[i-2][key]
            const fxM1 = cleanedData[i-1][key]
            const fxP1 = cleanedData[i+1][key]
            const fxP2 = cleanedData[i+2][key]
            const necessaryDataExists = (fxM2 && fxM1 && fxP1 && fxP2)
            if(necessaryDataExists){
                const fDerX = ((-1 * fxP2) + (8*fxP1) - (8*fxM1) + fxM2) / 12
                derivativeDatum[key] = fDerX
            }
        }
        derivativeData.push(derivativeDatum)
    }
    const emptyLastIndex = { [labelKey]: cleanedData[cleanedData.length - 1][labelKey] }
    const emptySecondToLastIndex = { [labelKey]: cleanedData[cleanedData.length - 2][labelKey] }
    derivativeData.push(emptySecondToLastIndex)
    derivativeData.push(emptyLastIndex)
   return derivativeData 
}