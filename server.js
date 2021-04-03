const express = require("express")
const jwt = require("jsonwebtoken")
const app = express()
const bcrypt = require("bcrypt")
const dotenv = require("dotenv")
const mysql = require("mysql")
dotenv.config()

const DATABASE = process.env.DATABASE
const PASSWORD = process.env.PASSWORD
const SECRETKEY = process.env.SECRETKEY
const PORT = process.env.PORT
const API = process.env.API
const USER = process.env.USER

app.use(express.json())
app.use(express.static("webfiles"))

let con = mysql.createConnection({
	host: "localhost",
	user: USER,
	password: PASSWORD,
	database: DATABASE
})

app.get("/", (req, res) => {
	console.log("Connected!")
	con.query("select * from users;", (e, users) => {
		if (e) throw e
		if (users.length > 0) {
			res.status(200)
			res.send(users)
		}
	})
})

app.post(`/${API}/login`, (req, res) => {
	console.log(req.body)
	let u = req.body.username
	let p = req.body.password
	if (!u || !p) {
		res.status(400)
		res.send("Bad Request")
		return
	}

	con.query("select * from users;", (e, users) => {
		if (e) throw e
		if (users.length > 0) {

			let user = users.find(user => user.username === u && bcrypt.compareSync(p, user.password))

			if (user) {
				let userInfo = {
					id: user.id,
					role: user.role
				}
				let token = jwt.sign(userInfo, SECRETKEY)
				res.send(token)
				res.status(200)
				return
			} else {
				res.status(401)
				res.send("not authorized")
				return
			}
		}
	})
})

app.get(`/${API}/messages`, async (req, res) => {
	try {
		let token = req.headers["authorization"].split(" ")[1]
		token = jwt.verify(token, SECRETKEY)
		let sql
		if (token.role === "admin") {
			sql = "select * from messages"
		} else {
			sql = `select * from messages where messages.from_id = ${token.id}`
		}

		con.query(sql, (err, messages) => {
			if (err) throw err
			res.status(200)
			res.send(messages)
		})
	}
	catch (e) {
		res.status(401)
		res.send("not authorized")
	}
})

app.post(`/${API}/messages`, (req, res) => {
	let t = req.body.to
	let m = req.body.message
	if (!t || !m) {
		res.status(400)
		res.send("Bad Request")
		return
	}
	try {
		let token = req.headers["Authorization"].split(" ")[1]
		console.log("token recieved", token)
		token = jwt.verify(token, SECRETKEY)
		// Yes I know taking a value directly from the user and using it to
		// insert an SQL command is horrible security.
		let sql = `insert into messages(from_id, to_id, message) values(${token.id}, ${t}, '${m}');`
		con.query(sql, (err) => {
			if (err) throw err
			res.status(200)
			res.send("Message sent")
		})
	}
	catch (e) {
		console.log(e)
		res.status(401)
		res.send("Not authorized")
	}
})

app.post(`/${API}/logout`, (req, res) => {
	res.send("ok")
})

app.listen(PORT, () => {
	console.log(`The application has started on ${PORT}`)
})