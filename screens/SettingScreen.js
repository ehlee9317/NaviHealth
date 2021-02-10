import React, {useEffect, useState} from "react";
import { View, Text, Button, StyleSheet, TextInput, ScrollView, Keyboard, SafeAreaView } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { loggingOut } from "../api/firebaseMethods";
import * as firebase from "firebase";
import {updateProfile} from "../api/firebaseMethods"


const SettingScreen = ({navigation}) => {
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
    async function getUserInfo() {
      try {
        let doc = await db.collection("users").doc(currentUserUID).get();

        if (!doc.exists) {
          Alert.alert("No user data found!");
        } else {
          let dataObj = doc.data();
          setFirstName(dataObj.firstName);
          setLastName(dataObj.lastName);
          setHeight(dataObj.height);
          setWeight(dataObj.weight);
          setDateOfBirth(dataObj.dateOfBirth);
          setEmail(dataObj.email);
          
        }
      } catch (error) {
        console.log("something went wrong");
      }
    }
    getUserInfo();
  }, [])
  
  
  const emptyState = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setWeight("");
    setHeight("");
    setDateOfBirth("");
  }

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
  }
  const handleUpdate = () => {
    // console.log(dataObj)
    // if (!firstName) {
    //   firstName = dataObj.firstName
    // } else if (!email) {
    //   email = dataObj.email
    // } else if (!dateOfBirth) {
    //   dateOfBirth = dataObj.dateOfBirth
    // } else if (!weight) {
    //   weight = dataObj.weight
    // } else if (!height) {
    //   height = dataObj.height
    // } else if (!password) {
    //   password = dataObj.password
    // } else if (password !== confirmPassword) {
    //   Alert.alert("Password does not match!");
    // } else {
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
      // }
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.signUpBox}>
        <Text style={styles.title}>Edit Your Account </Text>
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

          <TouchableOpacity style={styles.signUpButton} onPress={handleUpdate}>
            <Text style={styles.signUpText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.logOut} onPress={handlePress}>
        <Text style={styles.logOutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f7fff7",
    alignItems: "center",
  },
  signUpBox: {
    backgroundColor: "#456990",
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
    color: "#f7fff7",
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
    backgroundColor: "#EEB868",
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
  logOut: {
    marginTop: "5%", 
    backgroundColor:"#EF767A",
    padding:10, 
    borderRadius:5, 
   },
   logOutText: {
     color: "white",
     fontSize: 18, 
   }
});



export default SettingScreen;


