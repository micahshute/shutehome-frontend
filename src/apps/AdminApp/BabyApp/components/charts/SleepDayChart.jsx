import { pad } from "../../../../../lib/helpers/helpers";
import { Day } from "../../../../../lib/helpers/time/dateMath";
import { 
    BarChart, 
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

export default function SleepDayChart({ sleepData, dayStr, width='100%' }){

    const day = Day.fromString(dayStr)
    const sleepRanges = sleepData.map(sleepDatum => sleepDatum.dateRange)
    const minutes = Array.from({length: (4 * 24)}, (x, i) => i * 15)
    const data = minutes.map(minute => {
        const hour = Number.parseInt(minute / 60);
        const hourMinute = minute % 60
        const date = new Date(
            day.startTime.getFullYear(),
            day.startTime.getMonth(),
            day.startTime.getDate(),
            hour,
            hourMinute
        )
        const value = sleepRanges.some(range => range.includes(date)) ? 1 : 0
        return {
            value,
            name: `${pad(hour, 2)}`
        }
    })

    return (
        <ResponsiveContainer width={width} minWidth={200} height={250}>
            <AreaChart data={data} margin={{top: 5, right: 1, left: 1, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={7}>
                    <Label value="time" position="bottom"/>
                </XAxis>
                <Area dataKey="value" fill="#8884d8" />
            </AreaChart>
        </ResponsiveContainer>
    )



}