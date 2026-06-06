import { useIsRestoring } from "@tanstack/react-query"
import { useAuth } from "../features/auth/hook/useAuth"
import { NavigationContainer } from "@react-navigation/native"
import UserNavigator from "../navigation/user/UserNavigator"
import AuthNavigator from "../navigation/auth/AuthNavigator"




const Main = () => {
    const { authUser, isLoading } = useAuth()
    const isRestoring = useIsRestoring()

    if (isRestoring || isLoading) {
        return null
    }

    return (
        <NavigationContainer>
            {authUser ? (<UserNavigator />) : (<AuthNavigator />)}
        </NavigationContainer>

    )
}

export default Main
