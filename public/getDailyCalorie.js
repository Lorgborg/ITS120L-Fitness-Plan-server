function calculateDailyCalories(weight, height, age, gender, idealWeight, goalDate) {
    // Convert dates and get time difference in weeks
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const startDate = new Date();
    const endDate = new Date(goalDate);
    const timeInWeeks = Math.round((endDate - startDate) / oneWeek);

    if (timeInWeeks <= 0) {
        return "Goal date must be in the future!";
    }

    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    let BMR;
    if (gender === "male") {
        BMR = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        BMR = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    let TDEE = BMR * 1.2; // Default to sedentary if invalid input

    // Calculate total calories needed to gain/lose the weight
    const weightChange = idealWeight - weight;
    const totalCaloriesNeeded = weightChange * 7700; // 1 kg = 7700 kcal

    // Daily calorie surplus/deficit
    const dailyCalorieChange = totalCaloriesNeeded / (timeInWeeks * 7); // Spread over time

    // Final daily intake to reach goal
    const dailyCalorieIntake = TDEE + dailyCalorieChange;

    return {
        weeksUntilGoal: timeInWeeks,
        BMR: Math.round(BMR),
        TDEE: Math.round(TDEE),
        dailyCalorieIntake: Math.round(dailyCalorieIntake)
    };
}

// Example usage
const result = calculateDailyCalories(55, 170, 25, "female", 64, "2025-12-12");
console.log(result);


module.exports = calculateDailyCalories;