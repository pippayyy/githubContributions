import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import './App.css';

// GraphQL Query
const GET_CONTRIBUTION_DATA = gql`
  query ($userName: String!) {
    user(login: $userName) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

const getMostCommonDayOfWeek = (contributionData) => {
  // Initialize an array to store counts for each day of the week (Sunday to Saturday)
  const dayCount = [0, 0, 0, 0, 0, 0, 0]; // [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]

  // Iterate over the weeks and contribution days
  contributionData.user.contributionsCollection.contributionCalendar.weeks.forEach((week) => {
    week.contributionDays.forEach((day) => {
      // Extract the day of the week using the Date object
      const dayOfWeek = new Date(day.date).getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
      dayCount[dayOfWeek] += 1;
    });
  });

  // Find the index of the day with the highest count
  const mostCommonDayIndex = dayCount.indexOf(Math.max(...dayCount));

  // Map the index to the corresponding day of the week
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return daysOfWeek[mostCommonDayIndex];
};


const App = () => {
  const [userName, setUserName] = useState("");
  const [submittedUser, setSubmittedUser] = useState("");

  const { loading, error, data } = useQuery(GET_CONTRIBUTION_DATA, {
    variables: { userName: submittedUser },
    skip: !submittedUser,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedUser(userName);
  };

    // Helper function to determine color intensity based on contributions
    const getColor = (contributionCount) => {
      if (contributionCount === 0) return "bg-gray-200";
      if (contributionCount < 5) return "bg-green-100";
      if (contributionCount < 10) return "bg-green-300";
      if (contributionCount < 20) return "bg-green-500";
      return "bg-green-700";
    };
    

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8 space-y-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">GitHub Contributions Viewer</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex items-center space-x-4 mb-6">
        <input
          type="text"
          placeholder="Enter GitHub username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="px-4 py-2 rounded border border-gray-300 focus:ring focus:ring-blue-300"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
        >
          Search
        </button>
      </form>

      {/* Loading and Error States */}
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}

      {/* Heat Map */}
      {data && (
      <div className="bg-white shadow rounded p-6 w-full max-w-2xl">


        <div className="overflow-x-auto w-full">
            {/* X-axis (Months) */}
            <div className="flex mb-1">
              {/* Placeholder for the Y-axis labels to align with the grid */}
              <div className="w-4"></div>
              <div
                className="grid grid-flow-col gap-1"
                style={{
                  gridTemplateColumns: `repeat(${data.user.contributionsCollection.contributionCalendar.weeks.length}, 1fr)`,
                }}
              >
                {data.user.contributionsCollection.contributionCalendar.weeks.map((week, index) => {
                  // Get the first day of each week
                  const firstDay = week.contributionDays[0].date;
                  const currentMonth = new Date(firstDay).toLocaleString("default", {
                    month: "short",
                  });

                  // Show the month label only for the first week of the month
                  const isFirstWeekOfMonth =
                    index === 0 ||
                    new Date(week.contributionDays[0].date).getMonth() !==
                      new Date(
                        data.user.contributionsCollection.contributionCalendar.weeks[
                          index - 1
                        ].contributionDays[0].date
                      ).getMonth();

                  return (
                    <div
                      key={index}
                      className={`text-xs text-gray-500 text-center w-4 h-4 ${
                        isFirstWeekOfMonth ? "" : ""
                      }`}
                    >
                      {isFirstWeekOfMonth ? currentMonth : ""}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main heatmap area */}
            <div className="flex">
              {/* Y-axis (Days of the Week) */}
              <div className="flex flex-col justify-between mr-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <div key={index} className="text-xs text-gray-500 h-4 flex items-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div
                className="grid grid-rows-7 grid-flow-col gap-1"
                style={{
                  gridTemplateColumns: `repeat(${data.user.contributionsCollection.contributionCalendar.weeks.length}, 1fr)`,
                }}
              >
                {data.user.contributionsCollection.contributionCalendar.weeks.map(
                  (week, weekIndex) =>
                    week.contributionDays.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-4 h-4 ${getColor(day.contributionCount)} rounded-sm`}
                        title={`${day.date}: ${day.contributionCount} contributions`}
                      ></div>
                    ))
                )}
              </div>
            </div>
        </div>



      </div>
      )}

      {/* Data Display */}
      {data && (
        <div className="bg-white shadow rounded p-6 w-full max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Total Contributions:{" "}
            <span className="text-blue-600">{data.user.contributionsCollection.contributionCalendar.totalContributions}</span>
          </h2>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Top Day Of the Week:{" "}
            <span className="text-blue-600">{getMostCommonDayOfWeek(data)}</span>
          </h3>

          <h3 className="text-lg font-semibold text-gray-700 mb-2">Contribution Details:</h3>
          <div className="space-y-4">
            {data.user.contributionsCollection.contributionCalendar.weeks
              .slice() // Create a shallow copy of the weeks array to avoid mutating the original data
              .reverse() // Reverse the array so the latest weeks come first
              .map((week, index) => {
                // Calculate the week number based on the first day of the week
                const firstDay = new Date(week.contributionDays[0].date);
                const startOfYear = new Date(firstDay.getFullYear(), 0, 1);
                const weekNumber = Math.ceil(
                  ((firstDay - startOfYear) / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7
                );

                return (
                  <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded">
                    <h4 className="font-semibold text-gray-700">Week {weekNumber}</h4>
                    <ul className="list-disc pl-5">
                      {week.contributionDays.map((day, dayIndex) => (
                        <li key={dayIndex} className="text-sm text-gray-600">
                          <span className="font-semibold">Date:</span> {day.date} |{" "}
                          <span className="font-semibold">Contributions:</span> {day.contributionCount}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
          </div>

        </div>
      )}
    </div>
  );
};

export default App;

