

export class DateRange {

    static fromString(startStr, endStr){
        return new this(new Date(startStr), new Date(endStr))
    }

    constructor(startTime, endTime){
        this.startTime = startTime
        this.endTime = endTime
        if(this.startTime > this.endTime){
            throw new Error("Date ranges cannot be negative")
        }
    }

    isBefore(dateOrRange){
        if(dateOrRange instanceof Date){
            return dateOrRange < this.startTime
        }
        return dateOrRange.endTime < this.startTime
    }

    isAfter(dateOrRange){
        if(dateOrRange instanceof Date){
            return dateOrRange > this.endTime
        }

        return dateOrRange.startTime > this.endTime
    }

    duration(){
        return (this.endTime - this.startTime) / 1000
    }

    durationMinutes(){
        return this.duration() / 60
    }

    includes(dateOrRange){
        if(dateOrRange instanceof Date){
            return dateOrRange >= this.startTime && dateOrRange <= this.endTime
        }

        return (
            this.includes(dateOrRange.startTime) || 
            this.includes(dateOrRange.endTime) || 
            (dateOrRange.startTime <= this.startTime && dateOrRange.endTime >= this.endTime)
        )
    }
}