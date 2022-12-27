import {
    BarChart,
    CartesianGrid,
    XAxis, 
    YAxis, 
    Label,
    Legend,
    Bar,
    ResponsiveContainer,
    Tooltip,
    ReferenceLine
} from 'recharts'
import { getDate } from '../../../../../lib/helpers/helpers'


export default function PumpOverviewChart({ pumpStatsData }){

    const chartData = Object.keys(pumpStatsData.two_week_daily_breakdown).map(dateStr => {
        const rawData = pumpStatsData.two_week_daily_breakdown[dateStr].table
        return {
            name: getDate(dateStr),
            oz: rawData.total_volume,
            mins: rawData.total_time,
        }
    })


    return (
        <ResponsiveContainer width='100%' minWidth={200} height={500}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                    <Label value="date" position="bottom" />
                </XAxis>
                <YAxis />
                <Tooltip />
                <Legend verticalAlign='bottom' align='right' />
                <Bar dataKey="oz" fill="#8884d8" stackId="a" /> 
                <Bar dataKey="mins" fill="#82ca9d" stackId="a" />
                <ReferenceLine y={pumpStatsData.average_volume_per_day} stroke="green" label='μ oz' strokeDasharray="3 10" isFront/> 
                <ReferenceLine y={pumpStatsData.average_volume_per_day + pumpStatsData.volume_std} stroke="green" label='μ+σ oz' strokeDasharray="3 10" isFront/> 
                <ReferenceLine y={pumpStatsData.average_volume_per_day - pumpStatsData.volume_std} stroke="green" label='μ-σ oz' strokeDasharray="3 10" isFront/> 
                <ReferenceLine y={pumpStatsData.average_time_per_day} stroke="orange" label='μ mins' strokeDasharray="3 10" isFront/> 
                <ReferenceLine y={pumpStatsData.average_time_per_day + pumpStatsData.time_std} stroke="orange" label='μ+σ mins' strokeDasharray="3 10" isFront/> 
                <ReferenceLine y={pumpStatsData.average_time_per_day - pumpStatsData.time_std} stroke="orange" label='μ-σ mins' strokeDasharray="3 10" isFront/> 
            </BarChart>
        </ResponsiveContainer>
    )
}