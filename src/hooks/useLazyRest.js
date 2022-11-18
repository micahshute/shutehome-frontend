import { useState } from 'react'
import { BASE_URL } from './useRest'

export function useLazyRest(){

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)


    let call = async (url, method="get", body=null) => {
        setLoading(true)
        setData(null)
        setError(null)
        let fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }

        if(body){
            fetchOptions = {
                ...fetchOptions,
                body: JSON.stringify(body)
            }
        }

        try{
            const res = await fetch(`${BASE_URL}${url}`, fetchOptions)
            if(!res.ok) throw res

            const data = await res.json()
            setData(data)
        }catch(err){
            setError(err)
        }finally{
            setLoading(false)
        }
    }


    return {
        data,
        error,
        loading,
        call,
    }
}