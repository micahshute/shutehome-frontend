import AddElementButton from "./AddElementButton"

export default function ContentCard({ header, children, onClick, headerIcon=null, color='sage'}){

    const supportedHeaderColors = [
        'light-blue',
        'sage',
        'french-gray',
        'ash-gray',
        'cambridge-blue',
        'dutch-white',
        'beige'
    ]
    const headerColor = supportedHeaderColors.includes(color) ? color : 'sage'

    return (
        <div className={`content-card ${onClick ? 'hover-pointer': ''}`} onClick={onClick}>
            <div className={`content-card-header bg-${headerColor}`}>
                { headerIcon && 
                    <div className="content-card-header-icon" >
                        { headerIcon }
                    </div>
                }
                <span className="content-card-header-text">{ header }</span>
            </div>
            <div className="content-card-body">
                { children }
            </div>
        </div>
    )
}

export function ContentCardAddButton({onClick}){

    return (
        <div className="content-card-add-btn">
            <AddElementButton onClick={onClick} center />
        </div>
    )
}