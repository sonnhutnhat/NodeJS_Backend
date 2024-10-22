import { where } from 'sequelize';
import db from '../models/index'
import bcrypt from 'bcryptjs';
const salt = bcrypt.genSaltSync(10);

const isValidEmail = (email) => {
    // This regex is more strict and won't allow emails ending with numbers
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
};

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    });
}

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!isValidEmail(userEmail)) {
                resolve({
                    isValid: false,
                    exists: false,
                    errMessage: "Invalid email format"
                });
                return;
            }

            let user = await db.User.findOne({
                where: { email: userEmail }
            });

            resolve({
                isValid: true,
                exists: !!user,
                errMessage: user ? "Email exists in the database" : "Email is valid but not registered"
            });
        } catch (e) {
            reject(e);
        }
    });
}

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let emailCheck = await checkUserEmail(email);

            if (!emailCheck.isValid) {
                userData.errCode = 1;
                userData.errMessage = "Invalid email format. Please enter a valid email address.";
            } else if (!emailCheck.exists) {
                userData.errCode = 1;
                userData.errMessage = "This email is not registered in our system. Please try another email.";
            } else {
                let user = await db.User.findOne({
                    where: { email: email },
                    attributes: ['email', 'roleId', 'password', 'firstName', 'lastName'],
                });

                if (user) {
                    let check = await bcrypt.compareSync(password, user.password);
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = "Login successful";
                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = "Incorrect password";
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = "User not found";
                }
            }
            resolve(userData);
        } catch (e) {
            reject(e);
        }
    });
}

let getAllUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === "ALL") {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                });
            } else if (userId) {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    }
                });
            }
            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
}

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!isValidEmail(data.email)) {
                resolve({
                    errCode: 1,
                    errMessage: 'Invalid email format. Please provide a valid email address.'
                });
                return; // Exit the function early
            }

            let emailCheck = await checkUserEmail(data.email);
            if (emailCheck.exists) {
                resolve({
                    errCode: 1,
                    errMessage: 'This email is already in use. Please try another email.'
                });
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender === '1' ? true : false,
                    roleId: data.roleId,
                });
                resolve({
                    errCode: 0,
                    errMessage: 'User created successfully'
                });
            }
        } catch (e) {
            reject(e);
        }
    });
}

let updateUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter: id"
                });
                return;
            }

            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            });

            if (!user) {
                resolve({
                    errCode: 2,
                    errMessage: `User with id ${data.id} not found`
                });
                return;
            }

            // Update email if provided and valid
            if (data.email) {
                if (!isValidEmail(data.email)) {
                    resolve({
                        errCode: 3,
                        errMessage: "Invalid email format"
                    });
                    return;
                }
                let emailCheck = await checkUserEmail(data.email);
                if (emailCheck.exists && user.email !== data.email) {
                    resolve({
                        errCode: 4,
                        errMessage: "Email already in use"
                    });
                    return;
                }
                user.email = data.email;
            }

            // Update password if provided
            if (data.password) {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                user.password = hashPasswordFromBcrypt;
            }

            // Update other fields if provided
            if (data.firstName) user.firstName = data.firstName;
            if (data.lastName) user.lastName = data.lastName;
            if (data.address) user.address = data.address;
            if (data.phonenumber) user.phonenumber = data.phonenumber;
            if (data.gender !== undefined) user.gender = data.gender === '1';
            if (data.roleId) user.roleId = data.roleId;

            await user.save();

            resolve({
                errCode: 0,
                errMessage: "User updated successfully"
            });
        } catch (e) {
            reject(e);
        }
    });
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId }
            });
            if (!user) {
                resolve({
                    errCode: 2,
                    errMessage: `The user isn't exist`
                });
            }
            await db.User.destroy({
                where: { id: userId }
            });
            resolve({
                errCode: 0,
                errMessage: 'The user is deleted successfully!'
            });
        } catch (e) {
            reject(e);
        }
    });
}

let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let res = {}; // Tạo một đối tượng tạm để chứa kết quả
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                }); // Lấy dữ liệu từ DB
                res.errCode = 0;
                res.data = allcode;
                resolve(res); // Trả về đối tượng 'res' đã tạo
            }
        } catch (e) {
            reject(e); // Nếu có lỗi, trả về reject
        }
    });
}





module.exports = {
    handleUserLogin: handleUserLogin,
    checkUserEmail: checkUserEmail,
    getAllUser: getAllUser,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUser: updateUser,
    getAllCodeService: getAllCodeService,
}