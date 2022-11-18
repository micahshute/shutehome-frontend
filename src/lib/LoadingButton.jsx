

export default function LoadingButton({text, loading, onClick, type="primary", className=""}){

    const renderSpinner = () => (
        <div className="loader">Loading...</div>
    )

    const renderButtonContents = () => {
        if(loading){
            return renderSpinner()
        }

        return text
    }

    return(
        <button className={`btn btn-${type} ${className}`} onClick={onClick}>{renderButtonContents()}</button>
    )
}