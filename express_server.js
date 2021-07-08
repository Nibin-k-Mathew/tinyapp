const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const cookieParser = require("cookie-parser");

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//Got this function from google search
function generateRandomString() {
  let result = '';
  let characters = 'AbC3g6hijklmnopqrz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  console.log(result);
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  "id": {
    id: "id",
    email: "a@example.com",
    password: "1234"
  },
  "ID2": {
    id: "ID2",
    email: "b@example.com",
    password: "123"
  }
};

// find user by email helper function
const findUserByEmail = (email) => {
//if we have a user, return the user
//if not return null.
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//LogOut form in Tiny app
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  //update the username object with user_id
  const user_id = req.cookies['user_id'];
  console.log("******",user_id);
  let user;
  if (user_id) {
    user = users[user_id];
  }
  const templateVars = {
    user,
    urls: urlDatabase
  };
  console.log("templateVars",templateVars.user);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies["user_ID"],
  };
  //Only Registered Users Can Shorten URLs
  if(req.cookies['user_id']){
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],user:null};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log("message from post", req.body);  // Log the POST request body to the console
  // generate random string == short url
  if(req.cookies['user_id']){
    res.render("urls_new", templateVars);
  }
  else {
    res.send("Access not allowed");
  }
  const shortURL = generateRandomString();
  const prefix = 'https://';
  if (req.body.longURL.startsWith(prefix)) {
    // add short and URl as the key value pairs as the database
    urlDatabase[shortURL] = req.body.longURL;
  } else {
    urlDatabase[shortURL] = `${prefix}${req.body.longURL}`;
  }
  // res.redirect /urls/+shorturl
  res.redirect(`/urls/${shortURL}`);

});

//GET/login
app.get('/login', (req,res) => {
  const templateVars = {
    user: null
  };
  res.render('urls_login',templateVars);
});

//GET/register
app.get('/register', (req,res) => {
  const templateVars = {
    user:null
  };
  res.render('urls_registration',templateVars);
});

// POST/login
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log("email is ",email);
  console.log("Password is", password);
  //add the new users in the users object
  const id = Math.floor(Math.random() * 1000) + 1;

  //If the e-mail or password are empty strings,
  //send back a response with the 400 status code
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank");
  }
  //If someone tries to register with an email that is already in the users object,
  //send back a response with the 400 status code

  const user = findUserByEmail(email);
  console.log("user is",user);
  if (!user) {
    return res.status(403).send("Email not found");
  } else if (user) {
    if (user.password !== password) {
      return res.status(403).send("password doesnt match");
    }
  }
  users[id] = {
    id,
    email,
    password
  };
  console.log("users id", users[id]);
  res.cookie("user_id", id);
  console.log("$$$$$$$$$$$", users);

  res.redirect("/urls");

});



//POST/register
app.post("/register", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log("email", email);
  console.log("password",password);
  // add the new users in the users object
  const id = Math.floor(Math.random() * 1000) + 1;
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank");
  }
  //If someone tries to register with an email that is already in the users object,
  //send back a response with the 400 status code

  const user = findUserByEmail(email);
  console.log(user);
  if (user) {
    return res.status(400).send("Email already in use");
  }
  users[id] = {
    id,
    email,
    password
  };
  console.log("users id", users[id]);
  res.cookie("user_id", id);
  console.log("$$$$$$$$$$$", users);

  //If the e-mail or password are empty strings,
  //send back a response with the 400 status code

  res.redirect("/urls");
});

//Delete POST/urls/:id/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log("req delete", req.body);
  res.redirect("/urls");

});
// Updating the long URL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  console.log('POST /urls/:shortURL', shortURL);
  console.log("LongURL", longURL);
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

// endpoint "/u/:shortURL" will redirect to its longURL

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log("Short", shortURL);
  const longURL = urlDatabase[shortURL];
  console.log("long", longURL);
  if (longURL === undefined) {
    res.status(404);
    res.send("ShortURL doesnot exist");
  } else {
    res.redirect(longURL);
  }

});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
