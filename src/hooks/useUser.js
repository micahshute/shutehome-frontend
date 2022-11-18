import { useContext } from "react";
import { UserContext } from "../contexts/userContext";


export function useUser(){
    const { user, login, logout, addBaby, deleteBaby, updateBaby } = useContext(UserContext)
    return {
        user,
        login,
        logout,
        addBaby,
        deleteBaby,
        updateBaby
    }
}