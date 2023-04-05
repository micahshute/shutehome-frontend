export default function Card({ header, children, onClick, headerComponent=null, img=null}){

    const renderImage = () => {
        if(!img) { return null }
        return (
            <img src={img} width="99%" style={{
                borderTopRightRadius: '30px',
                borderTopLeftRadius: '30px',
                paddingLeft: '2px',
            }}/>
        )
    }

    const renderStyles = () => {
        if(!img) return {}

        return {
            borderTopLeftRadius: '0px',
            borderTopRightRadius: '0px',
            borderTop: 'none'
        }
    }

    return (
        <>
            { renderImage() }
            <div className={`card ${onClick ? 'hover-pointer': ''}`} style={renderStyles()} onClick={onClick}>
                { headerComponent }
                <div className="card-header">
                    <p className="card-header-text">{ header }</p>
                </div>
                <div className="card-body">
                    { children }
                </div>
            </div>
        </>
    )
}