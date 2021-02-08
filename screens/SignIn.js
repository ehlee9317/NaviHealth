import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { DarkTheme } from "react-native-paper";
import { signIn } from "../api/firebaseMethods";

export default function SignIn({ navigation }) {
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
    <SafeAreaView style={styles.container}>
      {/* <Image
            source={require("../assets/applogo.jpg")}
            style={styles.image}
            resizeMode="center"
          ></Image> */}
      <View style={styles.loginBox}>
        <Text style={styles.title}>Login to your Account</Text>
        <View style={styles.inputContainer}>
          <Text
            style={{
              fontSize: 14,
              marginLeft: "-47%",
              marginBottom: "4%",
              color: "#545a63",
            }}
          >
            Email Address
          </Text>
          <TextInput
            style={styles.input}
            paddingHorizontal={12}
            placeholder="email@example.com"
            value={email}
            onChangeText={(email) => setEmail(email)}
            autoCapitalize="none"
            borderRadius={5}
          />
          <Text
            style={{
              fontSize: 14,
              marginLeft: "-58%",
              marginTop: "10%",
              marginBottom: "4%",
              color: "#545a63",
            }}
          >
            Password
          </Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            paddingHorizontal={12}
            value={password}
            onChangeText={(password) => setPassword(password)}
            secureTextEntry={true}
            borderRadius={5}
          />
          <TouchableOpacity style={styles.loginButton} onPress={handlePress}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Sign Up")}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#456990",
    alignItems: "center",
  },
  loginBox: {
    backgroundColor: "#EAE9EC",
    // flex: 1,
    marginTop: "30%",
    padding: 5,
    borderRadius: 5,
    width: 280,
    height: 390,
  },
  title: {
    padding: 30,
    fontSize: 22,
    color: "#545a63",
  },
  inputContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    // borderBottomWidth:2,
    // borderWidth: 1,
    borderColor: "#456990",
    backgroundColor: "white",
    width: 220,
    height: 45,
    // fontSize: 20
  },
  // image: {
  //   width: 250,
  //   height: 250,
  //   padding: 20,
  // },
  loginButton: {
    backgroundColor: "#456990",
    borderRadius: 5,
    marginTop: "14%",
    // marginBottom: "-10%",
    justifyContent: "center",
    width: 220,
    height: 45,
    // paddingBottom: 30
  },
  loginText: {
    fontSize: 14,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  registerText: {
    fontSize: 12.5,
    marginTop: "7%",
    color: "white",
    fontWeight: "bold",
  },
});
