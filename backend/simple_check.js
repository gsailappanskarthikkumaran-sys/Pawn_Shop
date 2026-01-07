
import mongoose from 'mongoose';

const check = async () => {
    try {
        console.log('Connecting...');
        await mongoose.connect('mongodb://127.0.0.1:27017/pawnbroker_db', { serverSelectionTimeoutMS: 5000 });
        console.log('Connected!');

        const User = mongoose.model('User', new mongoose.Schema({
            username: String,
            role: String,
            fullName: String
        }), 'users');

        const admins = await User.find({ role: 'admin' });
        console.log('Admins found:', admins.length);
        admins.forEach(a => console.log(`USER: ${a.username} | NAME: ${a.fullName}`));

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    }
};

check();
