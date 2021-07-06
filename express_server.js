const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Got this function from google search
function generateRandomString() {
  var result           = '';
  var characters       = 'AbC3g6hijklmnopqrz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
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
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log("message from post",req.body);  // Log the POST request body to the console
  // generate random string == short url
    const shortURL = generateRandomString(); 
    const prefix = 'https://';
    if(req.body.longURL.startsWith(prefix)){
      urlDatabase[shortURL] = req.body.longURL
    }
    else {
      urlDatabase[shortURL] = `${prefix}${req.body.longURL}`
    }
  // add short and URl as the key value pairs as the database
  // res.redirect /urls/+shorturl
  res.redirect(`/urls/${shortURL}`);
      
});

//Delete POST/urls/:id/delete
app.post('/urls/:shortURL/delete', (req,res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");

});
// Updating the long URL
app.post('/urls/:shortURL', (req,res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  console.log('POST /urls/:shortURL',shortURL);
  console.log("LongURL",longURL);
  urlDatabase[shortURL] = longURL; 
  res.redirect("/urls");
})

// endpoint "/u/:shortURL" will redirect to its longURL

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log("Short",shortURL);
  const longURL = urlDatabase[shortURL];
  console.log("long",longURL);
  if(longURL === undefined){
    res.status(404)
    res.send("ShortURL doesnot exist")
  }
  else {
    res.redirect(longURL);
  }
    
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
