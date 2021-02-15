import * as firebase from "firebase";
import "firebase/firestore";
import { Alert } from "react-native";
import {caloriesBurnedPerMinute} from "../api/caloriesFunction"
import { caloriesBurnedPerMinuteBiking } from "../api/caloriesFunction";

export async function registration(email, password, lastName, dateOfBirth, firstName, weight, height) {
  let velocityMilesPerHour = 3
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    const currentUser = firebase.auth().currentUser;

    const db = firebase.firestore();
    await db
      .collection("users")
      .doc(currentUser.uid)
      .set({
        email: currentUser.email,
        lastName: lastName,
        firstName: firstName,
        dateOfBirth: dateOfBirth,
        weight: weight,
        height: height,
        estCaloriesBurnedPerMinute: caloriesBurnedPerMinute(
          weight,
          height,
          velocityMilesPerHour
        ).toFixed(2),
        estCaloriesBurnedPerMinuteBiking: caloriesBurnedPerMinuteBiking(
          weight,
        ).toFixed(2),
        created: firebase.firestore.FieldValue.serverTimestamp(),
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


export async function stopNaviFirebaseHandler(actualDistance, actualDuration, actualDurationMin, estimatedDistance, estimatedDuration) {
  try {
    const currentUserUID = await firebase.auth().currentUser.uid;
    const db = firebase.firestore();
    const userData = await (await db.collection("users").doc(currentUserUID).get()).data()
    console.log('userdata------>', userData)
    const estCaloriesBurnedPerMinute = userData.estCaloriesBurnedPerMinute || 0
    const estCaloriesBurnedPerMinuteBiking = userData.estCaloriesBurnedPerMinuteBiking || 0
    await db.collection("routes").doc(currentUserUID).collection("sessions").doc().set({
      actualDistanceKm: actualDistance.toFixed(2),
      actualDuration: actualDuration,
      actualDurationMin: actualDurationMin,
      actualCaloriesBurned: Number(estCaloriesBurnedPerMinute * actualDurationMin + (estCaloriesBurnedPerMinuteBiking * actualDurationMin)).toFixed(2),
      estimatedDistanceKm: estimatedDistance.toFixed(2),
      estimatedDurationMin: estimatedDuration.toFixed(2),
      //to fix duration
      estCaloriesBurned: (estCaloriesBurnedPerMinute * estimatedDuration + estCaloriesBurnedPerMinuteBiking * estimatedDuration).toFixed(2),
      created: firebase.firestore.FieldValue.serverTimestamp(),
      date: new Date().toDateString(),
      timeStamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
   //  console.log('estCaloriesBurnedPerMinute ------->', estCaloriesBurnedPerMinute)
  } catch (err) {
    Alert.alert("There is something wrong!!!!", err.message);
  }
}

export async function updateProfile(email, password, lastName, dateOfBirth, firstName, weight, height) {
  let velocityMilesPerHour = 3
  try {
    const currentUser = await firebase.auth().currentUser;
    console.log("password--->", password)
    if(password){

     currentUser.updatePassword(password)

   }

    const db = firebase.firestore();
    await db
      .collection("users")
      .doc(currentUser.uid)
      .update({
        email: email,
        lastName: lastName,
        firstName: firstName,
        dateOfBirth: dateOfBirth,
        weight: weight,
        height: height,
        estCaloriesBurnedPerMinute: caloriesBurnedPerMinute(
          weight,
          height,
          velocityMilesPerHour
        ).toFixed(2),
        estCaloriesBurnedPerMinuteBiking: caloriesBurnedPerMinuteBiking(
          weight,
        ).toFixed(2),
      });
  } catch (err) {
    Alert.alert("Update Failed!", err.message);
  }
}
