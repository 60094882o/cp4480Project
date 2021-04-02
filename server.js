const express = require("express")
const jwt = require("jsonwebtoken")
const app = express()
const bcrypt = require("bcrypt")
const dotenv = require("dotenv")
const port = 3000
const mysql = require("mysql")
dotenv.config()

const DATABASE  = process.env.DATABASE
const PASSWORD  = process.env.PASSWORD
const SECRETKEY = process.env.SECRETKEY

app.use(express.json())
app.use(express.static("webfiles"))

let con = mysql.createConnection({
	host: "localhost",
	user: "omar",
	password: PASSWORD,
	database: DATABASE
})

app.get("/", (req, res) => {
	console.log("Connected!")
	let sql = "select * from users;"
	con.query(sql, (err, result) => {
		if (err) throw err
		res.status(200)
		res.send(result)
	})
})

app.post("/api/login", (req, res) => {
	console.log(req.body)
	let u = req.body.username
	let p = req.body.password
	if (!u || !p) {
		res.status(400)
		res.send("Bad Request")
		return
	}

	let sql = "select * from users;"
	con.query(sql, (err, users) => {

		if (err) throw err

		let user = users.find(user => {
			console.log("user.password", user.password)
			console.log("comparison", bcrypt.compareSync(p,user.password))
			return user.username === u && bcrypt.compareSync(p,user.password)
		})

		if (user) {
			let userInfo = {
				name: u,
				role: user.role
			}
			let token = jwt.sign(userInfo, SECRETKEY)
			res.send(token)
			res.status(200)
			return
		}

		res.status(401)
		res.send("not authorized")
	})
})

app.get("/api/messages", (req, res) => {
	try {
		let token = req.headers["authorization"].split(" ")[1]
		jwt.verify(token, SECRETKEY)
		res.send("ok")
	}
	catch (e) {
		res.status(401)
		res.send("not authorized")
	}
})

app.post("/api/logout", (req, res) => {
	res.send("ok")
})


app.listen(port, () => {
	console.log("The application has started")
})
