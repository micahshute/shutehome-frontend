import { deepCopy, getDate, normalizeDateStrOrObj, pad } from "../../../../../lib/helpers/helpers";
import { Day } from "../../../../../lib/helpers/time/dateMath";
import { 
    CartesianGrid, 
    XAxis, 
    YAxis, 
    Label,
    Legend, 
    Bar, 
    Tooltip,
    ResponsiveContainer, 
    AreaChart,
    Area
} from 'recharts'
import { getDerivatives } from "./helpers/derivative";
import { useRest } from "../../../../../hooks/useRest";
import Loader from "../../../../../lib/Loader";

export default function MeasurementChart({ sortedMeasurementData, width='100%' }){

    const { 
        data: percentileData, 
        error: percentileError, 
        loading: percentileLoading 
    } = useRest(`/babies/${sortedMeasurementData[0]?.baby_id}/measurements/percentile_data`, 'POST', {data: sortedMeasurementData})

    if(sortedMeasurementData.length < 2){ return null }


    const transformData = (sortedData) => {
        const dataSize = sortedData.length
        const firstDay = new Day(sortedData[0].time)
        const lastDay = new Day(sortedData[dataSize - 1].time)
        const totalDays = Day.diff(firstDay, lastDay) + 2
        const dateIntegers = Array.from({length: totalDays}, (x, i) => i)
        // console.log(dateIntegers)
        let dataIndex = 0
        const graphData = dateIntegers.map(dayInt => {
            const dayOfGraphDatapoint = firstDay.fastForward(dayInt)
            const data = {
                date: getDate(dayOfGraphDatapoint.startTime)
            }
            // console.log('dataIndex', dataIndex)
            // console.log("DayOfGraphDatapoint", dayOfGraphDatapoint)
            // console.log('------------------')
            while(true){
                if(dataIndex >= dataSize) { break }
                const measurementDatum = sortedData[dataIndex]
                const dayOfMeasurement = new Day(measurementDatum.time)
                // console.log("dayOfMeasurement", dayOfMeasurement)
                if(dayOfMeasurement.isEql(dayOfGraphDatapoint)){
                    data[measurementDatum.category] = measurementDatum.value
                    dataIndex++
                } else {
                    break
                }
            }

            return data
        })

        return graphData
    }

    // console.log('measurementData', measurementData)
    const graphData = transformData(sortedMeasurementData)
    console.log('graphData', graphData)

    let derivativeData = []
    try{
        derivativeData = getDerivatives(graphData, 'date')
    }catch(err){
        // do nothing
    }
    // console.log('derivativeData', derivativeData)

    const renderPercentileChart = () => {

        if(percentileLoading){
            return <Loader dark/>
        }

        if(percentileError){
            return <p className="danger">There was a problem loading percentile data</p>
        }

        if(!percentileData) { return null }

        const percentileGraphData = transformData(percentileData)
        return (
            <>
                <h2 className="mb-0">Percentiles, CDC Ref</h2>
                <label className="mb-30"><a href="https://www.cdc.gov/growthcharts/html_charts/hcageinf.htm" target="_blank">Data Reference</a></label>
                <ResponsiveContainer width={width} minWidth={200} height={250}>
                    <AreaChart data={percentileGraphData} margin={{top: 5, right: 1, left: 1, bottom: 5}}>
                        <defs>
                            <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorHeadCirc" x1="0" y1="0" x2="0" y2="1">
                                {/* <stop offset="5%" stopColor="#4a8eb5" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#4a8eb5" stopOpacity={0}/> */}
                                <stop offset="5%" stopColor="#00C8FF" stopOpacity={0.4}/>
                                <stop offset="98%" stopColor="#00C8FF" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date"/>
                        <YAxis />
                        <Area type="monotone" dataKey="height" stroke="#8884d8" fillOpacity={1} fill="url(#colorHeight)" connectNulls/>
                        <Area type="monotone" dataKey="weight" stroke="#82ca9d" fillOpacity={1} fill="url(#colorWeight)" connectNulls/>
                        <Area type="monotone" dataKey="head_circumference" stroke="#00C8FF" fillOpacity={1} fill="url(#colorHeadCirc)" connectNulls/>
                        <Legend verticalAlign='bottom' align='right' />
                        <Tooltip />
                    </AreaChart>
                </ResponsiveContainer>
            </>

        )
    }

    return (
        <>
            <h2>Measurements</h2>
            <ResponsiveContainer width={width} minWidth={200} height={250}>
                <AreaChart data={graphData} margin={{top: 5, right: 1, left: 1, bottom: 5}}>
                    <defs>
                        <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorHeadCirc" x1="0" y1="0" x2="0" y2="1">
                            {/* <stop offset="5%" stopColor="#4a8eb5" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4a8eb5" stopOpacity={0}/> */}
                            <stop offset="5%" stopColor="#00C8FF" stopOpacity={0.4}/>
                            <stop offset="98%" stopColor="#00C8FF" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date"/>
                    <YAxis />
                    <Area type="monotone" dataKey="height" stroke="#8884d8" fillOpacity={1} fill="url(#colorHeight)" connectNulls/>
                    <Area type="monotone" dataKey="weight" stroke="#82ca9d" fillOpacity={1} fill="url(#colorWeight)" connectNulls/>
                    <Area type="monotone" dataKey="head_circumference" stroke="#00C8FF" fillOpacity={1} fill="url(#colorHeadCirc)" connectNulls/>
                    <Legend verticalAlign='bottom' align='right' />
                    <Tooltip />
                </AreaChart>
            </ResponsiveContainer>
            { derivativeData.length > 2 && (
                <>
                    <h2>Derivatives</h2>
                    <ResponsiveContainer width={width} minWidth={200} height={250}>
                        <AreaChart data={derivativeData} margin={{top: 5, right: 1, left: 1, bottom: 5}}>
                            <defs>
                                <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorHeadCirc" x1="0" y1="0" x2="0" y2="1">
                                    {/* <stop offset="5%" stopColor="#4a8eb5" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#4a8eb5" stopOpacity={0}/> */}
                                    <stop offset="5%" stopColor="#00C8FF" stopOpacity={0.4}/>
                                    <stop offset="98%" stopColor="#00C8FF" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date"/>
                            <YAxis />
                            <Area type="monotone" dataKey="height" stroke="#8884d8" fillOpacity={1} fill="url(#colorHeight)" connectNulls/>
                            <Area type="monotone" dataKey="weight" stroke="#82ca9d" fillOpacity={1} fill="url(#colorWeight)" connectNulls/>
                            <Area type="monotone" dataKey="head_circumference" stroke="#00C8FF" fillOpacity={1} fill="url(#colorHeadCirc)" connectNulls/>
                            <Legend verticalAlign='bottom' align='right' />
                            <Tooltip />
                        </AreaChart>
                    </ResponsiveContainer>
                </>
            )}
            { renderPercentileChart() }
        </>
    )
}