import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native-gesture-handler';

const instructions = [
  {
    id: 'map',
    icon: 'ios-navigate',
    color: '#49BEAA',
    content: [
      'Use your map to find the best route to your destination',
      "Select 'START' to begin your route",
      "Select 'STOP' once you've reached your destination",
    ],
  },
  {
    id: 'healthStats',
    icon: 'ios-stats-chart',
    color: '#456990',
    content: [
      'Use your Health Dashboard to track your daily, weekly, and monthly progress',
      'Blue bars show the potential calories burned for your latest route while Red bars show how many calories you actually burned',
    ],
  },
  {
    id: 'profile',
    icon: 'ios-person',
    color: '#EF767A',
    content: ['Check out your daily progress on your Profile'],
  },
  {
    id: 'settings',
    icon: 'ios-settings',
    color: '#EEB868',
    content: ['Update your profile on the Settings page'],
  },
];

export default function GetStarted({ navigation }) {
  const handlePress = () => {
    navigation.navigate('MainTab');
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>GETTING STARTED</Text>
      <FlatList
        horizontal
        data={instructions}
        renderItem={({ item }) => (
          <View style={styles.card_template} key={item.id}>
            <Icon
              name={item.icon}
              size={30}
              color={item.color}
              style={styles.icon}
            />
            <View style={styles.text_container}>
              {item.content.map((instructions, idx) => (
                <Text key={idx} style={styles.instructions}>{instructions}</Text>
              ))}
            </View>
          </View>
        )}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handlePress}>
          <Text style={styles.backButton}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    marginTop: '12%',
    marginLeft: '6%',
  },
  icon: {
    padding: '3%',
    textAlign: 'center',
  },
  card_template: {
    width: 320,
    height: '40%',
    marginLeft: 10,
    marginRight: 7,
    marginTop: '40%',
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  text_container: {
    // position: 'relative',
    alignContent: 'center',
    width: '100%',
    height: '100%',
    bottom: 0,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  instructions: {
    fontSize: 20,
    padding: '2%',
  },
  buttonContainer: {
    marginLeft: '25%',
    alignItems: 'center',
    alignContent: 'center',
    backgroundColor: '#49BEAA',
    borderRadius: 5,
    justifyContent: 'center',
    width: 220,
    height: 45,
  },
  backButton: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
});
