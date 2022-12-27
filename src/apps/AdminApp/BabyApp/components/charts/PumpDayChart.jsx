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

import { pad } from '../../../../../lib/helpers/helpers'

export default function PumpDayChart({ pumpData, width }){

    const minutes = Array.from({length: (4 * 24)}, (x, i) => i * 15)
    const data = minutes.map(minute => {
        const hour = Number.parseInt(minute / 60);
        return {
            oz: 0,
            name: `${pad(hour, 2)}`
        }
    })

    pumpData.forEach(pumpDatum => {
        const pumpDate = new Date(pumpDatum.start_time)
        const hour = pumpDate.getHours()
        const minute = pumpDate.getMinutes()
        const closestEarlierQuarterHour = Number.parseInt(minute / 60 * 4)
        const minuteIndex = closestEarlierQuarterHour + hour * 4
        data[minuteIndex].oz += pumpDatum.yield
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
                <Bar dataKey="oz" fill="#8884d8" stackId="a" />
                {/* <Bar dataKey="mins" fill="#82ca9d" stackId="a" /> */}
            </BarChart>
        </ResponsiveContainer>
    )
}