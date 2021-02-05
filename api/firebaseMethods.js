import * as firebase from "firebase";
import "firebase/firestore";
import { Alert } from "react-native";
import {caloriesBurnedPerMinute} from "../api/caloriesFunction"

export async function registration(email, password, lastName, firstName, weight, height) {
  let velocityMilesPerHour = 3
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    const currentUser = firebase.auth().currentUser;

    const db = firebase.firestore();
    await db.collection("users").doc(currentUser.uid).set({
      email: currentUser.email,
      lastName: lastName,
      firstName: firstName,
      weight: weight,
      height: height,
      estCaloriesBurnedPerMinute: caloriesBurnedPerMinute(weight, height, velocityMilesPerHour).toFixed(2),
      created: firebase.firestore.FieldValue.serverTimestamp()
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
     const currentUserUID = await firebase.auth().currentUser.uid;
     const db = firebase.firestore();
     const userData = await (await db.collection("users").doc(currentUserUID).get()).data()
     console.log('userdata------>', userData)
     const estCaloriesBurnedPerMinute = userData.estCaloriesBurnedPerMinute
     await db.collection("routes").doc(currentUserUID).collection("sessions").doc().set({
       distance: distance,
       duration: duration,
       estCaloriesBurned: estCaloriesBurnedPerMinute * Number(duration.slice(0, -5)),
       created: firebase.firestore.FieldValue.serverTimestamp(),
     })
     console.log('duration ------->', duration.slice(0, -5))
     console.log('estCaloriesBurned ------->', estCaloriesBurnedPerMinute)
   } catch (err) {
     Alert.alert("There is something wrong!!!!", err.message);
   }
}
