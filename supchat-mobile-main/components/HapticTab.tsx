import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function HapticTab(props: BottomTabBarButtonProps) {
  const theme = useColorScheme() ?? 'light';

  return (
    <PlatformPressable
      {...props}
      style={({ pressed }) => [
        { opacity: pressed ? 0.75 : 1 },
        // @ts-ignore typings don't include style in props
        (props as any).style,
      ]}
      android_ripple={{ color: Colors[theme].tint }}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
