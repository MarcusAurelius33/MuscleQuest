import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * AppAlert — modal customizado no estilo do app.
 *
 * Props:
 *   visible: bool
 *   title: string
 *   message: string
 *   buttons: Array<{ text: string, onPress?: () => void, style?: 'default' | 'cancel' | 'destructive' }>
 */
export default function AppAlert({ visible, title, message, buttons = [] }) {
  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={[styles.buttonRow, buttons.length === 1 && styles.buttonRowSingle]}>
            {buttons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.button,
                  btn.style === 'cancel' && styles.buttonCancel,
                  btn.style === 'destructive' && styles.buttonDestructive,
                  btn.style !== 'cancel' && btn.style !== 'destructive' && styles.buttonDefault,
                ]}
                onPress={btn.onPress}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.buttonText,
                    btn.style === 'cancel' && styles.buttonTextCancel,
                    btn.style === 'destructive' && styles.buttonTextDestructive,
                  ]}
                >
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  box: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 12,
  },
  title: {
    color: '#00FF66',
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  buttonRowSingle: {
    justifyContent: 'flex-end',
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDefault: {
    backgroundColor: '#00FF66',
  },
  buttonCancel: {
    backgroundColor: '#2A2A2A',
  },
  buttonDestructive: {
    backgroundColor: '#FF444420',
    borderWidth: 1,
    borderColor: '#FF444460',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#1A1A1A',
  },
  buttonTextCancel: {
    color: '#AAAAAA',
  },
  buttonTextDestructive: {
    color: '#FF4444',
  },
});
