import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect'
import DateTimePicker from "react-datetime-picker"
import DatePicker from 'react-mobile-datepicker'
import { useState } from 'react'
import { getFullDate, getTime } from '../../../../lib/helpers/helpers'


export function MDDateTimePicker({onChange, value}){
    const [isOpen, setIsOpen] = useState(false)

    const handleMobileSelect = dateTime => {
        setIsOpen(false)
        onChange(dateTime)
    }

    const dateConfig = {
        'year': {
            format: 'YYYY',
            caption: 'Year',
            step: 1,
        },
        'month': {
            format: 'M',
            caption: 'Mon',
            step: 1,
        },
        'date': {
            format: 'D',
            caption: 'Day',
            step: 1,
        },
        'hour': {
            format: 'hh',
            caption: 'Hour',
            step: 1,
        },
        'minute': {
            format: 'mm',
            caption: 'Min',
            step: 1,
        },
    }


    return (
        <>
            <BrowserView>
                <DateTimePicker onChange={onChange} value={value} />
            </BrowserView>
            <MobileView>
                <p>{getFullDate(value)}{` `}{getTime(value)}</p>
                <button 
                    className="btn btn-secondary btn-large"
                    onClick={() => setIsOpen(true)}
                >Change Time</button>
                <DatePicker 
                    value={value} 
                    onSelect={handleMobileSelect} 
                    isOpen={isOpen} 
                    onCancel={() => setIsOpen(false)}
                    confirmText="Confirm"
                    cancelText="Cancel"
                    dateConfig={dateConfig}
                    headerFormat='MM/DD/YYYY'
                    theme='android-dark'
                    showCaption
                    showHeader
                    showFooter
                />
            </MobileView>
        </>

    )
}