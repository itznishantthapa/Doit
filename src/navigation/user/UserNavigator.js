import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Home from "../../features/home/screen/Home"
import Upload from "../../features/upload/screen/Upload"
import All from "../../features/all/screen/All"
import Completed from "../../features/completed/screen/Completed"
import Pending from "../../features/pending/screen/Pending"
import Chat from "../../features/chat/screen/Chat"




const Stack = createNativeStackNavigator()

const UserNavigator = () => {
    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name='Home' component={Home} />
                <Stack.Screen name='Upload' component={Upload} />
                <Stack.Screen name='All' component={All} />
                <Stack.Screen name='Completed' component={Completed} />
                <Stack.Screen name='Pending' component={Pending} />
                <Stack.Screen name='Chat' component={Chat} />
            </Stack.Navigator>
        </>

    )
}

export default UserNavigator