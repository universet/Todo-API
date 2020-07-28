var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function (sequelize, DataTypes) {
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function (value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: function (user, options) {
				//convert user.email to lowercase
				if(typeof(user.email) === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		}
	});
	user.authenticate = function (body) {
		return new Promise(function (resolve, reject) {
			if(typeof(body.email) !== 'string' || typeof(body.password) !== 'string') {
				return reject.status(400).send();
			}
			user.findOne( {
				where: {
					email: body.email,
					//password: body.password
				}
			}).then(function (user) {
				if(!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
					return reject();
				}
				resolve(user);
			}, function (e) {
				reject();
			});
		});
	}
	user.findByToken = function (token) {
		return new Promise(function (resolve, reject) {
			try {
				var decodedJWT = jwt.verify(token, 'teju@1234');
				var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'coep@1234');
				var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

				user.findByPk(tokenData.id).then(function (user) {
					if(user) {
						resolve(user);
					}
					else {
						reject();
					}
				}, function (e) {
					reject();
				});
			} catch (e) {
				reject();
			}
		});
	}
	user.prototype.toPublicJSON = function () {
		var json = this.toJSON();
		return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
	}
	user.prototype.generateToken = function (type) {
		if(!_.isString(type)) {
			return undefined;
		}
		try {
			var stringData = JSON.stringify({id: this.get('id'), type: type}); //this -> current instance
			var encryptedData = cryptojs.AES.encrypt(stringData, 'coep@1234').toString();
			var token = jwt.sign({
				token: encryptedData
			}, 'teju@1234');
			return token;
		} catch (e) {
			return undefined;
		}
	}
	return user;
};