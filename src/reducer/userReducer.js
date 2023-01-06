
export function userReducer(state, action) {
    switch(action.type) {
        case 'SET_USER':
            return {
                ...state,
                hasLoaded: true,
                hasLoggedOut: false,
                user: action.payload.user
            }
        case 'REMOVE_USER':
            return {...state, hasLoggedOut: true, user: {}}
        case 'ADD_BABY':
            return {
                ...state,
                user: {
                    ...state.user,
                    babies: [...state.user.babies, action.payload]
                }
            }
        case 'DELETE_BABY': 
            const filteredBabies = state.user.babies.filter(babyData => babyData.id !== action.payload)
            return {
                ...state,
                user: {
                    ...state.user,
                    babies: filteredBabies,
                }
            }
        case 'UPDATE_BABY':
            const updatedBabies = state.user.babies.map(babyData => {
                if(babyData.id === action.payload.id){
                    return action.payload
                }
                return babyData
            })
            return {
                ...state,
                user: {
                    ...state.user,
                    babies: updatedBabies
                }
            }

        default:
            throw new Error()
    }
}