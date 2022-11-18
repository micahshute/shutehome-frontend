export default function Card({ header, children, onClick, headerComponent=null}){

    return (
        <div className={`card ${onClick ? 'hover-pointer': ''}`} onClick={onClick}>
            { headerComponent }
            <div className="card-header">
                <p className="card-header-text">{ header }</p>
            </div>
            <div className="card-body">
                { children }
            </div>
        </div>
    )
}