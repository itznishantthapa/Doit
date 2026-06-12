import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Home from "../../features/home/screen/Home"
import Upload from "../../features/upload/screen/Upload"
import Pending from "../../features/pending/screen/Pending"
import Progress from "../../features/progress/screen/Progress"
import Completed from "../../features/completed/screen/Completed"
import All from "../../features/all/screen/All"
import Notification from "../../features/notification/screen/Notification"




const Stack = createNativeStackNavigator()

const UserNavigator = () => {
    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name='Home' component={Home} />
                <Stack.Screen name='Upload' component={Upload} />
                <Stack.Screen name='Pending' component={Pending} />
                <Stack.Screen name='Progress' component={Progress} />
                <Stack.Screen name='Completed' component={Completed} />
                <Stack.Screen name='All' component={All} />
                <Stack.Screen name='Notification' component={Notification} />

            </Stack.Navigator>
        </>

    )
}

export default UserNavigator