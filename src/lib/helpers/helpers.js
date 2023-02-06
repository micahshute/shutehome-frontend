import { DateMath } from "./time/dateMath";

export function parseUTCDate(dateString){
    return new Date(new Date(dateString).toUTCString().substring(0, 25));

}

export const dayMap = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
]

export const monthMap = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

export function getVerboseDate(dateArg){
    const date = normalizeDateStrOrObj(dateArg)
    const dayOfWeek = date.getDay()
    const weekdayFormatted = dayMap[dayOfWeek]
    const monthFormatted = monthMap[date.getMonth()]
    const dayOfMonth = date.getDate()
    return `${weekdayFormatted}, ${dayOfMonth} ${monthFormatted}`
}

export function deepCopy(obj) {
    if(Array.isArray(obj)){
        const newArr = []
        obj.forEach(el => {
            newArr.push(deepCopy(el))
        })
        return newArr
    }else if (typeof obj === 'object') {
        const newObj = {}
        Object.keys(obj).forEach(key => {
            newObj[key] = deepCopy(obj[key])
        })
        return newObj
    } else {
        return obj
    }
}

export function getFormattedDateTime(dateString){
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minutes = date.getMinutes()
    return `${month}/${day}/${year} ${pad(hour, 2)}:${pad(minutes, 2)}`
}

export function normalizeDateStrOrObj(dateArg){
    if(typeof dateArg === 'string'){
        return new Date(dateArg)
    }
    return dateArg
}

export function getDate(dateArg){
    const date = normalizeDateStrOrObj(dateArg)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
}

export function sortBy(coll, keyValue, reverse=false){
    return coll.sort((a,b) => {
        if(a[keyValue] < b[keyValue]){
            return reverse ? 1 : -1
        }else if(a[keyValue] > b[keyValue]){
            return reverse ? -1 : 1
        }
        return 0
    })
}


export function getFullDate(dateString){
    const shortDate = getDate(dateString)
    const date = new Date(dateString)
    return `${shortDate}/${date.getFullYear()}`
}

export function getTimeDiff(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1)
    const d2 = new Date(dateStr2)
    const diffMs = d2 - d1
    const diffMinutes = diffMs / 1000 / 60
    if(diffMinutes <= 120) {
        return `${round(diffMinutes, 1)} mins`
    }
    return `${round(diffMinutes / 60, 2)} hrs`
}

export function getTime(dateString){
    const date = new Date(dateString)
    const hour = pad(date.getHours(), 2)
    const minutes = pad(date.getMinutes(), 2)
    return `${hour}:${minutes}`
}

export function getAgeStrAtDate(birthday, eventDate){
    const diff = eventDate - birthday
    const timeDiffDays = diff / 1000 / 60 / 60 / 24
    if(timeDiffDays < 85) {
        const val = Math.floor(timeDiffDays / 7)
        const identifier = val === 1 ? "week" : "weeks"
        return `${val} ${identifier}`
    }else if(timeDiffDays < 731){
        const val = Math.floor(timeDiffDays / 30.5)
        const identifier = val === 1 ? "month" : "months"
        return `${val} ${identifier}`
    }else{
        return `${round(timeDiffDays / 365)} years`
    }

}

export function getAgeStr(birthdayStr){
    const birthday = new Date(birthdayStr)
    const now = DateMath.now()
    return getAgeStrAtDate(birthday, now)
}

export function weightFloatToPoundsOunces(num){
    const lbs = Number.parseInt(num)
    const lbsLeftover = num - lbs
    const oz = round(lbsLeftover * 16)
    return {
        lbs,
        oz
    }
}

export function getWeight(lbFraction, units="lboz"){
    switch(units){
        case "lboz":
            const {lbs, oz} = weightFloatToPoundsOunces(lbFraction)
            return `${lbs} lbs ${oz} oz`
        default:
            return "unsupported units"
    }
}

export function getHeight(inches, units="in"){
    switch(units){
        case "in":
            const shouldUseFeet = inches > 24
            if(!shouldUseFeet){
                return `${inches} in`
            }
            const ft = Math.floor(inches / 12)
            const leftoverInches = inches % 12
            return `${ft}' ${leftoverInches}"`
    }
}

export function round(num, places=1){
    const multiplier = 10 ** places
    return Math.round(num * multiplier) / multiplier
}

export function pad(number, padAmount, padValue = '0'){
    const numStr = number.toString()
    const numLen = numStr.length
    const toPadAmount = padAmount - numLen
    let newNumStr = numStr 
    if(toPadAmount > 0){
        for(let i = 0; i < toPadAmount; i++){
            newNumStr = padValue + newNumStr
        }
    }
    return newNumStr
}

export const getHoroscopeSign = (birthday) => {
    const birthdate = new Date(birthday)
    const month = birthdate.getMonth() 
    const day = birthdate.getDay()
    switch(month){
        case 0:
            if(day < 20) return horoscopeSigns.Capricorn
            return horoscopeSigns.Aquarius
        case 1:
            if(day < 19) return horoscopeSigns.Aquarius
            return horoscopeSigns.Pisces
        case 2: 
            if(day < 21) return horoscopeSigns.Pisces
            return horoscopeSigns.Aries
        case 3:
            if(day < 20) return horoscopeSigns.Aries
            return horoscopeSigns.Taurus
        case 4: 
            if(day < 21) return horoscopeSigns.Taurus
            return horoscopeSigns.Gemini
        case 5: 
            if(day < 21) return horoscopeSigns.Gemini
            return horoscopeSigns.Cancer
        case 6:
            if(day < 23) return horoscopeSigns.Cancer
            return horoscopeSigns.Leo
        case 7:
            if(day < 23) return horoscopeSigns.Leo
            return horoscopeSigns.Virgo
        case 8:
            if(day < 23) return horoscopeSigns.Virgo
            return horoscopeSigns.Libra
        case 9: 
            if(day < 23) return horoscopeSigns.Libra
            return horoscopeSigns.Scorpio
        case 10:
            if(day < 22) return horoscopeSigns.Scorpio
            return horoscopeSigns.Sagittarius
        case 11:
            if(day < 22) return horoscopeSigns.Sagittarius
            return horoscopeSigns.Capricorn
    }
}


const horoscopeSigns = {
    Aries: '♈',
    Taurus: '♉',
    Gemini: '♊',
    Cancer: '♋',
    Leo: '♌',
    Virgo: '♍',
    Libra: '♎',
    Scorpio: '♏',
    Sagittarius: '♐',
    Capricorn: '♑',
    Aquarius: '♒',
    Pisces: '♓',
}