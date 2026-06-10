import { View, Text } from 'react-native'
import React from 'react'
import { MyWrapper } from '../../../components/wrapper/MyWrapper'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { NotificationBubbleIcon } from '@hugeicons/core-free-icons'

const Home = () => {
  return (
    <MyWrapper>
      <Text>
      Since you are working in a bare Expo workflow (where you keep your native ios and android directories intact while leveraging Expo modules), the cleanest and most reliable way to handle custom fonts is using expo-font paired with expo-splash-screen
      </Text>


      <Text style={{ fontFamily: 'Jakarta-Regular' }}>Since you are working in a bare Expo workflow (where you keep your native ios and android directories intact while leveraging Expo modules), the cleanest and most reliable way to handle custom fonts is using expo-font paired with expo-splash-screen</Text>

      <HugeiconsIcon icon={NotificationBubbleIcon} size={24} color="black" />

    </MyWrapper>
  )
}

export default Home