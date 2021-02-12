// DAILY VIEW METHODS:

export const totalCalories = (calorieData) => {
  return calorieData.reduce((acc, currentVal) => {
    const routeCalories = currentVal.calories
    return acc += routeCalories
  }, 0)
}

export const daysView = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={{ flexDirection: "row" }}>
          <Button title="Day"/>
          <Button title="Week"
            // onPress={()}
          />
          <Button title="Month"/>
        </View>
        <Text>TOTAL CALORIES BURNED: {totalCalories(calorieData)}</Text>
        <VictoryChart width={350} theme={VictoryTheme.material} domainPadding={30} scale={{ x: "time" }}>
          <VictoryBar data={calorieData} x='day' y='calories' labels={(d)=>{return d.datum.calories}} />

        </VictoryChart>
      </View>

      <Button title='Go back' onPress={() => navigation.goBack()} />
    </SafeAreaView>
  )
}

// WEEKLY VIEW METHODS:
// creates an object with total day's calorie count for the week - this needs to be converted to chart data via convertWeekToChart:
export const totalCaloriesWeekly = (calorieData) => {
  let allDaysTotals = []
  let totalByDate = {}
  calorieData.forEach(route => {
    const date = route.date
    const calories = route.calories
    if (!totalByDate[date]) {
      totalByDate[date] = calories
    } else {
      totalByDate[date] += calories
    }
  })
  return totalByDate
}

// converts week totals into format victory chart needs:
export const convertWeekToChart = (caloriesByWeek) => {
  let data = []
  for (let date in caloriesByWeek) {
    let totalsByDate = {}
    totalsByDate.date = date
    totalsByDate.calories = caloriesByWeek[date]
    data.push(totalsByDate)
  }
  console.log('data---->', data)
  return data
}


// PROFILE PAGE METHODS:
export const bmiCalculator = (height, weight) => {
  const weightKg = weight / 2.205;
  const heightM = height / 100;
  return (weightKg / heightM ** 2).toFixed(2);
};

export const ageCalculator = (dateOfBirth) => {
  //User Date of Birth
  const dateOfBirthArray = dateOfBirth.split("-");
  const userYear = dateOfBirthArray.pop();
  const userMonth = parseInt(dateOfBirthArray.slice(0, 1));
  const userDay = parseInt(dateOfBirthArray.slice(1, 2));

  //Today's Date
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const age = todayYear - userYear;
  const monthDifference = userMonth - todayMonth;
  const dayDifference = userDay - todayDay;

  if (monthDifference >= 1) {
    return age - 1;
  } else if (dayDifference >= 1) {
    return age - 1;
  }
  return age;
};
