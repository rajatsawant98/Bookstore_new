const cron = require('node-cron');
const TokenBlacklist = require('./Models/blacklist');

cron.schedule('0 13 * * *', async () => {
    console.log('cron job started running');
    try {
        await TokenBlacklist.deleteMany({ expiresAt: { $lt: new Date() } });
        console.log('Expired tokens cleaned up');
    } catch (error) {
        console.error('Error cleaning up expired tokens', error);
    }
});