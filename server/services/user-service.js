const { hash, compare } = require('bcrypt');
const { v4 } = require('uuid');
const colors = require('colors');

const UserModel = require('../models/user-model');
const { sendActivationMail } = require('./mail-service');
const {
  generateTokens,
  saveToken,
  removeToken,
  validateAccessToken,
  validateRefreshToken,
  findToken,
} = require('./token-service');
const ApiError = require('../exeptions/api-error');

const UserDto = require('../dtos/user-dto');

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(`User with email ${email} already exist`);
    }
    try {
      const hashPassword = await hash(password, 3);
      const activationLink = v4();

      const user = await UserModel.create({
        email,
        password: hashPassword,
        activationLink,
      });

      await sendActivationMail(
        email,
        `${process.env.API_URL}/api/activate/${activationLink}`
      );

      const userDto = new UserDto(user); // id, email, isActivated
      const tokens = generateTokens({ ...userDto });
      await saveToken(userDto.id, tokens.refreshToken);

      return {
        ...tokens,
        user: userDto,
      };
    } catch (e) {
      console.log(colors.red('error userService'), e);
    }
  }

  async activate(activationLink) {
    let user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest('Incorrect activation link');
    }

    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest(`User with email ${email} not found`);
    }
    const isPassEquals = await compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Incorrect password');
    }

    const userDto = new UserDto(user);
    const tokens = generateTokens({ ...userDto });
    await saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async logout(refreshToken) {
    const token = await removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = validateRefreshToken(refreshToken);
    const tokenFromDb = await findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = generateTokens({ ...userDto });
    await saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();
