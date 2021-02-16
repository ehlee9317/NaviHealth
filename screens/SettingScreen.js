import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  ScrollView,
  Keyboard,
  SafeAreaView,
  Alert,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { loggingOut } from "../api/firebaseMethods";
import * as firebase from "firebase";
import { updateProfile } from "../api/firebaseMethods";
import Icon from "react-native-vector-icons/Ionicons";

const SettingScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nativeEventKey, setNativeEventKey] = useState("");
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;

  useEffect(() => {
    const unsubscribe = db
      .collection("users")
      .doc(currentUserUID)
      .onSnapshot((doc) => {
        console.log("doc data --->", doc.data());
        let dataObj = doc.data();
        setFirstName(dataObj.firstName);
        setLastName(dataObj.lastName);
        setHeight(dataObj.height);
        setWeight(dataObj.weight);
        setDateOfBirth(dataObj.dateOfBirth);
        setEmail(dataObj.email);
        setPassword(dataObj.password);
      });
    return () => unsubscribe();
  }, []);

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
  const handlePress = () => {
    loggingOut();
    navigation.replace("Home");
  };

  const handlePressGettingStarted = () => {
    navigation.replace("GetStarted");
  };

  const handleUpdate = () => {
    updateProfile(
      email,
      password,
      lastName,
      dateOfBirth,
      firstName,
      weight,
      height
    );

    navigation.navigate("Profile");
    emptyState();
    
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edit Your Account </Text>
      <View style={styles.editBox}>
        <View style={styles.inputContainer} onBlur={Keyboard.dismiss}>
          <View style={styles.singleInputContainer}>
            <Icon name="ios-person-outline" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={(name) => setFirstName(name)}
            />
          </View>
          <View style={styles.singleInputContainer}>
            <Icon name="ios-person-outline" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={(name) => setLastName(name)}
            />
          </View>
          <View style={styles.singleInputContainer}>
            <Icon name="ios-calendar-outline" style={styles.icon} />
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
          <View style={styles.singleInputContainer}>
            <Icon name="ios-barbell-outline" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Weight (lbs)"
              value={weight}
              onChangeText={(weight) => setWeight(weight)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.singleInputContainer}>
            <Icon name="ios-man-outline" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Height (cm)"
              value={height}
              onChangeText={(height) => setHeight(height)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.singleInputContainer}>
            <Icon name="ios-mail-outline" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(email) => setEmail(email)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.singleInputContainer}>
            <Icon name="ios-lock-closed-outline" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={(password) => setPassword(password)}
              secureTextEntry={true}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
          <Text style={styles.updateText}>Update</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePress} style={styles.signOutContainer}>
          <Text style={styles.signOutText}>Change user? Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startContainer}
          // marginTop="10%"
          onPress={handlePressGettingStarted}
        >
          <Text style={styles.signOutText}>Getting Started?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    alignContent: "center",
  },
  editBox: {
    marginTop: "10%",
    borderRadius: 20,
    width: 260,
    height: 670,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: "10%",
    marginLeft: "-10%",
  },
 singleInputContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    margin: ".5%",
    borderRadius: 100,
    marginRight: "3%",
    
  },
  icon: {
    fontSize: 35,
    marginLeft: "5%",
    marginTop: "2.2%",
    marginRight: "2%",
  },
  input: {
    borderColor: "#456990",
    backgroundColor: "white",
    width: 260,
    height: 55,
    fontSize: 18,
    

    paddingHorizontal: 12,
    justifyContent: "center",
    alignContent: "center",
  },
  updateButton: {
    backgroundColor: "#456990",
    borderRadius: 5,
    marginTop: "10%",
    justifyContent: "center",
    width: 180,
    height: 40,
  },
  updateText: {
    fontSize: 18,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  signOutContainer: {
    marginTop: "8%",
  },
  startContainer: {
    marginTop: "5%",
  },
  signOutText: {
    fontSize: 13,
    marginTop: "3%",
    color: "#818882",
    fontWeight: "bold",
  },
});

export default SettingScreen;
