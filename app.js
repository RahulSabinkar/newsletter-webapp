require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const bodyParser = require("body-parser");
const client = require("@mailchimp/mailchimp_marketing");

const app = express();
const port = process.env.PORT || 3000;

// Create your own .env file at the root of the project directory and
// enter your own API key, dc and list-id.
client.setConfig({
  apiKey: process.env.API_KEY,
  server: process.env.DC,
});
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

  const run = async () => {
    const response = await client.lists.batchListMembers(listID, data);
    console.log(response);
    if (!response.error_count) {
      res.sendFile(__dirname + "/success.html");
    } else {
      // TODO: Add error, error-code dynamically to failure.html
      res.sendFile(__dirname + "/failure.html");
    }
  };
  run();
});

app.listen(port, () => {
  console.log("The server is running at port: " + port);
});
