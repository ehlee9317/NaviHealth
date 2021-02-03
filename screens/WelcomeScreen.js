// import {
//   ImageBackground,
//   StyleSheet,
//   SafeAreaView,
//   View,
//   Text,
// } from "react-native";
// import React from "react";
// import { TouchableOpacity } from "react-native-gesture-handler";

// export default function WelcomeScreen({ navigation }) {
//   return (
//     //  <ImageBackground>
//     <SafeAreaView>
//       <View>
//         <Text>Welcome to Firebase/Firestore Example</Text>
//       </View>
//       <TouchableOpacity onPress={() => navigation.navigate("Sign Up")}>
//         <Text>Sign Up</Text>
//       </TouchableOpacity>
//       <Text>Already have an account?</Text>
//       <TouchableOpacity onPress={() => navigation.navigate("Sign In")}>
//         <Text>Sign In</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//     //  </ImageBackground>
//   );
// }

import React from "react";
import { ImageBackground, StyleSheet, View, Text, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      style={styles.background}
      // resizeMode="center"
      source={require("../assets/navihealthLogo2.jpg")}
    >
      {/* // <Image resizeMode= "contain" style={styles.image} source={require("../assets/NaviHealthLogo2.jpg")}>

      // </Image> */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>NAVI</Text>
        <Text style={styles.title}>HEALTH</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate("Sign Up")}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
        {/* <Text style={styles.inlineText}>Already have an account?</Text> */}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate("Sign In")}
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    // backgroundColor: "navy",
    // padding: -10,
    width: "100%",
    // paddingTop: "10%",
    // paddingBottom: "10%"
    // paddingRight: "9%",
    // paddingLeft: "2%"
    // height: "80%",
    // aspectRatio: 1
  },
  image: {
    width: "50%",
    height: "60%",
  },
  titleContainer: {
    fontSize: 80,
    position: "absolute",
    top: "15%",
    color: "white",
    alignItems: "center",
  },
  title: {
    fontSize: 80,
    top: "40%",
    color: "white",

    // fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowOffset: { width: -2, height: 3 },
    textShadowRadius: 10,
  },
  buttonContainer: {
    marginBottom: "80%",
    position: "relative",
    alignItems: "center",
  },
  inlineText: {
    fontSize: 15,
    color: "white",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
    // top: "22%",
    // bottom: "120%"
  },
  signInButton: {
    width: 300,
    height: 50,
    // backgroundColor: "#ef767a",
    backgroundColor: "#f7fff7",
    // top: "68%",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpButton: {
    width: 300,
    height: 50,
    // backgroundColor: "#49beaa",
    backgroundColor: "#7598BD",
    bottom: "30%",
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 10,
    // marginBottom: 60
  },
  signUpText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
  signInText: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
    // textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
});

export default WelcomeScreen;
