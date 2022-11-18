

export default function AddElementButton({onClick,loading, center=false, className=""}){

    let divKlass = `add-button mt-30 ${className}`
    if(center){
        divKlass += " center"
    }

    return(
        <div
            disabled={loading} 
            onClick={onClick}
            className={divKlass}
        ></div>
    )
}