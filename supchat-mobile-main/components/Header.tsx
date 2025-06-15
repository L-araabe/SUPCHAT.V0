import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';

export default function Header({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <ThemedText type="title">{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
});
