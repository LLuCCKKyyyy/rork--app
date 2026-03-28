import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Briefcase } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import colors from '@/constants/colors';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const { login, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return;

    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !phone || !role) return;

    try {
      await register({ name, email, password, phone, role });
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRole('');
  };

  return (
    <View style={styles.backgroundContainer}>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Briefcase size={48} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.title}>现场作业管理</Text>
          <Text style={styles.subtitle}>ProjectSuite Pro</Text>
        </View>

        <View style={styles.form}>
          {isRegisterMode && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>姓名</Text>
              <TextInput
                style={styles.input}
                placeholder="输入您的姓名"
                placeholderTextColor={colors.textLight}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!isRegistering}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>邮箱</Text>
            <TextInput
              style={styles.input}
              placeholder="输入您的邮箱"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoggingIn && !isRegistering}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>密码</Text>
            <TextInput
              style={styles.input}
              placeholder="输入您的密码"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoggingIn && !isRegistering}
            />
          </View>

          {isRegisterMode && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>手机号码</Text>
                <TextInput
                  style={styles.input}
                  placeholder="输入您的手机号码"
                  placeholderTextColor={colors.textLight}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isRegistering}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>职位</Text>
                <TextInput
                  style={styles.input}
                  placeholder="输入您的职位 (如: 现场技术员)"
                  placeholderTextColor={colors.textLight}
                  value={role}
                  onChangeText={setRole}
                  autoCapitalize="words"
                  editable={!isRegistering}
                />
              </View>
            </>
          )}

          {(loginError || registerError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {isRegisterMode ? registerError?.message : loginError?.message}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              (isLoggingIn || isRegistering) && styles.buttonDisabled,
            ]}
            onPress={isRegisterMode ? handleRegister : handleLogin}
            disabled={
              (isLoggingIn || isRegistering) ||
              (isRegisterMode
                ? !name || !email || !password || !phone || !role
                : !email || !password)
            }
          >
            {isLoggingIn || isRegistering ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.buttonText}>
                {isRegisterMode ? '注册' : '登录'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleMode}
            disabled={isLoggingIn || isRegistering}
          >
            <Text style={styles.toggleButtonText}>
              {isRegisterMode ? '已有账号？点击登录' : '没有账号？点击注册'}
            </Text>
          </TouchableOpacity>

          {!isRegisterMode && (
            <View style={styles.demoInfo}>
              <Text style={styles.demoText}>演示账号:</Text>
              <Text style={styles.demoCredentials}>demo@example.com / demo123</Text>
              <Text style={styles.demoCredentials}>admin@example.com / admin123 (管理员)</Text>
            </View>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  toggleButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  demoInfo: {
    marginTop: 32,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  demoText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  demoCredentials: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
});
