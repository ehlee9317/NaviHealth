import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  Button,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as firebase from "firebase";
import { loggingOut } from "../api/firebaseMethods";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function Profile({ navigation }) {
  const db = firebase.firestore()
  let currentUserUID = firebase.auth().currentUser.uid;
  const [firstName, setFirstName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    async function getUserInfo() {
      try {
        let doc = await db.collection("users")
          .doc(currentUserUID)
          .get();

        if (!doc.exists) {
          Alert.alert("No user data found!");
        } else {
          let dataObj = doc.data();
          setFirstName(dataObj.firstName);
          setHeight(dataObj.height);
          setWeight(dataObj.weight);
        }
      } catch (error) {
        console.log('something went wrong')
      }
    }
    getUserInfo();
  });

  const handlePress = () => {
    loggingOut();
    navigation.replace("Home");
  };

  const bmiCalculator = (height, weight) => {
    const weightKg = weight / 2.205
    const heightM = height / 100
    return (weightKg / (heightM**2)).toFixed(2)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <Text>Profile</Text> */}

      <View style={styles.imageContainer}>
        <View style={styles.profileImage}>
          <Image
            source={require("../assets/profilePic.jpg")}
            style={styles.image}
            resizeMode="center"
          ></Image>
        </View>
        <View style={styles.dm}>
          <MaterialIcons name="chat" size={18} color="#DFD8C8"></MaterialIcons>
        </View>
        <View style={styles.active}></View>
        <View style={styles.camera}>
          <Ionicons
            name="ios-camera"
            size={38}
            color="#DFD8C8"
            style={{ marginTop: 0.5, marginLeft: 1 }}
          ></Ionicons>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.text, { fontWeight: "200", fontSize: 34 }]}>
          {firstName}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsBox}>
          <Text style={[styles.text, { fontWeight: "300", fontSize: 34 }]}>
            27
          </Text >
          <Text style={[styles.text, styles.subText]}>Age</Text>
        </View>
        <View style={[styles.statsBox, { borderColor: "#DFD8C8", borderLeftWidth: 1, borderRightWidth: 1 }]}>
          <Text style={[styles.text, { fontWeight: "300", fontSize: 34 }]}>
            {bmiCalculator(height, weight)}
          </Text>
          <Text style={[styles.text, styles.subText]}>BMI</Text>
        </View>
        <View style={[styles.statsBox, { borderColor: "#DFD8C8", borderRightWidth: 1 }]}>
          <Text style={[styles.text, { fontWeight: "300", fontSize: 34 }]}>
            {height}
          </Text>
          <Text style={[styles.text, styles.subText]}>Height</Text>
        </View>
        <View style={styles.statsBox}>
          <Text style={[styles.text, { fontWeight: "300", fontSize: 34 }]}>
            {weight}
          </Text>
          <Text style={[styles.text, styles.subText]}>Weight</Text>
        </View>
      </View>

      <Button title="logout" style={styles.logOutButton} onPress={handlePress}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    top: "20%",
    fontSize: 40,
  },
  logOutButton: {
    fontSize: 20,
    right: "-38%",
    top: "-2400%",
  },
  logoutText: {
    fontSize: 16,
  },
  imageContainer: {
    alignSelf: "center",
    top: "-27%",
  },
  profileImage: {
    width: 195,
    height: 195,
    borderRadius: 100,
    overflow: "hidden",
  },
  image: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
  dm: {
    backgroundColor: "#41444B",
    position: "absolute",
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    backgroundColor: "#34FFB9",
    position: "absolute",
    bottom: 28,
    left: 10,
    padding: 4,
    height: 20,
    width: 20,
    borderRadius: 10,
  },
  camera: {
    backgroundColor: "#41444B",
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    alignSelf: "center",
    alignItems: "center",
    top: "-24%",
  },
  text: {
    fontFamily: "HelveticaNeue",
    color: "#52575D",
  },
  subText: {
    fontSize: 14,
    color: "#AEB5BC",
    fontWeight: "600"
  },
  statsContainer: {
    flexDirection: "row",
    alignSelf: "center",
    top: "-32%"
  },
  statsBox: {
    alignItems: "center",
    flex: 1,
  },
});
