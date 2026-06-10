import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Home from "../../features/home/screen/Home"




const Stack = createNativeStackNavigator()

const UserNavigator = () => {
    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name='Home' component={Home} />
            </Stack.Navigator>
        </>

    )
}

export default UserNavigator