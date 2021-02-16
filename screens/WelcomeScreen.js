import React from "react";
import { ImageBackground, StyleSheet, View, Text, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

function WelcomeScreen({ navigation }) {
  return (
    <ImageBackground
      style={styles.background}
      source={require("../assets/applogoNewColor.jpg")}
    >
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

    width: "100%",
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
  },
  signInButton: {
    width: 300,
    height: 50,

    backgroundColor: "#f7fff7",

    justifyContent: "center",
    alignItems: "center",
  },
  signUpButton: {
    width: 300,
    height: 50,

    backgroundColor: "#7598BD",
    bottom: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
  signInText: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
});

export default WelcomeScreen;
