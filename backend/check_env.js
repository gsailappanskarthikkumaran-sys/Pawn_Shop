
import dotenv from 'dotenv';
dotenv.config();

console.log("Checking JWT_SECRET...");
if (process.env.JWT_SECRET) {
    console.log("JWT_SECRET is set (Length: " + process.env.JWT_SECRET.length + ")");
} else {
    console.log("ERROR: JWT_SECRET is MISSING or empty.");
}
