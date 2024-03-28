// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDU24KbSlmMZein7_2ZmJx6clOU3fUbO5s",
  authDomain: "snake-game-82512.firebaseapp.com",
  projectId: "snake-game-82512",
  storageBucket: "snake-game-82512.appspot.com",
  messagingSenderId: "996208567382",
  appId: "1:996208567382:web:bb16991d453509bd4207f7",
  measurementId: "G-CMH59Y94RK",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Initialize variables
const auth = firebase.auth();
const database = firebase.database();

/* Set up our register function
function register () {
  // Get all our input fields
  email = document.getElementById('email').value
  password = document.getElementById('password').value
  full_name = document.getElementById('full_name').value
  password_confirm = document.getElementById('password_confirm').value

  // Validate input fields
  if (validate_email(email) == false || validate_password(password) == false || validate_field(password_confirm) == false) {
    alert('Email or Password is Outta Line!!')
    return
    // Don't continue running the code
  }
  if (validate_field(full_name) == false) {
    alert('You gotta fill in your full name!!')
    return
  }
 
  // Move on with Auth
  auth.createUserWithEmailAndPassword(email, password)
  .then(function() {
    // Declare user variable
    var user = auth.currentUser

    // Add this user to Firebase Database
    var database_ref = database.ref()

    // Create User data
    var user_data = {
      email : email,
      full_name : full_name,
      last_login : Date.now()
    }

    // Push to Firebase Database
    database_ref.child('users/' + user.uid).set(user_data)

    // DOne
    alert('User Created!!')
  })
  .catch(function(error) {
    // Firebase will use this to alert of its errors
    var error_code = error.code
    var error_message = error.message

    alert(error_message)
  })
}

// Set up our login function
function login () {
  // Get all our input fields
  email = document.getElementById('email').value
  password = document.getElementById('password').value

  // Validate input fields
  if (validate_email(email) == false || validate_password(password) == false) {
    alert('Email or Password is Outta Line!!')
    return
    // Don't continue running the code
  }

  auth.signInWithEmailAndPassword(email, password)
  .then(function() {
    // Declare user variable
    var user = auth.currentUser

    // Add this user to Firebase Database
    var database_ref = database.ref()

    // Create User data
    var user_data = {
      last_login : Date.now()
    }

    // Push to Firebase Database
    database_ref.child('users/' + user.uid).update(user_data)

    // DOne
    alert('User Logged In!!')

  })
  .catch(function(error) {
    // Firebase will use this to alert of its errors
    var error_code = error.code
    var error_message = error.message

    alert(error_message)
  })
}




// Validate Functions
function validate_email(email) {
  expression = /^[^@]+@\w+(\.\w+)+\w$/
  if (expression.test(email) == true) {
    // Email is good
    return true
  } else {
    // Email is not good
    return false
  }
}

function validate_password(password) {
  // Firebase only accepts lengths greater than 6
  if (password < 6) {
    return false
  } if(password != password_confirm){
    return false
  } else {
    return true
  }
}

function validate_field(field) {
  if (field == null) {
    return false
  }

  if (field.length <= 0) {
    return false
  } else {
    return true
  }
}
*/
async function updateScoreAtGameOver(difficulty, scoresArray) {
  // Call the updateScore function with the player's score and difficulty level
  await updateScore(scoresArray[difficulty].score, difficulty);
  displayTopScores();
}

async function updateScore(score, difficulty) {
  var scoresRef = database.ref("scores/" + difficulty);

  // Show the username modal
  var modal = document.getElementById("usernameModal");
  modal.style.display = "block";

  // Handle the submit button click
  var submitBtn = document.getElementById("submitUsernameBtn");
  const storedUserId = JSON.parse(localStorage.getItem("snake-userId")) || {};

  const bestScore = Number(localStorage.getItem(`score${difficulty}`));
  console.log(bestScore);
  const difficultyName =
    difficulty === 0 ? "easy" : difficulty === 1 ? "medium" : "hard";
  if (storedUserId[difficultyName]) {
    await fetch(
      `https://mario-be.vercel.app/api/users/${storedUserId[difficultyName]}?prefix=snake&replace=true`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score: bestScore }),
      }
    );
  }

  let btnClicked = 0;

  submitBtn.addEventListener("click", async function () {
    btnClicked += 1;
    var userName = document.getElementById("usernameInput").value;

    if (!storedUserId[difficultyName] && btnClicked == 1) {
      console.log(score);

      const response = await fetch(
        "https://mario-be.vercel.app/api/users?prefix=snake",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userName,
            difficulty: difficultyName,
            score,
          }),
        }
      );

      const { userId } = await response.json();
      localStorage.setItem(
        "snake-userId",
        JSON.stringify({
          ...storedUserId,
          [difficultyName]: userId,
        })
      );
    }

    if (userName.trim() === "") {
      userName = "Anonymous"; // Use 'Anonymous' if the user leaves the input empty
    }

    // Hide the modal
    modal.style.display = "none";

    // Fetch the current scores for the specific difficulty level
    scoresRef.once("value", function (snapshot) {
      var scoresData = snapshot.val() || {}; // If no scores exist, initialize as an empty object

      // Convert the scores object into an array of scores
      var scoresArray = Object.entries(scoresData);

      // Sort scores in descending order based on the score itself
      scoresArray.sort((a, b) => b[1].score - a[1].score);

      // Limit to top 20 scores
      scoresArray = scoresArray.slice(0, 20);

      // Create a new score entry with the user's name and score
      var newScoreEntry = {
        score: score,
        userName: userName,
      };

      var userScoreIndex = scoresArray.findIndex(
        (entry) => entry[1].score < score
      );

      var scoreKey;
      if (userScoreIndex !== -1 || scoresArray.length < 20) {
        // The user's score is in the top 20 or there are fewer than 20 scores in the leaderboard

        if (userScoreIndex !== -1) {
          // The user's score is already in the top 20, so update the existing entry
          var existingEntry = scoresArray[userScoreIndex];
          scoreKey = existingEntry[0]; // Use the existing key for updating the entry
          existingEntry[1] = newScoreEntry; // Update the entry with the new score and name
        } else {
          // The user's score is not in the top 20, so generate a new key for the entry
          scoreKey = scoresRef.push().key;
          scoresArray.push([scoreKey, newScoreEntry]);
        }

        // Update the scores in the Firebase Database
        var updatedScoresData = scoresArray.reduce((acc, [key, entry]) => {
          acc[key] = entry;
          return acc;
        }, {});

        scoresRef.set(updatedScoresData).catch(function (error) {
          alert("Error updating score: " + error.message);
        });
      }
    });
  });

  // Handle the modal close button click
  var closeModalBtn = document.getElementById("closeModal");
  closeModalBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });
}

async function displayTopScores() {
  const response = await fetch(
    "https://mario-be.vercel.app/api/users?prefix=snake"
  );
  const users = await response.json();

  var easyScoresList = document.getElementById("easy-scores");
  var mediumScoresList = document.getElementById("medium-scores");
  var hardScoresList = document.getElementById("hard-scores");

  // Clear the leaderboard for each difficulty level
  easyScoresList.innerHTML = "";
  mediumScoresList.innerHTML = "";
  hardScoresList.innerHTML = "";

  var scoresRef = database.ref("scores");

  scoresRef.once("value", function (snapshot) {
    var topScores = {
      0: [], // Easy scores
      1: [], // Medium scores
      2: [], // Hard scores
    };

    const easyScores = [];
    const mediumScores = [];
    const hardScores = [];

    users.forEach((user) => {
      const { id, name, score, difficulty } = user;

      if (difficulty === "easy") {
        easyScores.push([id, { score, userName: name }]);
      } else if (difficulty === "medium") {
        mediumScores.push([id, { score, userName: name }]);
      } else if (difficulty === "hard") {
        hardScores.push([id, { score, userName: name }]);
      }
    });

    easyScores.sort((a, b) => b[1].score - a[1].score);
    mediumScores.sort((a, b) => b[1].score - a[1].score);
    hardScores.sort((a, b) => b[1].score - a[1].score);

    topScores[0] = easyScores;
    topScores[1] = mediumScores;
    topScores[2] = hardScores;

    // // Store scores in the topScores object based on difficulty level
    // snapshot.forEach(function (childSnapshot) {
    //   var difficultyLevel = childSnapshot.key; // Get the difficulty level (0, 1, or 2)
    //   var scoreData = childSnapshot.val();

    //   // Convert the scoreData object into an array of scores
    //   var scoresArray = Object.entries(scoreData);

    //   // Sort scores in descending order based on the score itself
    //   scoresArray.sort((a, b) => b[1].score - a[1].score);

    //   // Limit to top 20 scores
    //   scoresArray = scoresArray.slice(0, 20);

    //   // Add the scores to the corresponding difficulty level array
    //   topScores[difficultyLevel] = scoresArray;
    // });

    // Populate the leaderboard lists for each difficulty level
    populateLeaderboard(topScores["0"], easyScoresList);
    populateLeaderboard(topScores["1"], mediumScoresList);
    populateLeaderboard(topScores["2"], hardScoresList);
  });
}

function populateLeaderboard(scoresArray, scoresList) {
  // Sort the scoresArray in descending order based on the score itself, keeping track of the original index
  scoresArray = scoresArray
    .map((scoreData, index) => [index, scoreData[1]])
    .sort((a, b) => b[1].score - a[1].score);

  // Clear the leaderboard list
  scoresList.innerHTML = "";

  // Create list items for the score entries and add them to the leaderboard list
  scoresArray.forEach(function (scoreData, index) {
    var userScore = scoreData[1].score;
    var userName = scoreData[1].userName || "Anonymous";

    // Create a list item for the score entry
    var scoreEntry = document.createElement("li");
    scoreEntry.textContent = index + 1 + ". " + userName + ": " + userScore;
    scoresList.appendChild(scoreEntry);
  });
}

// Call displayTopScores once to initially load the leaderboards
displayTopScores();

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Function to delete scores from the database
async function deleteScores() {
  try {
    const scoresRef = admin.database().ref("scores");
    const snapshot = await scoresRef.once("value");
    const currentTime = Date.now();
    const expirationTime = currentTime - 3600 * 1000; // 1 hour ago

    // Iterate through scores and delete expired ones
    snapshot.forEach((childSnapshot) => {
      const difficultyLevel = childSnapshot.key;
      const scoreData = childSnapshot.val();

      Object.keys(scoreData).forEach((userId) => {
        if (scoreData[userId].timestamp <= expirationTime) {
          scoresRef.child(difficultyLevel).child(userId).remove();
        }
      });
    });

    console.log("Scores deleted successfully.");
  } catch (error) {
    console.error("Error deleting scores:", error);
  }
}

// Schedule the function to run every hour
exports.scheduledDeleteScores = functions.pubsub
  .schedule("every 1 hours")
  .timeZone("Etc/Greenwich")
  .onRun((context) => {
    return deleteScores();
  });
