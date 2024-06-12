const express = require("express");
const app = express();
const Flight = require('./models/Flight')
// const User = require('./models/User')
const cors = require('cors');
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protectedRoute");
const cookieParser = require("cookie-parser");


const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

app.use(cors({
    origin: ['http://127.0.0.1:3003', 'http://localhost:3003'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Allow credentials
}));
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Using Middlewares


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);

app.post('/flights', async (req, res) => {
    try {
        const { to, from, departureTime, arrivalTime, airlines } = req.body;
        const newFlightData = {
            to,
            from,
            departureTime,
            arrivalTime,
            airlines
        }
        const newFlight = await Flight.create(newFlightData);
        res.status(200).json({
            success: true,
            message: 'Airline Created',
            newFlight
        })
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        })
    }

})



app.post('/flightsBulk', async (req, res) => {
    try {
        const flightDataArray = req.body; // Expecting an array of flight data
        if (!Array.isArray(flightDataArray) || flightDataArray.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected an array of flight data.'
            });
        }

        // Insert all flight data in one go
        const newFlights = await Flight.insertMany(flightDataArray);

        res.status(200).json({
            success: true,
            message: `${newFlights.length} flights created successfully`,
            newFlights
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

app.get('/flights/:from/:to', async (req, res) => {
    try {

        const to = req.params.to;
        const from = req.params.from;

        const flights = await Flight.find({ to: to, from: from });
        if (flights.length == 0) {
            return res.status(404).json({
                msg: "flights not found"
            })
        }




        res.status(200).json({
            success: true,
            message: 'Airline Created',
            flights: flights[0].airlines
        })
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        })
    }

})


app.get('/flights', async (req, res) => {
    try {
        const flights = await Flight.find();
        res.status(200).json({
            success: true,
            flights
        })



    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message

        })
    }
})
app.get('/flights/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const flights = await Flight.findById(id);
        res.status(200).json({
            success: true,
            flights
        })



    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message

        })
    }
})



app.put('/flights/:id', async (req, res) => {
    const { id } = req.params;
    const flightData = req.body;

    try {
        const updatedFlight = await Flight.findByIdAndUpdate(id, flightData, { new: true });
        res.json(updatedFlight);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/flights/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Flight.findByIdAndDelete(id);
        res.json({ message: 'Flight deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = app;
