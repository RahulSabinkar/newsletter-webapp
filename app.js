require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const bodyParser = require("body-parser");
const https = require("node:https");

const app = express();
const port = process.env.PORT || 3000;

// Create your own .env file at the root of the project directory and
// enter your own API keys, username, dc and list-id.
const apiKey = process.env.API_USERNAME + ":" + process.env.API_KEY;
const dc = process.env.DC;
const listID = process.env.LIST_ID;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/failure", (req, res) => {
  res.redirect("/");
});

app.post("/", (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const emailAddress = req.body.emailAddress;

  const data = {
    members: [
      {
        email_address: emailAddress,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(data);

  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listID}`;

  const options = {
    method: "POST",
    auth: apiKey,
  };

  const request = https.request(url, options, (response) => {
    response.on("data", (data) => {
      const parsedData = JSON.parse(data);
      console.log(parsedData);
      if (response.statusCode === 200) {
        res.sendFile(__dirname + "/success.html");
      } else {
        res.sendFile(__dirname + "/failure.html");
      }
    });
  });

  request.write(jsonData);
  request.end();
});

app.listen(port, () => {
  console.log("The server is running at port: " + port);
});
