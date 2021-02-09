import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  Label,
  Keyboard,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { registration } from "../api/firebaseMethods";

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nativeEventKey, setNativeEventKey] = useState("");

  const emptyState = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setWeight("");
    setHeight("");
    setDateOfBirth("");
  };

  const handlePress = () => {
    if (!firstName) {
      Alert.alert("First name is required");
    } else if (!email) {
      Alert.alert("Email field is required.");
    } else if (!dateOfBirth) {
      Alert.alert("Date of Birth field is required.");
    } else if (dateOfBirth.length === 10) {
      const dateArray = dateOfBirth.split("-");
      const month = dateArray[0];
      const day = dateArray[1];

      if (Number(month) > 12 || Number(month) === 0) {
        Alert.alert("Invalid Month");
      }

      if (Number(day) === 0 || Number(day) > 31) {
        Alert.alert("Invalid day");
      }
    } else if (!weight) {
      Alert.alert("Weight is required.");
    } else if (!height) {
      Alert.alert("Height is required.");
    } else if (!password) {
      Alert.alert("Password field is required.");
    } else if (!confirmPassword) {
      setPassword("");
      Alert.alert("Confirm password field is required.");
    } else if (password !== confirmPassword) {
      Alert.alert("Password does not match!");
    } else {
      registration(
        email,
        password,
        lastName,
        dateOfBirth,
        firstName,
        weight,
        height
      );

      navigation.navigate("Loading");
      emptyState();
    }
  };

  const dateOfBirthHandler = (inputtedValue) => {
    let temp = "";
    temp += inputtedValue;

    if (temp.length === 2 && nativeEventKey !== "Backspace") {
      temp += "-";
      console.log("##### temp", temp);
    } else if (temp.length === 5 && nativeEventKey !== "Backspace") {
      temp += "-";
    }

    if (temp.length <= 10) {
      setDateOfBirth(temp);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.signUpBox}>
        <Text style={styles.title}>Create Your Account </Text>
        <View style={styles.inputContainer} onBlur={Keyboard.dismiss}>
          <View style={{ padding: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={(name) => setFirstName(name)}
            />
          </View>
          <View style={{ padding: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={(name) => setLastName(name)}
            />
          </View>
          <View style={{ padding: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (MM-DD-YYYY)"
              value={dateOfBirth}
              onChangeText={(value) => {
                dateOfBirthHandler(value);
              }}
              onKeyPress={({ nativeEvent }) => {
                setNativeEventKey(nativeEvent.key);
              }}
              keyboardType="numeric"
            />
          </View>
          <View style={{ padding: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="Weight (lbs)"
              value={weight}
              onChangeText={(weight) => setWeight(weight)}
              keyboardType="numeric"
            />
          </View>
          <View style={{ padding: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="Height (cm)"
              value={height}
              onChangeText={(height) => setHeight(height)}
              keyboardType="numeric"
            />
          </View>
          <View style={{ padding: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(email) => setEmail(email)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={{ padding: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={(password) => setPassword(password)}
              secureTextEntry={true}
            />
          </View>

          <View style={{ padding: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(password2) => setConfirmPassword(password2)}
              secureTextEntry={true}
            />
          </View>

          <TouchableOpacity style={styles.signUpButton} onPress={handlePress}>
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Sign In")}>
        <Text style={styles.logInText}>Already have an account? Sign In</Text>
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
  signUpBox: {
    backgroundColor: "#EAE9EC",
    marginTop: "10%",
    padding: 5,
    borderRadius: 5,
    width: 280,
    height: 670,
  },
  title: {
    padding: 30,
    paddingTop: 20,
    paddingBottom: 10,
    fontSize: 22,
    color: "#545a63",
  },
  inputContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderColor: "#456990",
    backgroundColor: "white",
    width: 220,
    height: 45,
    borderRadius: 5,
    paddingHorizontal: 12,
  },
  signUpButton: {
    backgroundColor: "#456990",
    borderRadius: 5,
    marginTop: "5%",
    // marginBottom: "-10%",
    justifyContent: "center",
    width: 220,
    height: 45,
    // paddingBottom: 30
  },
  signUpText: {
    fontSize: 14,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  logInText: {
    fontSize: 12.5,
    marginTop: "7%",
    color: "white",
    fontWeight: "bold",
  },
});
