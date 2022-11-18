
export function userReducer(state, action) {
    switch(action.type) {
        case 'SET_USER':
            return action.payload.user
        case 'REMOVE_USER':
            return {}
        case 'ADD_BABY':
            return {
                ...state,
                babies: [...state.babies, action.payload]
            }
        case 'DELETE_BABY': 
            const filteredBabies = state.babies.filter(babyData => babyData.id !== action.payload)
            return {
                ...state,
                babies: filteredBabies
            }
        case 'UPDATE_BABY':
            const updatedBabies = state.babies.map(babyData => {
                if(babyData.id === action.payload.id){
                    return action.payload
                }
                return babyData
            })
            return {
                ...state,
                babies: updatedBabies
            }

        default:
            throw new Error()
    }
}