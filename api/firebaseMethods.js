import * as firebase from "firebase";
import "firebase/firestore";
import { Alert } from "react-native";
import {caloriesBurnedPerMinute} from "../api/caloriesFunction"

export async function registration(email, password, lastName, dateOfBirth, firstName, weight, height) {
  let velocityMilesPerHour = 3
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    const currentUser = firebase.auth().currentUser;

    const db = firebase.firestore();
    await db.collection("users").doc(currentUser.uid).set({
      email: currentUser.email,
      lastName: lastName,
      firstName: firstName,
      dateOfBirth: dateOfBirth,
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
       distanceKm: distance.toFixed(2),
       durationMin: duration.toFixed(2),
       estCaloriesBurned: (estCaloriesBurnedPerMinute * duration).toFixed(2),
       created: firebase.firestore.FieldValue.serverTimestamp(),
     })
     console.log('duration ------->', duration)
     console.log('estCaloriesBurned ------->', estCaloriesBurnedPerMinute)
   } catch (err) {
     Alert.alert("There is something wrong!!!!", err.message);
   }
}
