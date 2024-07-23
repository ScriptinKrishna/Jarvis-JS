document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.querySelector("#start");
  const infoBtn = document.querySelector("#info");
  const video = document.querySelector(".video");
  const msgs = document.querySelector(".messages");

  // Weather Setup
  function weather(location, speak = false) {
    const weatherCont = document.querySelectorAll(".temp p, .temp img");
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=48ddfe8c9cf29f95b7d0e54d6e171008`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        weatherCont[0].textContent = `Location: ${data.name}`;
        weatherCont[1].textContent = `Country: ${data.sys.country}`;
        weatherCont[2].textContent = `Weather type: ${data.weather[0].main}`;
        weatherCont[3].textContent = `Weather description: ${data.weather[0].description}`;
        weatherCont[4].src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherCont[5].textContent = `Original Temperature: ${ktc(
          data.main.temp
        )} °C`;
        weatherCont[6].textContent = `Feels like: ${ktc(
          data.main.feels_like
        )} °C`;
        weatherCont[7].textContent = `Min temperature: ${ktc(
          data.main.temp_min
        )} °C`;
        weatherCont[8].textContent = `Max temperature: ${ktc(
          data.main.temp_max
        )} °C`;

        if (speak) {
          readOut(
            `The weather in ${data.name} is ${
              data.weather[0].description
            } with a temperature of ${ktc(data.main.temp)} degrees Celsius`
          );
          video.setAttribute("autoplay", "true");
        }
      })
      .catch((error) => {
        weatherCont[0].textContent = "Weather Info Not Found";
        if (speak) {
          readOut("Weather information not found.");
        }
      });
  }

  // Convert Kelvin to Celsius
  function ktc(k) {
    return (k - 273.15).toFixed(2);
  }

  // Initial Setup Check
  if (localStorage.getItem("jarvis_setup") !== null) {
    document.querySelector(".jarvis_setup").style.display = "none";
    const setupInfo = JSON.parse(localStorage.getItem("jarvis_setup"));
    weather(setupInfo.location);
    startBtn.style.display = "inline";
    infoBtn.style.display = "inline";
  } else {
    document.querySelector(".jarvis_setup").style.display = "block";
    document.querySelector(".submit").addEventListener("click", userInfo);
    startBtn.style.display = "none";
    infoBtn.style.display = "none";
    document.querySelector(".temp").style.display = "none";
  }

  // User Info Function
  function userInfo() {
    const setupInfo = {
      name: document.querySelector("#name").value,
      bio: document.querySelector("#bio").value,
      location: document.querySelector("#location").value,
      instagram: document.querySelector("#instagram").value,
      twitter: document.querySelector("#twitter").value,
      github: document.querySelector("#github").value,
    };

    if (Object.values(setupInfo).some((value) => value === "")) {
      readOut("Please enter your full information");
    } else {
      localStorage.setItem("jarvis_setup", JSON.stringify(setupInfo));
      document.querySelector(".jarvis_setup").style.display = "none";
      weather(setupInfo.location);
    }
  }

  // Speech Recognition Setup
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = localStorage.getItem("lang");

  recognition.onstart = () => {
    console.log("Jarvis is active");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript
      .trim()
      .toLowerCase();
    console.log(`Recognized speech: ${transcript}`);
    createMsg("usermsg", transcript)

    const setupInfo = JSON.parse(localStorage.getItem("jarvis_setup"));
    if (
      transcript.includes("hey jarvis") ||
      transcript.includes("hello jarvis") ||
      transcript.includes("hi jarvis") ||
      transcript.includes("jarvis") ||
      transcript.includes("hello")
    ) {
      readOut("Hello Sir, what can I do for you today?");
    } else if (
      transcript.includes("stop") ||
      transcript.includes("go for a sleep") ||
      transcript.includes("sleep") ||
      transcript.includes("shut down")
    ) {
      recognition.stop();
      console.log("Going for a nap...");
      readOut("Goodbye");
    } else if (transcript.includes("search for")) {
      const query = transcript.replace("search for", "").trim();
      readOut(`Searching for ${query}`);
      window.open(
        `https://www.google.com/search?q=${query.split(" ").join("+")}`
      );
    } else if (transcript.includes("open")) {
      const site = transcript.replace("open", "").trim();
      readOut(`Opening ${site}`);
      window.open(`https://www.${site.split(" ").join("")}com`);
    } else if (transcript.includes("show my instagram")) {
      const profileUrl = `https://www.instagram.com/${setupInfo.instagram}`;
      readOut("Opening your Instagram profile");
      window.open(profileUrl);
    } else if (transcript.includes("show my github")) {
      const profileUrl = `https://github.com/${setupInfo.github}`;
      readOut("Opening your GitHub profile");
      window.open(profileUrl);
    } else if (transcript.includes("play")) {
      const query = transcript.replace("play", "").trim().slice(0, -1);
      readOut(`Playing ${query}`);
      window.open(
        `https://www.youtube.com/results?search_query=${query
          .split(" ")
          .join("+")}`
      );
    } else if (transcript.includes("how are you?")) {
      readOut("I am fine sir. Thank you. What about you?")
    } else if (transcript.includes("i am good")) {
      readOut("Glad to hear that. How can I assist you today?")
    }
    else if (
      transcript.includes("thank you") ||
      transcript.includes("thanks")
    ) {
      readOut(
        "You're welcomeSir. If you have any other tasks, please inform me."
      );
    } else if (
      transcript.includes("what's my name") ||
      transcript.includes("say my name")
    ) {
      readOut(`Your name is ${setupInfo.name}`);
    } else if (transcript.includes("weather")) {
      readOut("Fetching weather information...");
      weather(setupInfo.location, true);
    } else if (transcript.includes("time")) {
      const time = new Date();
      readOut(`The current time is ${time.toLocaleTimeString()}`);
    } else if (transcript.includes("date")) {
      const date = new Date();
      readOut(`The current date is ${date.toDateString()}`);
    } else if (transcript.includes("switch to hindi")) {
      localStorage.setItem("lang", "hi-IN");
      readOut("The language is set to Hindi");
    } else {
      readOut("Sorry, I didn't catch that.");
    }
  };

  recognition.onend = () => {
    console.log("Jarvis is deactivated");
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    readOut(`Error occurred in recognition: ${event.error}`);
  };

  startBtn.addEventListener("click", () => {
    recognition.start();
    console.log("Recognition started");
    readOut("Jarvis is starting up");
  });
  let removeInfo = () => {
    document.querySelector(".jarvis_setup").style.display = "block";
    startBtn.style.display = "none";
    infoBtn.style.display = "none";
    localStorage.clear()
    document.querySelector(".messages").style.display = "none"
    document.querySelector(".temp").style.display = "none";
    video.style.display = "none";
  }
  infoBtn.addEventListener("click", removeInfo);

  function submit() {
    document.querySelector(".jarvis_setup").style.display = "none";
    video.style.display = "block";
    startBtn.style.display = "inline";
    infoBtn.style.display = "inline";
    document.querySelector(".temp").style.display = "block";
  }

  document.querySelector(".submit").addEventListener("click", submit);

  document.querySelector(".submit").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      submit();
    }
  });

  // Jarvis Speech
  function readOut(message) {
    const speech = new SpeechSynthesisUtterance();
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    speech.onstart = () => {
      video.style.display = "block";
      video.play();
    };

    speech.onend = () => {
      video.style.display = "none";
      video.pause();
      video.currentTime = 0;
    };
    createMsg("jmsg", message)
    window.speechSynthesis.speak(speech);
  }

  function createMsg(who, msg) {
    let newMsg = document.createElement("p")
    newMsg.innerText = msg;
    newMsg.setAttribute("class", who)
    msgs.appendChild(newMsg)
  }

  // Update Time
  const timeElement = document.querySelector("#time");
  setInterval(() => {
    const now = new Date();
    timeElement.textContent = now.toLocaleString();
  }, 1000);

  // Hamburger Menu
  const hamburger = document.querySelector(".hamburg");
  const temp = document.querySelector(".temp");
  const closeBtn = document.querySelector(".close");

  hamburger.addEventListener("click", () => {
    hamburger.style.display = "none";
    temp.style.display = "block";
    closeBtn.style.display = "block";
    closeBtn.style.right = "1rem";
  });

  closeBtn.addEventListener("click", () => {
    temp.style.display = "none";
    closeBtn.style.display = "none";
    hamburger.style.display = "block";
    hamburger.style.right = "1px";
    hamburger.style.position = "absolute";
  });
});
