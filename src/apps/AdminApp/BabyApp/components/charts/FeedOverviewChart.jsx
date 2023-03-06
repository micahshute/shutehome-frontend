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


export default function FeedStatsChart({ feedStatsData }){

    const shouldDisplayTimes = feedStatsData.any_times_exist
    const shouldDisplayVolumes = feedStatsData.any_volumes_exist
    const shouldDisplaySolids = feedStatsData.any_solids_exist

    if(!shouldDisplayTimes && !shouldDisplayVolumes && !shouldDisplaySolids) { return <h2 className="text-center">No data yet!</h2> }

    const chartData = Object.keys(feedStatsData.two_week_daily_breakdown).map(dateStr => {
        const rawData = feedStatsData.two_week_daily_breakdown[dateStr].table
        return {
            name: getDate(dateStr),
            floz: rawData.total_volume,
            oz: rawData.total_solids,
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
                { shouldDisplayVolumes && <Bar dataKey="floz" fill="#8884d8" stackId="a" /> }
                { shouldDisplayTimes && <Bar dataKey="mins" fill="#82ca9d" stackId="a" /> }
                { shouldDisplaySolids && <Bar dataKey="oz" fill="#3c4544" stackId="a" /> }
                { shouldDisplayVolumes && <ReferenceLine y={feedStatsData.average_volume_per_day} stroke="green" label='μ floz' strokeDasharray="3 10" isFront/> }
                { shouldDisplayVolumes && <ReferenceLine y={feedStatsData.average_volume_per_day + feedStatsData.volume_std} stroke="green" label='μ+σ floz' strokeDasharray="3 10" isFront/> }
                { shouldDisplayVolumes && <ReferenceLine y={feedStatsData.average_volume_per_day - feedStatsData.volume_std} stroke="green" label='μ-σ floz' strokeDasharray="3 10" isFront/> }
                { shouldDisplayTimes && <ReferenceLine y={feedStatsData.average_time_per_day} stroke="orange" label='μ mins' strokeDasharray="3 10" isFront/> }
                { shouldDisplayTimes && <ReferenceLine y={feedStatsData.average_time_per_day + feedStatsData.time_std} stroke="orange" label='μ+σ mins' strokeDasharray="3 10" isFront/> }
                { shouldDisplayTimes && <ReferenceLine y={feedStatsData.average_time_per_day - feedStatsData.time_std} stroke="orange" label='μ-σ mins' strokeDasharray="3 10" isFront/> }
                { shouldDisplaySolids && <ReferenceLine y={feedStatsData.average_solids_per_day} stroke="blue" label='μ oz' strokeDasharray="3 10" isFront/> }
                { shouldDisplaySolids && <ReferenceLine y={feedStatsData.average_solids_per_day + feedStatsData.solids_std} stroke="blue" label='μ+σ oz' strokeDasharray="3 10" isFront/> }
                { shouldDisplaySolids && <ReferenceLine y={feedStatsData.average_solids_per_day - feedStatsData.solids_std} stroke="blue" label='μ-σ oz' strokeDasharray="3 10" isFront/> }
            </BarChart>
        </ResponsiveContainer>
    )
}