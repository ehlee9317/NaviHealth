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


export async function stopNaviFirebaseHandler(acutalDistance, actualDuration, estimatedDistance, estimatedDuration) {
   try {
     const currentUserUID = await firebase.auth().currentUser.uid;
     const db = firebase.firestore();
     const userData = await (await db.collection("users").doc(currentUserUID).get()).data()
    //  console.log('userdata------>', userData)
     const estCaloriesBurnedPerMinute = userData.estCaloriesBurnedPerMinute
     await db.collection("routes").doc(currentUserUID).collection("sessions").doc().set({
       actualDistanceKm: acutalDistance.toFixed(2),
       actualDuration: actualDuration,
       estimatedDistanceKm: estimatedDistance.toFixed(2),
       estimatedDurationMin: estimatedDuration.toFixed(2),
       //to fix duration
       estCaloriesBurned: (estCaloriesBurnedPerMinute * estimatedDuration).toFixed(2),
       created: firebase.firestore.FieldValue.serverTimestamp(),
     })
    //  console.log('estCaloriesBurnedPerMinute ------->', estCaloriesBurnedPerMinute)
   } catch (err) {
     Alert.alert("There is something wrong!!!!", err.message);
   }
}
