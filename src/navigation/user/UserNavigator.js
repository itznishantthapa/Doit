import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Home from "../../features/home/screen/Home"
import Upload from "../../features/upload/screen/Upload"




const Stack = createNativeStackNavigator()

const UserNavigator = () => {
    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name='Home' component={Home} />
                <Stack.Screen name='Upload' component={Upload} />
            </Stack.Navigator>
        </>

    )
}

export default UserNavigator