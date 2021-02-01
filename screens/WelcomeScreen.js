import {
  ImageBackground,
  StyleSheet,
  SafeAreaView,
  View,
  Text,
} from "react-native";
import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function WelcomeScreen({ navigation }) {
  return (
    //  <ImageBackground>
    <SafeAreaView>
      <View>
        <Text>Welcome to Firebase/Firestore Example</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Sign Up")}>
        <Text>Sign Up</Text>
      </TouchableOpacity>
      <Text>Already have an account?</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Sign In")}>
        <Text>Sign In</Text>
      </TouchableOpacity>
    </SafeAreaView>
    //  </ImageBackground>
  );
}
