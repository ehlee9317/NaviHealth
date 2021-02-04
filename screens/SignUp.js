import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
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
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")

  const emptyState = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setWeight("");
    setHeight("");

  };

  const handlePress = () => {
    if (!firstName) {
      Alert.alert("First name is required");
    } else if (!email) {
      Alert.alert("Email field is required.");
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
      registration(email, password, lastName, firstName, weight, height);
      navigation.navigate("Loading");
      emptyState();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style= {styles.text}>Create an Account </Text>

        <ScrollView style={{padding:10, backgroundColor:"#EF767A"}}onBlur={Keyboard.dismiss}>
          <View style={{padding:10}}>
          <TextInput
            style = {{padding:15, fontSize:20, borderColor:"#456990", borderWidth:1, backgroundColor:"#f7fff7"}}
            placeholder="First Name"
            value={firstName}
            onChangeText={(name) => setFirstName(name)}
          />
          </View>
          <View style={{padding:10}}>
          <TextInput
            style = {{padding:15, fontSize:20, borderColor:"#456990", borderWidth:1, backgroundColor:"#f7fff7"}}
            placeholder="Last Name"
            value={lastName}
            onChangeText={(name) => setLastName(name)}
          />
          </View>
          <View style={{padding:10}}>
           <TextInput
            style = {{padding:15, fontSize:20, borderColor:"#456990", borderWidth:1, backgroundColor:"#f7fff7"}}
            placeholder="Enter your weight in lbs"
            value={weight}
            onChangeText={(weight)=>setWeight(weight)}
            keyboardType = "numeric"
            />
            </View>
            <View style={{padding:10}}>
           <TextInput
            style = {{padding:15, fontSize:20, borderColor:"#456990", borderWidth:1, backgroundColor:"#f7fff7"}}
            placeholder="Enter your height in cm"
            value={height}
            onChangeText={(height)=>setHeight(height)}
            keyboardType = "numeric"
            />
            </View>
          <View style={{padding:10}}>
          <TextInput
            style = {{padding:15, fontSize:20, borderColor:"#456990", borderWidth:1, backgroundColor:"#f7fff7"}}
            placeholder="Enter your email"
            value={email}
            onChangeText={(email) => setEmail(email)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          </View>
          <View style={{padding:10}}>
          <TextInput
            style = {{ padding:15, fontSize:20, borderColor:"#456990", borderWidth:1, backgroundColor:"#f7fff7"}}
            placeholder="Enter your password"
            value={password}
            onChangeText={(password) => setPassword(password)}
            secureTextEntry={true}
          />
          </View>

          <View style= {{padding:10}}>
          <TextInput
            style = {{padding:15, fontSize:20, borderColor:"#456990", borderWidth:1, backgroundColor:"#f7fff7"}}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={(password2) => setConfirmPassword(password2)}
            secureTextEntry={true}
          />
          </View>
          <View style={{padding:10}}>
          <TouchableOpacity onPress={handlePress}>
            <Text style = {{padding:20, fontSize:25, backgroundColor:"#456990", textAlign:"center"}}>Sign Up</Text>
          </TouchableOpacity>
          </View>
          <View style={{padding:10}}>
          <Text style = {{ fontSize:20, textAlign:"center"}}>Already have an account?</Text>
          </View>
          <View style={{padding:30}}>
          <TouchableOpacity onPress={() => navigation.navigate("Sign In")}>
            <Text style = {{padding:20, fontSize:20, backgroundColor:"#49BEAA", textAlign:"center"}}>Sign In</Text>
          </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: "#f7fff7",
    alignItems: "center",
    justifyContent:"center"
  },
  text: {
    padding: 60,
    fontSize: 30,
  }

})
