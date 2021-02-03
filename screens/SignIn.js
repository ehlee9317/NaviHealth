import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, SafeAreaView, Image} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { DarkTheme } from "react-native-paper";
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
    <SafeAreaView style={styles.container}>
      <Text style = {styles.text}>Account Login</Text>
      <Image
            source={require("../assets/applogo.jpg")}
            style={styles.image}
            resizeMode="center"
          ></Image>
      <View style={{flex:1, padding:40}}>
      <Text style={{fontSize:15, paddingBottom:10,}}>EMAIL</Text>
      <TextInput
        style= {styles.input}
        placeholder="Please enter your email"
        value={email}
        onChangeText={(email) => setEmail(email)}
        autoCapitalize="none"
      />
      <Text style={{fontSize:15, paddingBottom:10, paddingTop:10,}}>PASSWORD</Text>
      <TextInput
        style= {styles.input}
        placeholder="Please enter your password"
        value={password}
        onChangeText={(password) => setPassword(password)}
        secureTextEntry={true}
      />
      <View style={{paddingBottom:30, paddingTop:30, textAlign:"center"}}>
      <TouchableOpacity onPress={handlePress}>
        <Text style={styles.login}>Login</Text>
      </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex:1, 
    backgroundColor: "#f7fff7",
    alignItems: "center",
    
  },
  text: {
    padding: 60, 
    fontSize: 40,
  },
  input: {
    borderBottomWidth:2, 
    borderColor: "#456990",
    fontSize: 20
  },
  image:{
    width:250, 
    height:250,
    padding:20,
  },
  login:{
    fontSize:30,
    backgroundColor:"#49BEAA",
    padding:10,
    textAlign:"center",
  }
})