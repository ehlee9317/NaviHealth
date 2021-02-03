
import React, { Component } from "react";
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  Keyboard,
  TouchableHighlight,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import { GOOGLE_API_KEY } from '../config/keys';
import _ from "lodash";
import PolyLine from "@mapbox/polyline";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      latitude: 0,
      longitude: 0,
      destination: "",
      predictions: [],
      pointCoords: [],
    };
    this.onChangeDestinationDebounced = _.debounce(
      this.onChangeDestination,
      1000
    );
  }

  componentDidMount() {
    //Get current location and set initial region to this
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    );
  }

  async getRouteDirections(destinationPlaceId, destinationName) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&key=${GOOGLE_API_KEY}`
      );
      const json = await response.json();
      console.log(json);
      const points = PolyLine.decode(json.routes[0].overview_polyline.points);
      const pointCoords = points.map((point) => {
        return { latitude: point[0], longitude: point[1] };
      });
      this.setState({
        pointCoords,
        predictions: [],
        destination: destinationName,
      });
      Keyboard.dismiss();
      this.map.fitToCoordinates(pointCoords);
    } catch (error) {
      console.error(error);
    }
  }

  async onChangeDestination(destination) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_API_KEY}
    &input=${destination}&location=${this.state.latitude},${this.state.longitude}&radius=2000`;
    console.log(apiUrl);
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions,
      });
      console.log(json);
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    let marker = null;

    if (this.state.pointCoords.length > 1) {
      marker = (
        <Marker
          coordinate={this.state.pointCoords[this.state.pointCoords.length - 1]}
        />
      );
    }

    const predictions = this.state.predictions.map((prediction) => (
      <TouchableHighlight
        onPress={() =>
          this.getRouteDirections(
            prediction.place_id,
            prediction.structured_formatting.main_text
          )
        }
        key={prediction.id}
      >
        <View>
          <Text style={styles.suggestions}>
            {prediction.structured_formatting.main_text}
          </Text>
        </View>
      </TouchableHighlight>
    ));

    return (
      <View style={styles.container}>
        <MapView
          ref={(map) => {
            this.map = map;
          }}
          style={styles.map}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.0121,
          }}
          showsUserLocation={true}
        >
          <Polyline
            coordinates={this.state.pointCoords}
            strokeWidth={4}
            strokeColor="#49BEAA"
          />
          {marker}
        </MapView>
        <TextInput
          placeholder="Enter destination..."
          style={styles.destinationInput}
          value={this.state.destination}
          clearButtonMode="always"
          onChangeText={(destination) => {
            console.log(destination);
            this.setState({ destination });
            this.onChangeDestinationDebounced(destination);
          }}
        />
        {predictions}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  suggestions: {
    backgroundColor: "white",
    padding: 5,
    fontSize: 18,
    borderWidth: 0.5,
    marginLeft: 5,
    marginRight: 5,
  },
  destinationInput: {
    height: 40,
    borderWidth: 0.5,
    marginTop: 50,
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    backgroundColor: "white",
  },
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

//DEPRECATED with BUgs


// import React from 'react';
// import {
//   AppRegistry,
//   StyleSheet,
//   View,
//   Dimensions,
//   Text,
//   SafeAreaView,
//   TextInput,
//   Keyboard,
//   TouchableHighlight
// } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE, PolyLine} from 'react-native-maps';
// import Polyline from '@mapbox/polyline';
// import { GOOGLE_API_KEY } from '../config/keys';
// import _ from 'lodash';
// // import { TextInput } from 'react-native-gesture-handler';

// let { width, height } = Dimensions.get('window');
// const ASPECT_RATIO = width / height;
// const LATITUDE = 0;
// const LONGITUDE = 0;
// const LATITUDE_DELTA = 0.007;
// const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// export default class Map extends React.Component {
//   constructor() {
//     super();
//     this.state = {
//       region: {
//         latitude: LATITUDE,
//         longitude: LONGITUDE,
//         latitudeDelta: LATITUDE_DELTA,
//         longitudeDelta: LONGITUDE_DELTA,
//       },
//       error: null,
//       destination: "",
//       pointCoords: [],
//       predictions: [],
//     };
//     // waits 1 sec after user types in input field before pinging API:
//     this.onChangeDestinationDebounced = _.debounce(
//       this.onChangeDestination,
//       5000
//     );
//   }
//   componentDidMount() {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         this.setState({
//           region: {
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//             latitudeDelta: LATITUDE_DELTA,
//             longitudeDelta: LONGITUDE_DELTA,
//           },
//           error: null,
//           locationPredictions: [],
//           pointCoords: [],
//         });
//       },
//       (error) => this.setState({ error: error.message }),
//       { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
//     );
//     this.getDirections();
//   }
//   async getRouteDirections(destinationPlaceId, destinationName) {
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&key=${GOOGLE_API_KEY}`
//       );
//       const json = await response.json();
//       console.log(json);
//       const points = PolyLine.decode(json.routes[0].overview_polyline.points);
//       const pointCoords = points.map((point) => {
//         return { latitude: point[0], longitude: point[1] };
//       });
//       this.setState({
//         pointCoords,
//         predictions: [],
//         destination: destinationName,
//       });
//       Keyboard.dismiss();
//       this.map.fitToCoordinates(pointCoords);
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   async getDirections(startLoc, destinationLoc) {
//     try {
//       const res = await fetch(
//         `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${GOOGLE_API_KEY}`
//       );
//       const json = await res.json();
//       const points = Polyline.decode(json.routes[0].overview_polyline.points);
//       const pointCoords = points.map((point) => {
//         return { latitude: point[0], longitude: point[1] };
//       });
//       this.setState({ pointCoords });
//     } catch (error) {
//       console.error(error);
//     }
//   }
//   // function renders places autocomplete
//   async onChangeDestination(destination) {
//     console.log('destination----->', destination)
//     this.setState({ destination });
//     const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_API_KEY}&input=${destination}&location=${this.state.latitude},${this.state.longitude}&radius=2000`;
//     try {
//       const result = await fetch(apiUrl);
//       const json = await result.json();
//       this.setState({
//         predictions: json.predictions,
//       });
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   render() {
//     const predictions = this.state.predictions.map((prediction) => (
//       <SafeAreaView>
//         <TouchableHighlight
//           onPress={() =>
//             this.getRouteDirections(
//               prediction.place_id,
//               prediction.structured_formatting.main_text
//             )
//           }
//           key={prediction.id}
//         >
//           <SafeAreaView>
//               <Text style={styles.suggestions}>
//                 {prediction.structured_formatting.main_text}
//               </Text>
//           </SafeAreaView>
//         </TouchableHighlight>
//       </SafeAreaView>
//     ));


//     return (
//         <MapView
//           // provider={PROVIDER_GOOGLE}
//           // ref={(map) => {
//           //   this.map = map;
//           // }}
//           style={styles.container}
//           showsUserLocation={true}
//           region={this.state.region}
//           onRegionChange={(region) => this.setState({ region })}
//         >
//           <Polyline
//             coordinates={this.state.pointCoords}
//             strokeWidth={2}
//             strokeColor="red"
//           />
//           <TextInput
//             placeholder="Enter destination"
//             style={styles.destinationInput}
//             value={this.state.destination}
//             onChangeText={(destination) => {
//               this.setState({ destination });
//               this.onChangeDestinationDebounced(destination);
//             }}
//           ></TextInput>
//           {predictions}
//         </MapView>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     height: '100%',
//     width: '100%',
//   },
//   destinationInput: {
//     height: 40,
//     borderWidth: 1,
//     marginTop: 50,
//     marginLeft: 5,
//     marginRight: 5,
//     backgroundColor: 'white',
//     padding: 5,
//   },
//   suggestions: {
//     backgroundColor: "white",
//     padding: 5,
//     fontSize: 18,
//     borderWidth: 0.5,
//     marginLeft: 5,
//     marginRight: 5,
//   }
// });







// ORIGINAL CODE W/ WATCHID AND COMPONENT WILL UNMOUNT

// export default class Map extends React.Component {
//   constructor() {
//     super();
//     this.state = {
//       region: {
//         latitude: LATITUDE,
//         longitude: LONGITUDE,
//         latitudeDelta: LATITUDE_DELTA,
//         longitudeDelta: LONGITUDE_DELTA,
//       },
//       // DIRECTIONS STATE:
//       coords: [],
//       x: 'false',
//       cordLatitude: '-6.23',
//       cordLongitude: '106.75',
//     };
//     this.mergeLot = this.mergeLot.bind(this);
//   }
//   componentDidMount() {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         this.setState({
//           region: {
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//             latitudeDelta: LATITUDE_DELTA,
//             longitudeDelta: LONGITUDE_DELTA
//           },
//         });
//       },
//       (error) => console.log(error.message),
//       { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
//     );

//     // this.watchID = navigator.geolocation.watchPosition((position) => {
//     //   this.setState({
//     //     region: {
//     //       latitude: position.coords.latitude,
//     //       longitude: position.coords.longitude,
//     //       latitudeDelta: LATITUDE_DELTA,
//     //       longitudeDelta: LONGITUDE_DELTA,
//     //     },
//     //   });
//     // });
//   }
//   // componentWillUnmount() {
//   //   navigator.geolocation.clearWatch(this.watchID);
//   // }
//   // DIRECTIONS:
//   // convert lat and long to google directions api format:
//   mergeLot() {
//     if (this.state.latitude != null && this.state.longitude != null) {
//       let concatLot = this.state.latitude + ',' + this.state.longitude;
//       this.setState(
//         {
//           concat: concatLot,
//         },
//         () => {
//           this.getDirections(concatLot, '-6.270565,106.759550');
//         }
//       );
//     }
//   }

//   async getDirections(startLoc, destinationLoc) {
//     try {
//       let resp = await fetch(
//         `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&key=${GOOGLE_API_KEY}`
//       );
//       let respJson = await resp.json();
//       let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
//       let coords = points.map((point, index) => {
//         return {
//           latitude: point[0],
//           longitude: point[1],
//         };
//       });
//       this.setState({ coords: coords });
//       return coords;
//     } catch (error) {
//       alert(error);
//       return error;
//     }
//   }

//   render() {
//     return (
//       <MapView
//         provider={PROVIDER_GOOGLE}
//         style={styles.container}
//         showsUserLocation={true}
//         region={this.state.region}
//         onRegionChange={(region) => this.setState({ region })}
//         followUserLocation={true}
//         // onRegionChangeComplete={(region) => this.setState({ region })}
//       >
//         {!!this.state.latitude && !!this.state.longitude && (
//           <MapView.Marker
//             coordinate={{
//               latitude: this.state.latitude,
//               longitude: this.state.longitude,
//             }}
//             title={'Your Location'}
//           />
//         )}

//         {!!this.state.cordLatitude && !!this.state.cordLongitude && (
//           <MapView.Marker
//             coordinate={{
//               latitude: this.state.cordLatitude,
//               longitude: this.state.cordLongitude,
//             }}
//             title={'Your Destination'}
//           />
//         )}

//         {!!this.state.latitude &&
//           !!this.state.longitude &&
//           this.state.x == 'true' && (
//             <MapView.Polyline
//               coordinates={this.state.coords}
//               strokeWidth={2}
//               strokeColor='red'
//             />
//           )}

//         {!!this.state.latitude &&
//           !!this.state.longitude &&
//           this.state.x == 'error' && (
//             <MapView.Polyline
//               coordinates={[
//                 {
//                   latitude: this.state.latitude,
//                   longitude: this.state.longitude,
//                 },
//                 {
//                   latitude: this.state.cordLatitude,
//                   longitude: this.state.cordLongitude,
//                 },
//               ]}
//               strokeWidth={2}
//               strokeColor='red'
//             />
//           )}
//       </MapView>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     height: '100%',
//     width: '100%',
//   },
// });
