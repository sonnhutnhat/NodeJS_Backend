import userService from "../services/userService";

let handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'err'
        })
    }

    let userData = await userService.handleUserLogin(email, password);

    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {}
    });
}

let handleGetAllUser = async (req, res) => {
    let id = req.query.id;

    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing required paramenters',
            users: []

        })
    }
    let users = await userService.getAllUser(id);
    return res.status(200).json({
        errCode: 0,
        errMessage: 'OK',
        users

    })
}

module.exports = {
    handleLogin: handleLogin,
    handleGetAllUser: handleGetAllUser,

}
