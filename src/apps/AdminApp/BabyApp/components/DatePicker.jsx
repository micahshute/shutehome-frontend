import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect'
import DateTimePicker from "react-datetime-picker"
import DatePicker from 'react-mobile-datepicker'
import { useState } from 'react'
import { getFullDate, getTime } from '../../../../lib/helpers/helpers'
import { useEffect } from 'react'
import Modal from 'react-modal'

export function MDDateTimePicker({onChange, value, small=false, hideTimeDisplay=false, buttonType='secondary', renderAsModal=false}){
    const [isOpen, setIsOpen] = useState(false)
    const [desktopTime, setDesktopTime] = useState(new Date(value))
    const [desktopModalOpen, setDesktopModalOpen] = useState(false)

    const handleMobileSelect = dateTime => {
        setIsOpen(false)
        onChange(dateTime)
    }
    const closeDesktopModal = () => {
        setDesktopModalOpen(false)
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

    useEffect(() => {
        if(isOpen){
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            document.body.style.overflow = 'hidden'
        }else{
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const renderDesktopModal = () => (
            <Modal 
                isOpen={desktopModalOpen}
                onRequestClose={closeDesktopModal}
                contentLabel="Change event start time"
            >
                <div className="ml-30 mt-30 mr-30">
                    <button className="x" onClick={closeDesktopModal}>Close</button>
                    <div className="flex justify-between">
                        <DateTimePicker onChange={date => setDesktopTime(date)} value={desktopTime} />
                        <button className="btn btn-primary" onClick={() => onChange(desktopTime)}>Save</button>
                    </div>
                </div>
            </Modal>
    )

    const renderDesktopDatePicker = () => <DateTimePicker onChange={onChange} value={value} />
    
    const renderModalButton = () => (
        <button className="btn btn-tertiary" onClick={() => setDesktopModalOpen(true)}>Change Time</button>
    )


    return (
        <>
            <BrowserView>
                { renderAsModal ? renderModalButton() : renderDesktopDatePicker() }
            </BrowserView>
            <MobileView>
                { hideTimeDisplay ? null : <p>{getFullDate(value)}{` `}{getTime(value)}</p> }
                <button 
                    className={`btn btn-${buttonType} ${small ? '' : 'btn-large'}`}
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
            { renderDesktopModal() }
        </>

    )
}