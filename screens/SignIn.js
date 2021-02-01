import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, SafeAreaView } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { signIn } from "../api/firebaseMethods";

export default function SignIn({navigation}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handlePress = () => {
    if (!email) {
      Alert.alert("Email field is required.");
    }

    if (!password) {
      Alert.alert("Password field is required.");
    }

    signIn(email, password);
    setEmail("");
    setPassword("");
    navigation.navigate("Loading");
  };

  return (
    <SafeAreaView>
      <Text>Sign in to your account:</Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={(email) => setEmail(email)}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Enter your password"
        value={password}
        onChangeText={(password) => setPassword(password)}
        secureTextEntry={true}
      />

      <TouchableOpacity onPress={handlePress}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
