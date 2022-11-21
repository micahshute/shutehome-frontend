import { 
    BarChart, 
    CartesianGrid, 
    XAxis, 
    YAxis, 
    Label,
    Legend, 
    Bar, 
    Tooltip,
    ResponsiveContainer 
} from 'recharts'
import { pad, parseUTCDate } from '../../../../../lib/helpers'

export default function FeedDayChart({ feedData, width, showBreastfeed=false, showBottle=true }){

    const minutes = Array.from({length: (4 * 24)}, (x, i) => i * 15)
    const data = minutes.map(minute => {
        const hour = Number.parseInt(minute / 60);
        const hourMinute = minute % 60
        return {
            oz: 0,
            mins: 0,
            name: `${pad(hour, 2)}`//:${pad(hourMinute, 2)}`
        }
    })

    feedData.forEach(feedDatum => {
        const feedDate = new Date(feedDatum.time)
        const hour = feedDate.getHours()
        const minute = feedDate.getMinutes()
        const closestEarlierQuarterHour = Number.parseInt(minute / 60 * 4)
        const minuteIndex = closestEarlierQuarterHour + hour * 4
        if(feedDatum.quantity_type === 'amount'){
            data[minuteIndex].oz += feedDatum.quantity
        }else if(feedDatum.quantity_type === 'time'){
            data[minuteIndex].mins += feedDatum.quantity
        }
    })

    return (
        <ResponsiveContainer width={width} minWidth={200} height={250}>
            <BarChart data={data} margin={{top: 5, right: 1, left: 1, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={7}>
                    <Label value="time" position="bottom"/>
                </XAxis>
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="bottom" align="right" />
                { showBottle && <Bar dataKey="oz" fill="#8884d8" stackId="a" /> }
                { showBreastfeed && <Bar dataKey="mins" fill="#82ca9d" stackId="a" /> }
            </BarChart>
        </ResponsiveContainer>
    )
}