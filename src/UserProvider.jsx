import { useEffect, useMemo, useReducer } from "react"
import { UserContext } from "./contexts/userContext"
import { useRest } from "./hooks/useRest"
import Landing from "./Landing"
import { userReducer } from "./reducer/userReducer"

export default function UserProvider({ LoginApp, children}){

  const [state, dispatch] = useReducer(userReducer, {})
  const {data, error, loading } = useRest('/me', "get") 

  const userData = useMemo(() => ({
    user: state,
    logout: () => dispatch({ type: "REMOVE_USER"}),
    login: (user) => dispatch({ type: "SET_USER",  payload: user }),
    addBaby: (babyData) => dispatch({type: "ADD_BABY", payload: babyData}),
    deleteBaby: (babyId) => dispatch({ type: "DELETE_BABY", payload: babyId}),
    updateBaby: (babyData) => dispatch({ type: "UPDATE_BABY", payload: babyData})
  }), [state, dispatch])

  useEffect(() => {
    if(data && !error && !loading && Object.keys(userData.user).length === 0){
      userData.login({ user: data })
    }
  }, [data, error, loading, userData])

  const noUser = !userData?.user || Object.keys(userData.user).length === 0

  const renderChildren = () => {
    if(loading){
      return (
        <Landing />
      )
    }else if(noUser){
      return (
        <LoginApp />
      )
    }
    return children
  }

  return (
    <UserContext.Provider value={userData}>
      { renderChildren() }
    </UserContext.Provider>
  )
}