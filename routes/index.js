const router = require("express").Router();

const User = require("../models/User.model");

const bcrypt = require("bcryptjs"); //npm i bcryptjs

const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");

const saltRounds = 10;  //numero de rondes d'encriptació. Habitualment 10-12


/* GET home page */
router.get("/", isLoggedOut, (req, res, next) => {
  res.render("index");
});

router.get("/sign-up", isLoggedOut, (req, res, next) => {
  const data = {};
    if(req.session.currentUser) data.username = req.session.currentUser.username;
  res.render("signUp", data)
})

router.post("/sign-up", isLoggedOut, (req, res, next) => {
  const { username, password } = req.body;
  if(!username || !password) {
    const data = {missatgeError: "Falten camps"};
    if(req.session.currentUser) data.username = req.session.currentUser.username;

    res.render("signUp", data)
    return;
  }
  const salt = bcrypt.genSaltSync(saltRounds);
  const passwordHash = bcrypt.hashSync(password, salt);

  User.create({
    username,
    password: passwordHash
  })
  .then(result => {
    req.session.currentUser=result;
    res.redirect("/profile")
  })
  .catch(err => {
    const data = {missatgeError: err};
    if(req.session.currentUser) data.username = req.session.currentUser.username;

    console.log("err registre: ", data)
  })
})

router.get("/profile", isLoggedIn, (req, res, next) => {
  const data = {};
  if(req.session.currentUser) data.username = req.session.currentUser.username;

  res.render("profile", data)
})

router.get("/login", isLoggedOut, (req, res, next) => {
  res.render("login")
})

router.post("/login", isLoggedOut, (req, res, next) => {
  const { username, password } = req.body;

  User.findOne({username})
  .then(user => {
    console.log("user: ", user)
    if((user === null)){
      const data = {missatgeError: "Usuari inexistent"};
      
      res.render("login", data)
      return
    }
    if(bcrypt.compareSync(password, user.password)){
      req.session.currentUser=user;
      res.redirect("profile");
      return
    } else {
      const data = {missatgeError: "credencials incorrectes"};
      if(req.session.currentUser) data.username = req.session.currentUser.username;
      
      res.render("login", data)
    }
  })
  .catch(err => {
    console.log("err login: ", err)
  })
})

module.exports = router;
