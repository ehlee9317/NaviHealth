import React, { Component } from "react";
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  Keyboard,
  Image,
  TouchableHighlight,
  SafeAreaView,
  ScrollView,
  Button,
} from "react-native";
import MapView, {
  Polyline,
  Marker,
  PROVIDER_GOOGLE,
  Callout,
  CalloutSubview,
} from "react-native-maps";
import { GOOGLE_API_KEY } from "../config/keys";
import _ from "lodash";
import PolyLine from "@mapbox/polyline";
import Icon from "react-native-vector-icons/Ionicons";
import { stopNaviFirebaseHandler } from "../api/firebaseMethods";
import haversine from "haversine";
import { TouchableOpacity } from "react-native-gesture-handler";

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      latitude: 0,
      longitude: 0,
      recordedLatitude: null,
      recordedLongitude: null,
      //recorded speed in kilometers per hour... initial recorded speed at meter per second
      recordedSpeed: null,
      recordedDistance: 0,
      //first element in the array will be void due to initial state for latitude and longitude being null
      recordedCoordinates: [],
      prevLatLng: {},
      //timer
      timer: null,
      hours: "00",
      minutes: "00",
      seconds: "00",
      miliseconds: "00",
      recordedDurationMin: null,
      recordedDuration: null,
      startDisabled: true,
      stopDisabled: false,
      //------
      destination: "",
      destinationPlaceId: "",
      predictions: [],
      yourLocation: "",
      yourLocationPlaceId: "",
      yourLocationPredictions: [],
      pointCoords: [],
      routingMode: false,
      displayMainSearchBar: true,
      //estimated Distance
      estimatedDistance: 0,
      estimatedDuration: 0,
      estimatedDurationText: "",
      selectedDestinationName: "",
      selectedYourLocationName: "",
      directions: [],
      subwayMode: false,
      navigationMode: "walk",
      subwayChart: {
        A: "#0039A6",
        C: "#0039A6",
        E: "#0039A6",
        B: "#FF6319",
        D: "#FF6319",
        F: "#FF6319",
        M: "#FF6319",
        G: "#6CBE45",
        J: "#996633",
        Z: "#996633",
        L: "#A7A9AC",
        N: "#FCCC0A",
        Q: "#FCCC0A",
        R: "#FCCC0A",
        S: "#808183",
        1: "#EE352E",
        2: "#EE352E",
        3: "#EE352E",
        4: "#00933C",
        5: "#00933C",
        "6X": "#00933C",
        7: "#B933AD",
      },
      //CitiBike States
      // citiBikeStationsData: [],
      // citiBikeDataRender: false,
      directionsMarkerArr: [],
      mapDirectionsMode: false,
    };
    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      1000
    );
    this.onChangeYourLocationDebounced = _.debounce(
      this.onChangeYourLocation,
      1000
    );
  }

  componentDidMount() {
    //Get current location and set initial region to this
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            recordedLatitude: position.coords.latitude,
            recordedLongitude: position.coords.longitude,
          },
          console.log("getCurrentPosition is Running")
        );
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        const newRecordedCoordinates = {
          latitude: this.state.recordedLatitude,
          longitude: this.state.recordedLongitude,
        };
        if (this.state.routingMode) {
          this.setState({
            recordedLatitude: position.coords.latitude,
            recordedLongitude: position.coords.longitude,
            //speed converted to kilometers per hour
            recordedSpeed: position.coords.speed * 3.6,
            recordedCoordinates: this.state.recordedCoordinates.concat([
              newRecordedCoordinates,
            ]),
            recordedDistance:
              this.state.recordedDistance +
              this.calcDistance(newRecordedCoordinates),
            prevLatLng: newRecordedCoordinates,
          });
        }
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
    this.goToMyLocation();
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
    clearInterval(this.state.timer);
  }

  // API DIRECTION CALLS
  async getRouteDirections(
    yourLocationPlaceId,
    destinationPlaceId,
    startingName,
    destinationName
  ) {
    if (this.state.navigationMode === "walk") {
      try {
        let apiUrl;
        if (yourLocationPlaceId) {
          apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${yourLocationPlaceId}&destination=place_id:${destinationPlaceId}&mode=walking&key=${GOOGLE_API_KEY}`;
        } else {
          apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&mode=walking&key=${GOOGLE_API_KEY}`;
        }
        const response = await fetch(apiUrl);
        const json = await response.json();
        const directionsArr = json.routes[0].legs[0].steps;
        const estimatedDistance = json.routes[0].legs[0].distance.value / 1000;
        const estimatedDuration = json.routes[0].legs[0].duration.value / 60;
        const estimatedDurationText = json.routes[0].legs[0].duration.text;
        const points = PolyLine.decode(json.routes[0].overview_polyline.points);
        const pointCoords = points.map((point) => {
          return { latitude: point[0], longitude: point[1] };
        });
        this.setState({
          pointCoords,
          predictions: [],
          yourLocationPredictions: [],
          estimatedDistance: estimatedDistance,
          estimatedDuration: estimatedDuration,
          estimatedDurationText: estimatedDurationText,
          directions: directionsArr,
        });
        destinationName
          ? this.setState({
              destination: destinationName,
            })
          : this.setState({
              yourLocation: startingName,
            });
        Keyboard.dismiss();
        this.map.fitToCoordinates(pointCoords, {
          edgePadding: { top: 110, right: 110, bottom: 110, left: 110 },
          animated: true,
        });
        this.pointByPointDirectionHandler();
      } catch (error) {
        console.error(error);
      }
    } else if (this.state.navigationMode === "subway") {
      try {
        let apiUrl;
        if (yourLocationPlaceId) {
          apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${yourLocationPlaceId}&destination=place_id:${destinationPlaceId}&mode=transit&transit_mode=subway&key=${GOOGLE_API_KEY}`;
        } else {
          apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&mode=transit&transit_mode=subway&key=${GOOGLE_API_KEY}`;
        }
        const response = await fetch(apiUrl);
        const json = await response.json();
        const directionsArr = json.routes[0].legs[0].steps;
        const estimatedDistance = json.routes[0].legs[0].distance.value / 1000;
        const estimatedDuration = json.routes[0].legs[0].duration.value / 60;
        const estimatedDurationText = json.routes[0].legs[0].duration.text;
        const points = PolyLine.decode(json.routes[0].overview_polyline.points);
        const pointCoords = points.map((point) => {
          return { latitude: point[0], longitude: point[1] };
        });
        this.setState({
          pointCoords,
          predictions: [],
          yourLocationPredictions: [],
          estimatedDistance: estimatedDistance,
          estimatedDuration: estimatedDuration,
          estimatedDurationText: estimatedDurationText,
          directions: directionsArr,
        });
        destinationName
          ? this.setState({
              destination: destinationName,
            })
          : this.setState({
              yourLocation: startingName,
            });
        Keyboard.dismiss();
        this.map.fitToCoordinates(pointCoords, {
          edgePadding: { top: 110, right: 110, bottom: 110, left: 110 },
          animated: true,
        });
        this.pointByPointDirectionHandler();
      } catch (error) {
        console.error(error);
      }
    } else if (this.state.navigationMode === "bike") {
      try {
        let apiUrl;
        if (yourLocationPlaceId) {
          apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${yourLocationPlaceId}&destination=place_id:${destinationPlaceId}&mode=bicycling&key=${GOOGLE_API_KEY}`;
        } else {
          apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&mode=bicycling&key=${GOOGLE_API_KEY}`;
        }
        const response = await fetch(apiUrl);
        const json = await response.json();
        const directionsArr = json.routes[0].legs[0].steps;
        const estimatedDistance = json.routes[0].legs[0].distance.value / 1000;
        const estimatedDuration = json.routes[0].legs[0].duration.value / 60;
        const estimatedDurationText = json.routes[0].legs[0].duration.text;
        const points = PolyLine.decode(json.routes[0].overview_polyline.points);
        const pointCoords = points.map((point) => {
          return { latitude: point[0], longitude: point[1] };
        });
        this.setState({
          pointCoords,
          predictions: [],
          yourLocationPredictions: [],
          estimatedDistance: estimatedDistance,
          estimatedDuration: estimatedDuration,
          estimatedDurationText: estimatedDurationText,
          directions: directionsArr,
        });
        destinationName
          ? this.setState({
              destination: destinationName,
            })
          : this.setState({
              yourLocation: startingName,
            });
        Keyboard.dismiss();
        this.map.fitToCoordinates(pointCoords, {
          edgePadding: { top: 110, right: 110, bottom: 110, left: 110 },
          animated: true,
        });
        this.pointByPointDirectionHandler();
      } catch (error) {
        console.error(error);
      }
    }
  }

  //GOOGLE PLACES PREDICTION CALLS
  async onChangeDestination(destination) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_API_KEY}
    &input=${destination}&location=${this.state.latitude},${this.state.longitude}&radius=1000`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async onChangeYourLocation(yourLocation) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_API_KEY}
    &input=${yourLocation}&location=${this.state.latitude},${this.state.longitude}&radius=1000`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        yourLocationPredictions: json.predictions,
      });
    } catch (err) {
      console.error(err);
    }
  }

  //CITI BIKE API CALLS

  // async getCitiBikeData() {
  //   const stationLocationUrl =
  //     "https://gbfs.citibikenyc.com/gbfs/en/station_information.json";
  //   const stationStatusUrl =
  //     "https://gbfs.citibikenyc.com/gbfs/en/station_status.json";
  //   try {
  //     const locationResult = await fetch(stationLocationUrl);
  //     const statusResult = await fetch(stationStatusUrl);
  //     const locationJson = await locationResult.json();
  //     const statusJson = await statusResult.json();
  //     const locationResponse = locationJson.data.stations;
  //     const statusResponse = statusJson.data.stations;
  //     let result = [];
  //     locationResponse.map((elem) => {
  //       for (let key in statusResponse) {
  //         let currObj = statusResponse[key];
  //         if (currObj["legacy_id"] === elem.legacy_id) {
  //           result.push({
  //             location: {
  //               latitude: elem.lat,
  //               longitude: elem.lon,
  //             },
  //             name: elem.name,
  //             bikesAvailable: currObj.num_bikes_available,
  //           });
  //         }
  //       }
  //     });
  //     this.setState({
  //       citiBikeStationsData: result,
  //     });
  //   } catch (err) {
  //     console.err(err);
  //   }
  // }

  //MOVE CAMERA BACK TO CURRENT LOCATION
  goToMyLocation() {
    // console.log("goToMyLocation is called");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (this.map) {
          this.map.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          });
        }
      },
      (error) => alert("Error: Are location services on?"),
      { enableHighAccuracy: true }
    );
  }

  //NAVI BUTTON HELPERS
  stopNaviHelper() {
    // console.log("stopNaviHelper is called");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (this.map) {
          this.map.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          });
        }
      },
      (error) => alert("Error: Are location services on?"),
      { enableHighAccuracy: true }
    );

    if (this.state.navigationMode === "walk") {
      stopNaviFirebaseHandler(
        this.state.recordedDistance,
        this.state.recordedDuration,
        this.state.recordedDurationMin,
        this.state.estimatedDistance,
        this.state.estimatedDuration
      );
    } else if (this.state.navigationMode === "subway") {
      console.log("pending updates for subway mode");
    }
  }
  startNaviHandler() {
    this.setState({
      routingMode: true,
    });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (this.map) {
          this.map.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }
      },
      (error) => alert("Error: Are location services on?"),
      { enableHighAccuracy: true }
    );
    this.timerStart();
  }
  stopNaviHandler() {
    this.setState({
      routingMode: false,
    });
    this.stopNaviHelper();
    this.timerStop();
    this.timerClear();
  }
  modeStopNaviHandler() {
    this.setState({
      routingMode: false,
    });
    // this.stopNaviHelper();
    this.timerStop();
    this.timerClear();
  }

  //SUBWAY + WALK + BIKE MODE Handlers

  async subwayModeHandler(
    yourLocationPlaceId,
    destinationPlaceId,
    startingName,
    destinationName
  ) {
    try {
      let apiUrl;
      if (yourLocationPlaceId) {
        apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${yourLocationPlaceId}&destination=place_id:${destinationPlaceId}&mode=transit&transit_mode=subway&key=${GOOGLE_API_KEY}`;
      } else {
        apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&mode=transit&transit_mode=subway&key=${GOOGLE_API_KEY}`;
      }
      const response = await fetch(apiUrl);
      const json = await response.json();
      const directionsArr = json.routes[0].legs[0].steps;
      const estimatedDistance = json.routes[0].legs[0].distance.value / 1000;
      const estimatedDuration = json.routes[0].legs[0].duration.value / 60;
      const estimatedDurationText = json.routes[0].legs[0].duration.text;
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map((point) => {
        return { latitude: point[0], longitude: point[1] };
      });
      this.setState({
        pointCoords,
        predictions: [],
        yourLocationPredictions: [],
        estimatedDistance: estimatedDistance,
        estimatedDuration: estimatedDuration,
        estimatedDurationText: estimatedDurationText,
        directions: directionsArr,
      });
      destinationName
        ? this.setState({
            destination: destinationName,
          })
        : this.setState({
            yourLocation: startingName,
          });
      Keyboard.dismiss();
      this.map.fitToCoordinates(pointCoords, {
        edgePadding: { top: 110, right: 110, bottom: 110, left: 110 },
        animated: true,
      });
      this.pointByPointDirectionHandler();
    } catch (error) {
      console.error(error);
    }
  }

  async walkModeHandler(
    yourLocationPlaceId,
    destinationPlaceId,
    startingName,
    destinationName
  ) {
    try {
      let apiUrl;
      if (yourLocationPlaceId) {
        apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${yourLocationPlaceId}&destination=place_id:${destinationPlaceId}&mode=walking&key=${GOOGLE_API_KEY}`;
      } else {
        apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&mode=walking&key=${GOOGLE_API_KEY}`;
      }
      const response = await fetch(apiUrl);
      const json = await response.json();
      const directionsArr = json.routes[0].legs[0].steps;
      const estimatedDistance = json.routes[0].legs[0].distance.value / 1000;
      const estimatedDuration = json.routes[0].legs[0].duration.value / 60;
      const estimatedDurationText = json.routes[0].legs[0].duration.text;
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map((point) => {
        return { latitude: point[0], longitude: point[1] };
      });
      this.setState({
        pointCoords,
        predictions: [],
        yourLocationPredictions: [],
        estimatedDistance: estimatedDistance,
        estimatedDuration: estimatedDuration,
        estimatedDurationText: estimatedDurationText,
        directions: directionsArr,
      });
      destinationName
        ? this.setState({
            destination: destinationName,
          })
        : this.setState({
            yourLocation: startingName,
          });
      Keyboard.dismiss();
      this.map.fitToCoordinates(pointCoords, {
        edgePadding: { top: 110, right: 110, bottom: 110, left: 110 },
        animated: true,
      });
      this.pointByPointDirectionHandler();
    } catch (error) {
      console.error(error);
    }
  }

  async bikeModeHandler(
    yourLocationPlaceId,
    destinationPlaceId,
    startingName,
    destinationName
  ) {
    try {
      let apiUrl;
      if (yourLocationPlaceId) {
        apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${yourLocationPlaceId}&destination=place_id:${destinationPlaceId}&mode=bicycling&key=${GOOGLE_API_KEY}`;
      } else {
        apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&mode=bicycling&key=${GOOGLE_API_KEY}`;
      }
      const response = await fetch(apiUrl);
      const json = await response.json();
      const directionsArr = json.routes[0].legs[0].steps;
      const estimatedDistance = json.routes[0].legs[0].distance.value / 1000;
      const estimatedDuration = json.routes[0].legs[0].duration.value / 60;
      const estimatedDurationText = json.routes[0].legs[0].duration.text;
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map((point) => {
        return { latitude: point[0], longitude: point[1] };
      });
      this.setState({
        pointCoords,
        predictions: [],
        yourLocationPredictions: [],
        estimatedDistance: estimatedDistance,
        estimatedDuration: estimatedDuration,
        estimatedDurationText: estimatedDurationText,
        directions: directionsArr,
      });
      destinationName
        ? this.setState({
            destination: destinationName,
          })
        : this.setState({
            yourLocation: startingName,
          });
      Keyboard.dismiss();
      this.map.fitToCoordinates(pointCoords, {
        edgePadding: { top: 110, right: 110, bottom: 110, left: 110 },
        animated: true,
      });
      this.pointByPointDirectionHandler();
      // this.getCitiBikeData();
    } catch (error) {
      console.error(error);
    }
  }

  //DISTANCE + TIMER HELPERS
  calcDistance(newLatLng) {
    const { prevLatLng } = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
  }

  //TIMER HELPERS
  timerStart() {
    var self = this;
    let timer = setInterval(() => {
      var miliseconds = (Number(this.state.miliseconds) + 1).toString(),
        second = this.state.seconds;
      minute = this.state.minutes;
      hour = this.state.hours;

      if (Number(this.state.miliseconds) == 99) {
        second = (Number(this.state.seconds) + 1).toString();
        miliseconds = "00";
      }
      if (Number(this.state.seconds) == 60) {
        minute = (Number(this.state.minutes) + 1).toString();
        second = "00";
      }
      if (Number(this.state.minutes) == 60) {
        hour = (Number(this.state.hours) + 1).toString();
        minute = "00";
      }
      self.setState({
        miliseconds: miliseconds.length == 1 ? "0" + miliseconds : miliseconds,
        seconds: second.length == 1 ? "0" + second : second,
        minutes: minute.length == 1 ? "0" + minute : minute,
        hours: hour.length == 1 ? "0" + hour : hour,
        recordedDurationMin: `${
          Number(this.state.hours) * 60 + Number(this.state.minutes)
        }`,
        recordedDuration: `${hour} : ${minute} : ${second}`,
      });
    }, 0);
    this.setState({
      timer,
    });
  }

  timerStop() {
    clearInterval(this.state.timer);
    this.setState({ startDisabled: false, stopDisabled: true });
  }

  timerClear() {
    this.setState({
      timer: null,
      minutes: "00",
      seconds: "00",
      hours: "00",
    });
  }
  pointByPointDirectionHandler() {
    this.setState({
      directionsMarkerArr: [],
    });
    const directions = this.state.directions;
    let finalDirectionsArr = [];
    let currDirectionDescription = "";
    let currDirectionCoordinates = {};
    let currDirectionManeuver = null;
    let currDirectionHeadSign = null;
    for (let i = 0; i < directions.length; i++) {
      let currDirection = directions[i];
      if (currDirection.html_instructions && !currDirection.steps) {
        currDirectionCoordinates = {
          latitude: currDirection.start_location.lat,
          longitude: currDirection.start_location.lng,
        };
        if (currDirection.headsign) {
          currDirectionHeadSign = currDirection.headsign;
        }
        if (currDirection.maneuver) {
          currDirectionManeuver = currDirection.maneuver;
        }
        let regexSanitizedCurrDirection = currDirection.html_instructions.replace(
          /(<([^>]+)>)/gi,
          ""
        );
        if (regexSanitizedCurrDirection.indexOf("(") !== -1) {
          currDirectionDescription = regexSanitizedCurrDirection.slice(
            0,
            regexSanitizedCurrDirection.indexOf("(")
          );
        } else {
          currDirectionDescription = regexSanitizedCurrDirection;
        }
      } else if (currDirection.html_instructions && currDirection.steps) {
        if (currDirection.html_instructions) {
          currDirectionDescription = currDirection.html_instructions.replace(
            /(<([^>]+)>)/gi,
            ""
          );
          currDirectionCoordinates = {
            latitude: currDirection.start_location.lat,
            longitude: currDirection.start_location.lng,
          };
          finalDirectionsArr.push({
            description: currDirectionDescription,
            coordinates: currDirectionCoordinates,
            maneuver: currDirectionManeuver,
            headsign: currDirectionHeadSign,
          });
        }
        if (currDirection.steps) {
          currDirection.steps.forEach((elem) => {
            let regexSanitizedCurrStepsDirection = elem.html_instructions.replace(
              /(<([^>]+)>)/gi,
              ""
            );
            currDirectionCoordinates = {
              latitude: elem.start_location.lat,
              longitude: elem.start_location.lng,
            };
            if (elem.maneuver) {
              currDirectionManeuver = elem.maneuver;
            }
            if (regexSanitizedCurrStepsDirection.indexOf("(") !== -1) {
              currDirectionDescription = regexSanitizedCurrStepsDirection.slice(
                0,
                regexSanitizedCurrStepsDirection.indexOf("(")
              );
            } else {
              currDirectionDescription = regexSanitizedCurrStepsDirection;
            }
            finalDirectionsArr.push({
              description: currDirectionDescription,
              coordinates: currDirectionCoordinates,
              maneuver: currDirectionManeuver,
              headsign: currDirectionHeadSign,
            });
          });
        }
      }
      finalDirectionsArr.push({
        description: currDirectionDescription,
        coordinates: currDirectionCoordinates,
        maneuver: currDirectionManeuver,
        headsign: currDirectionHeadSign,
      });
    }
    this.setState({
      directionsMarkerArr: finalDirectionsArr,
    });
  }

  render() {
    let marker = null;
    let locationMarker = null;
    if (this.state.pointCoords.length > 1) {
      marker = (
        <Marker
          coordinate={this.state.pointCoords[this.state.pointCoords.length - 1]}
          title={`${this.state.estimatedDurationText}`}
          description={`Distance: ${this.state.estimatedDistance.toFixed(
            1
          )} Kilometers`}
        >
          <Image
            source={require("../assets/redmarker.png")}
            style={styles.markerImage}
          />
        </Marker>
      );
      locationMarker = (
        <Marker coordinate={this.state.pointCoords[0]}>
          <Image
            source={require("../assets/bluemarker.png")}
            style={styles.markerImage}
          />
        </Marker>
      );
    }
    const predictions = this.state.predictions.map((prediction) => (
      <TouchableHighlight
        key={prediction.place_id}
        onPress={() => {
          this.getRouteDirections(
            null,
            prediction.place_id,
            null,
            prediction.structured_formatting.main_text
          );

          this.setState({
            displayMainSearchBar: false,
            destinationPlaceId: prediction.place_id,
            // destination:  prediction.structured_formatting.main_text,
          });
        }}
      >
        <View>
          <Text style={styles.suggestions}>{prediction.description}</Text>
        </View>
      </TouchableHighlight>
    ));

    const yourLocationPredictions = this.state.yourLocationPredictions.map(
      (prediction) => (
        <TouchableHighlight
          key={prediction.place_id}
          onPress={() => {
            this.walkModeHandler(
              prediction.place_id,
              this.state.destinationPlaceId,
              prediction.structured_formatting.main_text,
              this.state.destinationName
            );
            this.setState({
              displayMainSearchBar: false,
              yourLocationPlaceId: prediction.place_id,
              yourLocation: prediction.structured_formatting.main_text,
            });
          }}
        >
          <View>
            <Text style={styles.suggestions}>{prediction.description}</Text>
          </View>
        </TouchableHighlight>
      )
    );

    return (
      <View style={styles.container}>
        <MapView
          ref={(map) => {
            this.map = map;
          }}
          style={styles.map}
          showsUserLocation={true}
          followsUserLocation={this.state.routingMode}
        >
          {this.state.navigationMode === "walk" ? (
            <Polyline
              coordinates={this.state.pointCoords}
              strokeWidth={4}
              strokeColor="#49BEAA"
              // onPress={() => {
              //   console.log("hello");
              // }}
            />
          ) : this.state.navigationMode === "subway" ? (
            this.state.directions.map((elem, index) => {
              if (elem.travel_mode === "TRANSIT") {
                if (elem.transit_details.line.vehicle.type === "BUS") {
                  return (
                    <View key={index}>
                      <Polyline
                        coordinates={[
                          {
                            latitude: elem.start_location["lat"],
                            longitude: elem.start_location["lng"],
                          },
                          {
                            latitude: elem.end_location["lat"],
                            longitude: elem.end_location["lng"],
                          },
                        ]}
                        strokeWidth={4}
                        strokeColor="#4D5357"
                      />
                    </View>
                  );
                } else {
                  return (
                    <View key={index}>
                      <Polyline
                        coordinates={[
                          {
                            latitude: elem.start_location["lat"],
                            longitude: elem.start_location["lng"],
                          },
                          {
                            latitude: elem.end_location["lat"],
                            longitude: elem.end_location["lng"],
                          },
                        ]}
                        strokeWidth={4}
                        strokeColor={
                          this.state.subwayChart[
                            elem.transit_details.line.short_name
                          ]
                        }
                      />
                    </View>
                  );
                }
              } else {
                return (
                  <View key={index}>
                    <Polyline
                      coordinates={[
                        {
                          latitude: elem.start_location["lat"],
                          longitude: elem.start_location["lng"],
                        },
                        {
                          latitude: elem.end_location["lat"],
                          longitude: elem.end_location["lng"],
                        },
                      ]}
                      strokeWidth={4}
                      strokeColor="#49BEAA"
                    />
                  </View>
                );
              }
            })
          ) : this.state.navigationMode === "bike" ? (
            <Polyline
              coordinates={this.state.pointCoords}
              strokeWidth={4}
              strokeColor="#6AB3D9"
            />
          ) : (
            ""
          )}
          {/* Citibike Render */}
          {/* {this.state.citiBikeDataRender ? (
            this.state.citiBikeStationsData.map((elem) => {
              console.log("citibike coor");
              return (
                <Marker
                  key={elem.name}
                  coordinate={elem.location}
                  title={`Station ${elem.name}`}
                  description={`${String(
                    elem.bikesAvailable
                  )} bikes available!`}
                ></Marker>
              );
            })
          ) : (
            <Text></Text>
          )} */}
          {marker}
          {locationMarker}
          {this.state.mapDirectionsMode ? (
            this.state.directionsMarkerArr.map((elem, index) => {
              return (
                <Marker key={index} coordinate={elem.coordinates}>
                  <Callout>
                    <Text>
                      {elem.maneuver
                        ? elem.maneuver.toUpperCase()
                        : elem.headsign
                        ? elem.headsign.toUpperCase()
                        : ""}
                    </Text>
                    <Text>{elem.description}</Text>
                  </Callout>
                </Marker>
              );
            })
          ) : (
            <View></View>
          )}
        </MapView>

        {/* Main Search Bar */}
        {this.state.displayMainSearchBar ? (
          <View>
            <TextInput
              placeholder="Enter destination..."
              style={styles.destinationInput}
              value={this.state.destination}
              clearButtonMode="always"
              onChangeText={(destination) => {
                this.setState({ destination });
                this.onChangeDestinationDebounced(destination);
              }}
            />
            <View width="35%" marginTop="2%">
              <TouchableOpacity
                style={styles.yourLocationButtonContainer}
                onPress={() => this.goToMyLocation()}
              >
                <View style={styles.yourLocationIconContainer}>
                  <Icon
                    name="ios-radio-button-on-outline"
                    size={22}
                    color="white"
                  />
                  <Text style={styles.yourLocationButtonText}>Locate Me</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.searchContainer}>
            <SafeAreaView style={styles.inputContainer}>
              <TouchableHighlight
                onPress={() => {
                  console.log("back button clicked");
                  this.setState({
                    displayMainSearchBar: !this.state.displayMainSearchBar,
                  });
                }}
                style={styles.backIcon}
              >
                <Icon name="ios-chevron-back" size={30} color={"black"} />
              </TouchableHighlight>
              <View style={{ flex: 1 }}>
                <Image
                  source={require("../assets/bluemarker.png")}
                  style={styles.searchIcon}
                  onPress={() => {
                    this.getRouteDirections(
                      null,
                      this.state.destinationPlaceId,
                      null,
                      this.state.destination
                    ),
                      this.setState({
                        yourLocation: "",
                        yourLocationPlaceId: null,
                      });
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Your location"
                  style={styles.yourLocationInput}
                  value={this.state.yourLocation}
                  clearButtonMode="always"
                  onChangeText={(yourLocation) => {
                    this.setState({ yourLocation });
                    this.onChangeYourLocationDebounced(yourLocation);
                  }}
                />
              </View>
            </SafeAreaView>
            <SafeAreaView style={styles.destinationInputContainer}>
              <View style={{ flex: 1 }}>
                <Image
                  source={require("../assets/redmarker.png")}
                  style={styles.searchIcon}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="Enter destination..."
                  style={styles.destinationChangeInput}
                  value={this.state.destination}
                  clearButtonMode="always"
                  onChangeText={(destination) => {
                    // console.log(destination);
                    this.setState({
                      destination,
                    });
                    this.onChangeDestinationDebounced(destination);
                  }}
                />
              </View>
            </SafeAreaView>
            <ScrollView
              horizontal
              scrollEventThrottle={1}
              showsHorizontalScrollIndicator={false}
              height={100}
              style={styles.chipsScrollView}
              flex={1}
            >
              {/* {toggleCategories.map((category, index) => */}
              <TouchableOpacity
                style={
                  this.state.navigationMode === "subway"
                    ? styles.clickedChipsItem
                    : styles.chipsItem
                }
                onPress={() => (
                  this.modeStopNaviHandler(),
                  this.setState({
                    navigationMode: "subway",
                    mapDirectionsMode: false,
                  }),
                  this.subwayModeHandler(
                    this.state.yourLocationPlaceId,
                    this.state.destinationPlaceId,
                    this.state.yourLocation,
                    this.state.destination
                  )
                )}
              >
                <Icon
                  name="ios-subway-outline"
                  size={18}
                  style={
                    this.state.navigationMode === "subway"
                      ? styles.clickedChipsIcon
                      : styles.chipsIcon
                  }
                />
                <Text
                  style={
                    this.state.navigationMode === "subway"
                      ? styles.clickedChipText
                      : ""
                  }
                >
                  {this.state.navigationMode === "subway"
                    ? `${this.state.estimatedDurationText}`
                    : `subway`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  this.state.navigationMode === "walk"
                    ? styles.clickedChipsItem
                    : styles.chipsItem
                }
                onPress={() => (
                  this.modeStopNaviHandler(),
                  this.setState({
                    navigationMode: "walk",
                    mapDirectionsMode: false,
                  }),
                  this.walkModeHandler(
                    this.state.yourLocationPlaceId,
                    this.state.destinationPlaceId,
                    this.state.yourLocation,
                    this.state.destination
                  )
                )}
              >
                <Icon
                  name="ios-walk-outline"
                  size={18}
                  style={
                    this.state.navigationMode === "walk"
                      ? styles.clickedChipsIcon
                      : styles.chipsIcon
                  }
                />
                <Text
                  style={
                    this.state.navigationMode === "walk"
                      ? styles.clickedChipText
                      : ""
                  }
                >
                  {this.state.navigationMode === "walk"
                    ? `${this.state.estimatedDurationText}`
                    : `walk`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={
                  this.state.navigationMode === "bike"
                    ? styles.clickedChipsItem
                    : styles.chipsItem
                }
                onPress={() => (
                  this.modeStopNaviHandler(),
                  this.setState({
                    navigationMode: "bike",
                    mapDirectionsMode: false,
                  }),
                  this.bikeModeHandler(
                    this.state.yourLocationPlaceId,
                    this.state.destinationPlaceId,
                    this.state.yourLocation,
                    this.state.destination
                  )
                )}
              >
                <Icon
                  name="ios-bicycle-outline"
                  size={18}
                  style={
                    this.state.navigationMode === "bike"
                      ? styles.clickedChipsIcon
                      : styles.chipsIcon
                  }
                />
                <Text
                  style={
                    this.state.navigationMode === "bike"
                      ? styles.clickedChipText
                      : ""
                  }
                >
                  {this.state.navigationMode === "bike"
                    ? `${this.state.estimatedDurationText}`
                    : `bike`}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
        {predictions}
        {yourLocationPredictions}
        {this.state.estimatedDistance > 0 ? (
          this.state.displayMainSearchBar === true ? (
            <Text></Text>
          ) : this.state.routingMode === true ? (
            <View style={styles.sample}>
              <View width="40%" marginRight="1.5%">
                <TouchableOpacity
                  style={styles.stopButtonContainer}
                  onPress={() => {
                    this.stopNaviHandler();
                  }}
                >
                  <View style={styles.stopIconContainer}>
                    <Icon
                      name="ios-close-circle-outline"
                      size={25}
                      color="white"
                    />
                    <Text style={styles.stopButtonText}>Stop</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* Directions Button */}
              {/* <TouchableOpacity
                style={styles.directionButtonContainer}
                onPress={() => {
                  console.log("Button pressed");
                  this.props.navigation.navigate("Directions", {
                    directions: this.state.directions,
                  });
                }}
              >
                <View style={styles.directionIconContainer}>
                  <Icon name="ios-list-outline" size={25} color="#49BEAA" />
                  <Text style={styles.directionButtonText}>Directions</Text>
                </View>
              </TouchableOpacity> */}
              <View width="20%" marginRight="1.5%">
                <TouchableOpacity
                  style={styles.directionButtonContainer}
                  onPress={() => {
                    console.log("Button pressed");
                    this.state.mapDirectionsMode
                      ? this.setState({
                          mapDirectionsMode: false,
                        })
                      : this.setState({
                          mapDirectionsMode: true,
                        });
                  }}
                >
                  <View style={styles.directionIconContainer}>
                    <Icon name="trail-sign-outline" size={25} color="#49BEAA" />
                  </View>
                </TouchableOpacity>
              </View>

              <View width="20%">
                <TouchableOpacity
                  style={styles.yourLocationButtonContainer}
                  onPress={() => this.goToMyLocation()}
                >
                  <View style={styles.yourLocationIconContainer}>
                    <Icon
                      name="ios-radio-button-on-outline"
                      size={22}
                      color="white"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.sample}>
              <View width="40%" marginRight="1.5%">
                <TouchableOpacity
                  style={styles.startButtonContainer}
                  onPress={() => {
                    this.startNaviHandler();
                  }}
                >
                  <View style={styles.iconContainer}>
                    <Icon
                      style={styles.locateIcon}
                      name="ios-navigate"
                      size={22}
                    />
                    <Text style={styles.startButtonText}>Start</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* Directions */}
              {/* <TouchableOpacity
                style={styles.directionButtonContainer}
                onPress={() => {
                  console.log("Button pressed");
                  this.props.navigation.navigate("Directions", {
                    directions: this.state.directions,
                  });
                }}
              >
                <View style={styles.directionIconContainer}>
                  <Icon name="ios-list-outline" size={25} color="#49BEAA" />
                  <Text style={styles.directionButtonText}>Directions</Text>
                </View>
              </TouchableOpacity> */}
              <View width="20%" marginRight="1.5%">
                <TouchableOpacity
                  style={styles.directionButtonContainer}
                  onPress={() => {
                    console.log("Button pressed");
                    this.state.mapDirectionsMode
                      ? this.setState({
                          mapDirectionsMode: false,
                        })
                      : this.setState({
                          mapDirectionsMode: true,
                        });
                  }}
                >
                  <View style={styles.directionIconContainer}>
                    <Icon name="trail-sign-outline" size={25} color="#49BEAA" />
                  </View>
                </TouchableOpacity>
              </View>

              <View width="20%">
                <TouchableOpacity
                  style={styles.yourLocationButtonContainer}
                  onPress={() => this.goToMyLocation()}
                >
                  <View style={styles.yourLocationIconContainer}>
                    <Icon
                      name="ios-radio-button-on-outline"
                      size={22}
                      color="white"
                    />
                  </View>
                </TouchableOpacity>
              </View>
              {/* CitiBike Button Trigger */}
              {/* {this.state.navigationMode === "bike" ? (
                <TouchableOpacity
                  style={styles.yourLocationButtonContainer}
                  onPress={() =>
                    this.state.citiBikeDataRender === true
                      ? this.setState({
                          citiBikeDataRender: false,
                        })
                      : this.setState({
                          citiBikeDataRender: true,
                        })
                  }
                >
                  <View style={styles.yourLocationIconContainer}>
                    <Icon
                      name="ios-radio-button-on-outline"
                      size={22}
                      color="white"
                    />
                    <Text style={styles.yourLocationButtonText}>
                      Citi Bikes
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <Text></Text>
              )} */}
            </View>
          )
        ) : (
          <Text></Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sample: {
    // backgroundColor: "white",
    flexDirection: "row",
    marginTop: "1.5%",
  },
  suggestions: {
    backgroundColor: "white",
    padding: 5,
    fontSize: 18,
    borderWidth: 0.5,
    marginLeft: 5,
    marginRight: 5,
  },
  chipsScrollView: {
    position: "absolute",
    marginTop: "37.5%",
    // marginLeft: "5%",
    paddingHorizontal: 10,
  },
  chipsIcon: {
    marginRight: 5,
  },
  clickedChipsIcon: {
    marginRight: 5,
    color: "white",
  },
  chipsItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    height: 35,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  clickedChipsItem: {
    flexDirection: "row",
    backgroundColor: "#49BEAA",
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    height: 35,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  clickedChipText: {
    color: "white",
    fontWeight: "bold",
  },
  destinationInput: {
    height: 40,
    borderWidth: 0.5,
    marginTop: 80,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    backgroundColor: "white",
  },
  yourLocationInput: {
    height: 40,
    borderWidth: 0.5,
    marginLeft: "-76%",
    padding: 5,
    backgroundColor: "white",
    width: 290,
    justifyContent: "flex-end",
  },
  destinationChangeInput: {
    height: 40,
    borderWidth: 0.5,
    marginLeft: "-76%",
    padding: 5,
    backgroundColor: "white",
    width: 290,
  },
  searchContainer: {
    backgroundColor: "white",
    paddingBottom: "15%",
  },
  backIcon: {
    marginLeft: "2%",
    marginTop: "1%",
  },
  searchIcon: {
    justifyContent: "flex-start",
    marginLeft: "4%",
    marginTop: "4%",
    width: 18,
    height: 29,
  },
  icon: {},
  markerImage: {
    width: 20,
    height: 32,
    marginBottom: "8%",
  },
  inputContainer: {
    flexDirection: "row",
    marginTop: "2%",
  },
  destinationInputContainer: {
    flexDirection: "row",
    marginTop: "2%",
    marginLeft: "9.8%",
  },
  locateIconContainer: {
    width: 52,
    // backgroundColor: "white",
    marginLeft: "80%",
    marginTop: "130%",
    padding: "1.5%",
    borderRadius: 500,
    shadowColor: "rgba(0,0,0,0.7)",
    shadowRadius: 10,
    shadowOpacity: 0.5,
  },
  startButtonContainer: {
    backgroundColor: "#49BEAA",
    // width: "40%",
    height: 30,
    borderRadius: 100,
    margin: "1%",
  },
  iconContainer: {
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    padding: "3%",
  },
  startButtonText: {
    color: "white",
    marginLeft: "5%",
    fontWeight: "bold",
  },
  locateIcon: {
    transform: [{ rotate: "317deg" }],
    marginLeft: "-2%",
    marginTop: "0.5%",
    color: "white",
  },
  stopButtonContainer: {
    backgroundColor: "red",
    // width: "40%",
    height: 30,
    borderRadius: 100,
    margin: "1%",
  },
  stopIconContainer: {
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    // display: "flex",
    flexDirection: "row",
    padding: "1%",
  },
  stopButtonText: {
    color: "white",
    marginLeft: "4%",
    fontWeight: "bold",
  },
  directionButtonContainer: {
    backgroundColor: "white",
    // width: "40%",
    height: 30,
    borderRadius: 100,
    borderWidth: 0.2,
    borderColor: "#49BEAA",
    marginLeft: "1%",
  },
  directionIconContainer: {
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    padding: "1%",
  },
  directionButtonText: {
    color: "#49BEAA",
    marginLeft: "4%",
    fontWeight: "bold",
  },
  yourLocationButtonContainer: {
    backgroundColor: "#49BEAA",
    // width: "40%",
    height: 30,
    borderRadius: 100,
    borderWidth: 0.2,
    borderColor: "#49BEAA",
    marginLeft: "1%",
    marginTop: "1%",
  },
  yourLocationIconContainer: {
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    padding: "1%",
  },
  yourLocationButtonText: {
    color: "white",
    marginLeft: "4%",
    fontWeight: "bold",
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
