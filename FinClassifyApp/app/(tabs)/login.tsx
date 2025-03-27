import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

const AuthScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
      <Text style={styles.subtitle}>
        {isLogin ? 'Sign in to continue where you left off.' : 'Join us and take control of your finances.'}
      </Text>

      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" placeholderTextColor="#666" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry placeholderTextColor="#666" />

      {!isLogin && <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry placeholderTextColor="#666" />}

      {isLogin && <Text style={styles.forgotPassword}>Forgot password?</Text>}

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <Text style={styles.toggleText} onPress={toggleAuthMode}>
        {isLogin ? 'No account? Sign up' : 'Already have an account? Log in'}
      </Text>

      <Text style={styles.orContinueText}>Or sign in with</Text>

      <View style={styles.socialIcons}>
        <Image source={require('../../assets/images/facebook.png')} style={styles.icon} />
        <Image source={require('../../assets/images/apple.png')} style={styles.icon} />
        <Image source={require('../../assets/images/google (1).png')} style={styles.icon} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#555', marginBottom: 20 },
  input: { width: '100%', padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 10, borderColor: '#CCC', backgroundColor: '#F9F9F9' },
  forgotPassword: { alignSelf: 'flex-end', color: '#007BFF', marginBottom: 10, fontSize: 14 },
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', shadowColor: '#007BFF', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  toggleText: { marginTop: 15, color: '#007BFF', fontSize: 14, fontWeight: 'bold' },
  orContinueText: { marginTop: 20, fontSize: 14, color: '#777' },
  socialIcons: { flexDirection: 'row', marginTop: 10 },
  icon: { width: 28, height: 28, marginHorizontal: 8 },
});

export default AuthScreen;