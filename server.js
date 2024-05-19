const express = require('express');
const app = express();
const path = require("path");
const mongoose = require('mongoose');
let port = 5000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/breach-alert-users');
}

main()
    .then(() => { console.log("Connected Succesfully"); })
    .catch((err) => { console.error(err); });


let userSchema = new mongoose.Schema({
    username : String,
    email: String,
    date: { type: Date, default: Date.now }
});

const breach_alert_model = new mongoose.model("breach_alert_model", userSchema);

app.get("/" , (req,res)=>{
    res.render("index") ;
})

app.post("/email", async(req, res) => {
    let {email,name} = req.body;
    const user = new breach_alert_model({  
        name: name,
        email: email
    });
    await user.save();

    const url = `https://data-breach-checker.p.rapidapi.com/api/breach?email=${email}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '9f90febbe8msh776fa18ace4825ep1c6da4jsna50a4df94380',
            'X-RapidAPI-Host': 'data-breach-checker.p.rapidapi.com'
        }
    };

    let response = async () => {
        try {
            await fetch(url, options).then(res => res.json()).then(apiData => {
                console.log(apiData);
                res.render('breach display', { apiData });
            }).catch(err => console.error(err));

        } catch (error) {
            console.error(error);
        }
    }
    response();
})

app.get("/display", (req, res) => {
    res.render("breach display");
});


app.get("/discription", (req, res) => {
    res.render("discription");
})

app.get("/resume", (req, res) => {
    const filePath = __dirname + "/public/assets/resume.pdf";
    res.sendFile(filePath);
});


app.listen(port, () => {
    console.log("Server started on port " + port);
});
