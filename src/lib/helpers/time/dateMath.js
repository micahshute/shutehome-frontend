import { normalizeDateStrOrObj, parseUTCDate } from "../helpers"
import { DateRange } from './dateRange'

export class DateMath {

    static nowUTC(){
        return new Date(new Date().toUTCString().substring(0, 25))
    }

    static now(){
        return new Date()
    }

    static add(date, dateUnit, amount){
        return dateUnit.add(amount).to(date)
    }

    static subtract(date, dateUnit, amount){
        return dateUnit.subtract(amount).from(date)
    }

    static eql(d1, d2){
        return d1.getTime() === d2.getTime()
    }

    static isSameDay(d1, d2){
        return this.eql(this.beginningOfDay(d1), this.beginningOfDay(d2))
    }

    static beginningOfDayUTC(date){
        const newDate = parseUTCDate(date)
        newDate.setUTCHours(0,0,0,0)
        return new Date(newDate)
    }

    // static beginningOfDay(date){
    //     const inputDate = new Date(date)
    //     const timezoneMinuteOffset = inputDate.getTimezoneOffset()
    //     const timezoneMsOffset = timezoneMinuteOffset * 60 * 1000
    //     const newDate = new Date(inputDate.getTime() - timezoneMsOffset)
    //     newDate.setUTCHours(0,0,0,0)
    //     return new Date(newDate.getTime() + timezoneMsOffset)

    // }

    static beginningOfDay(date) {
        const year = date.getFullYear()
        const month = date.getMonth()
        const day = date.getDate()
        return new Date(year, month, day, 0,0,0,0)
    }

    static endOfDayUTC(date) {
        const newDate = new Date(date)
        newDate.setUTCHours(23,59,59,999)
        return new Date(newDate)
    }

    static endOfDay(date){
        const year = date.getFullYear()
        const month = date.getMonth()
        const day = date.getDate()
        return new Date(year, month, day, 23, 59, 59, 999)
    }

    // static endOfDay(date) {
    //     const inputDate = new Date(date)
    //     const timezoneMinuteOffset = inputDate.getTimezoneOffset()
    //     const timezoneMsOffset = timezoneMinuteOffset * 60 * 1000
    //     const newDate = new Date(inputDate.getTime() - timezoneMsOffset)
    //     newDate.setUTCHours(23,59,59,999)
    //     return new Date(newDate.getTime() + timezoneMsOffset)
    // }

    static beginningOfWeek(date){
        if(date.getDay() === 0){
            return this.beginningOfDay(date)
        }

        const daysToBeginningOfWeek = date.getDay()
        return this.beginningOfDay(Day.subtract(daysToBeginningOfWeek).from(date))
    }

    static endOfWeek(date){
        return Day.add(6).to(this.beginningOfWeek(date))
    }
}

class DateUnit extends DateRange{

    static add(amount){
        return {
            to: (date) => new Date(date.getTime() + amount * this.value),
        }
    }
    
    static subtract(amount){
        return {
            from: date => new Date(date.getTime() - amount * this.value)
        }
    }

}


export class Day extends DateUnit {
    static value = 24 * 60 * 60 * 1000;

    static fromString(str){
        const startTime = Number.parseInt(str.split("::")[0])
        const startDate = new Date(startTime)
        return new this(startDate)
    }

    static diff(day1, day2){
        const range = new DateRange(day1.startTime, day2.startTime)
        return Math.round(range.durationMinutes() / (60 * 24))
    }

    constructor(dateArg){
        const date = normalizeDateStrOrObj(dateArg)
        const startTime = DateMath.beginningOfDay(date)
        const endTime = DateMath.endOfDay(date)
        super(startTime, endTime)
    }

    valueOf(){
        return this.startTime
    }

    fastForward(numDays){
        return (new Day(Day.add(numDays).to(this.startTime)))
    }

    reverse(numDays){
        return (new Day(Day.subtract(numDays).from(this.startTime)))
    }

    isEql(day){
        return day.toString() === this.toString()
    }

    toString(){
        return `${this.startTime.getTime()}::${this.endTime.getTime()}`
    } 

}

export class Week extends DateUnit {
    static value = Day.value * 7

    static fromString(str){
        const startTime = Number.parseInt(str.split("::")[0])
        const startDate = new Date(startTime)
        new this(startDate)
    }

    constructor(date){
        const startTime = DateMath.beginningOfWeek(date)
        const endTime = DateMath.endOfWeek(date)
        super(startTime, endTime)
    }


    toString(){
        return `${this.startTime.getTime()}::${this.endTime.getTime()}`
    }
}

// TODO
// class Month {
//     static addTo(date){
//         if(date.getMonth() === 11){
//             return new Date(date.getFullYear() + 1, 0, date.getDate(), date.getHours(), date.getMinute(), date.getSeconds(), date.getMilliseconds())
//         }else{
//             if(date.getDate() == 31)
//         }
//     }
// }

