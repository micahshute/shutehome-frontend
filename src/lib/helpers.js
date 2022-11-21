import { DateMath } from "./dateMath";

export function parseUTCDate(dateString){
    return new Date(new Date(dateString).toUTCString().substring(0, 25));

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

export function getDate(dateString){
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
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

export function getAgeStr(birthdayStr){
    const birthday = new Date(birthdayStr)
    const now = DateMath.now()
    const diff = now - birthday
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

export function getWeight(lbFraction, units="lboz"){
    switch(units){
        case "lboz":
            const lbs = Math.round(lbFraction)
            const lbsLeftover = lbFraction - lbs
            const oz = Math.round(lbsLeftover * 16)
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