const tools = require("../tools/tools.js");
const got = require("got");

module.exports = {
    name: "cookie",
    ping: true,
    description: 'This command will register/unregiter you for notifications for "ThePositiveBot´s" cookies. Available commands: "bb cookie [register/unregister]", "bb cookie status"(will tell you the time remaining until you can eat your next cookie)',
    permission: 100,
    category: "Notify command",
    execute: async (channel, user, input, perm) => {
        try {
            if (module.exports.permission > perm) {
                return;
            }
            switch (input[2]) {
                case "register":
                    const register = await tools.query(`SELECT * FROM Cookies WHERE User=?`, [user.username]);

                    if (!register.length) {
                        await tools.query('INSERT INTO Cookies (User) values (?)', [user.username]);

                        return 'You are now registered for cookie notifications';

                    } else {
                        return 'You are already registered for cookie notifications';
                    }
                    break;
                case "unregister":
                    const unregister = await tools.query(`SELECT * FROM Cookies WHERE User=?`, [user.username]);

                    if (unregister.length) {
                        await tools.query(`DELETE FROM Cookies WHERE User=?`, [user.username]);

                        return 'You are now unregistered for cookie notifications';
                    } else {
                        return 'You are not registered for cookie notifications';
                    }
                    break;
                case "status":
                    const status = await tools.query(`SELECT * FROM Cookies WHERE User=?`, [user.username]);

                    if (status.length) {
                        if (status[0].RemindTime !== null) {
                            let cd = status[0].RemindTime - new Date().getTime();
                            cd = tools.humanizeDuration(cd);

                            return `There is no cookie for you right now, your next cookie is available in ${cd}`
                        }
                        if (status[0].RemindTime === null) {
                            let cookieCD = await got(`https://api.roaringiron.com/cooldown/${user.username}`, { timeout: 10000 }).json();

                            if (cookieCD["error"]) {
                                return cookieCD["error"];
                            }
                            if (cookieCD["can_claim"] === true) {
                                return 'You have a cookie wating for you :)';
                            } else {
                                let cd = cookieCD["seconds_left"] * 1000;
                                cd = tools.humanizeDuration(cd);

                                return `There is no cookie for you right now, your next cookie is available in ${cd}`;
                            }
                        } else {
                            return 'You have a cookie wating for you :)';
                        }
                    } else {
                        let cookieCD = await got(`https://api.roaringiron.com/cooldown/${user.username}`, { timeout: 10000 }).json();

                        if (cookieCD["error"]) {
                            return cookieCD["error"];
                        }
                        if (cookieCD["can_claim"] === true) {
                            return 'You have a cookie wating for you :)';
                        } else {
                            let cd = cookieCD["seconds_left"] * 1000;
                            cd = tools.humanizeDuration(cd);

                            return `There is no cookie for you right now, your next cookie is available in ${cd}`;
                        }
                    }
                default:
                    return 'This command is for registering/unregitering you for notifications for "ThePositiveBot´s" cookies. Available cookie commands: "bb cookie register", "bb cookie unregister", "bb cookie status"'
            }

        } catch (err) {
            console.log(err);
            if (err.name) {
                if (err.name === "TimeoutError") {
                    return `FeelsDankMan Banphrase api error: ${err.name}`;
                }
            }
            return `FeelsDankMan Sql error: ${err.sqlMessage}`;
        }
    }
}