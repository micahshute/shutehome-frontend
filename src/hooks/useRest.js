import React, { useState, useEffect } from 'react'

export const BASE_URL = "http://192.168.1.77:3000"

export function useRest(url, method="get", body=null, options={useTimezone: false}){
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [shouldReload, setShouldReload] = useState(false)


    useEffect(() => {
        setShouldReload(false)
        setLoading(true)
        setError(null)
        setData(null)
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


        if(options.useTimezone && !url.includes("timezoneOffset")){
            if(url.includes("?")){
                url += `&timezoneOffset=${(new Date()).getTimezoneOffset()}`
            }else{
                url += `?timezoneOffset=${(new Date()).getTimezoneOffset()}`
            }
        }

        const makeRequest = async () => {
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

        makeRequest()

    }, [shouldReload])

    const reload = () => {
        setShouldReload(true)
    }

    return {
        data,
        loading,
        error,
        reload
    }
}
