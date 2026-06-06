
import { View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export const MyWrapper = ({ children, style, enableTopInset = true, enableBottomInset = true, statusBarStyle = 'dark-content' }) => {
  const inset = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          flex:1,
          paddingTop: enableTopInset ? inset.top : 0,
          paddingBottom: enableBottomInset ? inset.bottom : 0,
        },
        style,
      ]}
    >
    <StatusBar barStyle={statusBarStyle} translucent={true} backgroundColor={'transparent'}/>
      {children}
    </View>
  );
};
 
