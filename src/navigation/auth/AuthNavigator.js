import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Authentication from "../../features/auth/screen/Authentication"
import LegalWebView from "../../features/setting/screen/LegalWebView"

const Stack = createNativeStackNavigator()

const AuthNavigator = () => {
    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name='Authentication' component={Authentication} />
                <Stack.Screen name='LegalWebView' component={LegalWebView} />
            </Stack.Navigator>
        </>

    )
}

export default AuthNavigator