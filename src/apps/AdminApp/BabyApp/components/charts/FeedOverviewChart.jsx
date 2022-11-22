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
import { getDate } from '../../../../../lib/helpers'


export default function FeedStatsChart({ feedStatsData }){

    const shouldDisplayTimes = feedStatsData.any_times_exist
    const shouldDisplayVolumes = feedStatsData.any_volumes_exist

    if(!shouldDisplayTimes && !shouldDisplayVolumes) { return <h2 className="text-center">No data yet!</h2> }

    const chartData = Object.keys(feedStatsData.two_week_daily_breakdown).map(dateStr => {
        const rawData = feedStatsData.two_week_daily_breakdown[dateStr].table
        return {
            name: getDate(dateStr),
            oz: rawData.total_volume,
            mins: rawData.total_time,
        }
    })

    // To add tick for mean an stddev, see:
    // https://recharts.org/en-US/examples/BarChartWithMultiXAxis
    // const renderStatTick = ({x, y, payload}) => {
    // }


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
                { shouldDisplayVolumes && <Bar dataKey="oz" fill="#8884d8" stackId="a" /> }
                { shouldDisplayTimes && <Bar dataKey="mins" fill="#82ca9d" stackId="a" />}
                { shouldDisplayVolumes && <ReferenceLine y={feedStatsData.average_volume_per_day} stroke="green" label='μ oz' strokeDasharray="3 10" isFront/> }
                { shouldDisplayVolumes && <ReferenceLine y={feedStatsData.average_volume_per_day + feedStatsData.volume_std} stroke="green" label='μ+σ oz' strokeDasharray="3 10" isFront/> }
                { shouldDisplayVolumes && <ReferenceLine y={feedStatsData.average_volume_per_day - feedStatsData.volume_std} stroke="green" label='μ-σ oz' strokeDasharray="3 10" isFront/> }
                { shouldDisplayTimes && <ReferenceLine y={feedStatsData.average_time_per_day} stroke="orange" label='μ mins' strokeDasharray="3 10" isFront/> }
                { shouldDisplayTimes && <ReferenceLine y={feedStatsData.average_time_per_day + feedStatsData.time_std} stroke="orange" label='μ+σ mins' strokeDasharray="3 10" isFront/> }
                { shouldDisplayTimes && <ReferenceLine y={feedStatsData.average_time_per_day - feedStatsData.time_std} stroke="orange" label='μ-σ mins' strokeDasharray="3 10" isFront/> }
            </BarChart>
        </ResponsiveContainer>
    )
}