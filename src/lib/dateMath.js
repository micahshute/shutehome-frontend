export class DateMath {

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

    static beginningOfDay(date){
        const newDate = new Date(date.getTime())
        newDate.setUTCHours(0,0,0,0)
        const timezoneMinuteOffset = newDate.getTimezoneOffset()
        return new Date(newDate.getTime() + (timezoneMinuteOffset * 60 * 1000))
    }

    static endOfDay(date) {
        const newDate = new Date(date.getTime())
        newDate.setUTCHours(23,59,59,999)
        const timezoneMinuteOffset = newDate.getTimezoneOffset()
        return new Date(newDate.getTime() + (timezoneMinuteOffset * 60 * 1000))
    }

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

class DateUnit {

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

    constructor(date){
        super(date)
        this.startTime = DateMath.beginningOfDay(date)
        this.endTime = DateMath.endOfDay(date)
    }

    includes(date){
        return this.startTime <= date && this.endTime >= date
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
        super(date)
        this.startTime = DateMath.beginningOfWeek(date)
        this.endTime = DateMath.endOfWeek(date)
    }

    includes(date){
        return this.startTIme <= date && this.endTime >= date
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

