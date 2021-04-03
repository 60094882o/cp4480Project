const axios = require("axios")
const dotenv = require("dotenv")
// const mysql = require("mysql")
dotenv.config()


// const DATABASE = process.env.DATABASE
// const PASSWORD = process.env.PASSWORD
// const SECRETKEY = process.env.SECRETKEY
// const PORT = process.env.PORT
const API = process.env.API
// const USER = process.env.USER

let token = null

let params = { Authorization: `Bearer ${token}` }

test("Logging in as user", async () => {
	async function login() {
		let login = await axios.post(`/${API}/login`, { username: "Omar", password: "omartest" })
		token = login.data
	}
	await login()
	expect(token !== null).toBe(true)
})

test("Logging in as an admin", async () => {
	async function login() {
		let login = await axios.post(`/${API}/login`, { username: "Kareem", password: "kareemtest" })
		token = login.data
	}
	await login()
	expect(token !== null).toBe(true)
})

test("Send message as a user", async () => {
	let response = null
	async function sendMessageAsUser() {
		response = await axios.post("/api/messages", {
			to: "1",
			message: "Hello there"
		}, { params })
	}
	await sendMessageAsUser()
	expect(response.data).toBe("Message sent")
})

test("Send message as an admin", async () => {
	let response = null
	async function sendMessageAsAdmin() {
		response = await axios.post("/api/messages", {
			to: "2",
			message: "How are you doing?"
		}, { params })
	}
	await sendMessageAsAdmin()
	expect(response.data).toBe("Message sent")
})

test("Read your messages as a user", async () => {
	let response = null
	async function sendMessagesAsUser() {
		await axios.post("/api/messages", {
			to: "1",
			message: "This is the second message"
		}, { params })

		await axios.post("/api/messages", {
			to: "2",
			message: "This is another message for another user"
		}, { params })

		response = await axios.get("/api/messages", "", { params })
	}

	await sendMessagesAsUser()
	expect(response.data.length).toBe(2)
})