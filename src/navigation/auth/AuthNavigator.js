import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Authentication from "../../features/auth/screen/Authentication"




const Stack = createNativeStackNavigator()

const AuthNavigator = () => {

    
    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name='Authentication' component={Authentication} />
            </Stack.Navigator>
        </>

    )
}

export default AuthNavigator