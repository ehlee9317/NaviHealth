import * as firebase from "firebase";
import "firebase/firestore";
import { Alert } from "react-native";

export async function registration(email, password, lastName, firstName, weight, height) {
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    const currentUser = firebase.auth().currentUser;

    const db = firebase.firestore();
    db.collection("users").doc(currentUser.uid).set({
      email: currentUser.email,
      lastName: lastName,
      firstName: firstName,
      weight: weight,
      height: height,
    });
  } catch (err) {
    Alert.alert("There is something wrong!!!!", err.message);
  }
}

export async function signIn(email, password) {
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (err) {
    Alert.alert("There is something wrong!", err.message);
  }
}

export async function loggingOut() {
  try {
    await firebase.auth().signOut();
  } catch (err) {
    Alert.alert("There is something wrong!", err.message);
  }
}


export async function stopNaviFirebaseHandler(distance, duration) {
   try {
     const currentUser = firebase.auth().currentUser;
     const db = firebase.firestore();
     db.collection("routes").doc(currentUser.uid).set({
       distance: distance,
       duration: duration
     });
   } catch (err) {
     Alert.alert("There is something wrong!!!!", err.message);
   }
}