import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Alert } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as firebase from "firebase";
import { loggingOut } from "../api/firebaseMethods";

export default function Profile({ navigation }) {
  let currentUserUID = firebase.auth().currentUser.uid;
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    async function getUserInfo() {
      let doc = await firebase
        .firestore()
        .collection("users")
        .doc(currentUserUID)
        .get();

      if (!doc.exists) {
        Alert.alert("No user data found!");
      } else {
        let dataObj = doc.data();
        setFirstName(dataObj.firstName);
      }
    }
    getUserInfo();
  });

  const handlePress = () => {
    loggingOut();
    navigation.replace("Home");
  };

  return (
    <SafeAreaView>
      <Text>Profile</Text>
      <Text>Hi {firstName}</Text>
      <TouchableOpacity onPress={handlePress}>
        <Text>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
