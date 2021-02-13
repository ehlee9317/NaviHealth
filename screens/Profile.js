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
import ProfileStats from './ProfileStatsScreen'
import { bmiCalculator, ageCalculator } from '../api/healthStatsMethods'

export default function Profile({ navigation }) {
  const db = firebase.firestore();
  let currentUserUID = firebase.auth().currentUser.uid;
  const [firstName, setFirstName] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  useEffect(
    () => {
      const unsubscribe = db
        .collection('users')
        .doc(currentUserUID)
        .onSnapshot(
          doc => {
            console.log("doc data --->", doc.data())
            let dataObj = doc.data();
            setFirstName(dataObj.firstName);
            setHeight(dataObj.height);
            setWeight(dataObj.weight);
            setDateOfBirth(dataObj.dateOfBirth);

          },
        )

      // returning the unsubscribe function will ensure that
      // we unsubscribe from document changes when our id
      // changes to a different value.
      return () => unsubscribe()
    },[])

  return (
    <SafeAreaView style={styles.container}>
      {/* <Text>Profile</Text> */}

      <View style={styles.imageContainer}>
        <View style={styles.profileImage}>
          <Image
            source={require("../assets/defaultProfile.png")}
            style={styles.image}
            resizeMode="center"
          ></Image>
        </View>
      </View>

      <View style={styles.nameContainer}>
        <Text style={[styles.text, { fontWeight: "200", fontSize: 34 }]}>
          {firstName}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsBox}>
          <Text style={[styles.text, { fontWeight: "300", fontSize: 34 }]}>
            {ageCalculator(dateOfBirth)}
          </Text>
          <Text style={[styles.text, styles.subText]}>Age</Text>
        </View>
        <View
          style={[
            styles.statsBox,
            { borderColor: "#DFD8C8", borderLeftWidth: 1, borderRightWidth: 1 },
          ]}
        >
          <Text style={[styles.text, { fontWeight: "300", fontSize: 34 }]}>
            {bmiCalculator(height, weight)}
          </Text>
          <Text style={[styles.text, styles.subText]}>BMI</Text>
        </View>
        <View
          style={[
            styles.statsBox,
            { borderColor: "#DFD8C8", borderRightWidth: 1 },
          ]}
        >
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
      <View style={styles.statsBox}>
        {<ProfileStats />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logOutButton: {
    // fontSize: 20,
    // right: "-38%",
    // top: "-2400%",
  },
  logoutText: {
    fontSize: 16,
  },
  imageContainer: {
    alignSelf: "center",
    top: "2%",
  },
  profileImage: {
    width: 195,
    height: 195,
    // borderRadius: 100,
    overflow: "hidden",
  },
  image: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
  nameContainer: {
    alignSelf: "center",
    alignItems: "center",
    top: "4%",
  },
  text: {
    fontFamily: "HelveticaNeue",
    color: "#52575D",
  },
  subText: {
    fontSize: 14,
    color: "#AEB5BC",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    alignSelf: "center",
    top: "13%",
  },
  statsBox: {
    alignItems: "center",
    flex: 1,
  },
  chartContainer: {
    alignSelf: "center",
    bottom: "2%"
  }
});
