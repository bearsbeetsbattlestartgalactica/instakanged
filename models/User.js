const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const CustomError = require('../middlewares/errorHandler').CustomError;
const Schema = mongoose.Schema;

const roles = ['customer', 'merchant', 'admin'];

const userSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      minlength: 10,
      maxlength: 15,
    },

    pin: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 128,
    },
    name: {
      type: String,
      maxlength: 50,
    },
    active: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: 'customer',
      enum: roles,
    },
    details: {
      type: Object,
      default: {},
    },
  },
  {
    minimize: false,
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

userSchema.pre('save', async function save(next) {
  try {
    // this.pin = bcrypt.hashSync(this.pin);

    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.post('save', async function saved(doc, next) {
  try {
    // const mailOptions = {
    //   from: 'noreply',
    //   to: this.phone,
    //   subject: 'Confirm creating account',
    //   html: `<div><h1>Hello new user!</h1><p>Click <a href="${config.hostname}/api/auth/confirm?key=${this.activationKey}">link</a> to activate your new account.</p></div><div><h1>Hello developer!</h1><p>Feel free to change this template ;).</p></div>`,
    // };

    // transporter.sendMail(mailOptions, function (error, info) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log('Email sent: ' + info.response);
    //   }
    // });

    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name', 'phone', 'createdAt', 'role'];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  pinMatches(pin) {
    return bcrypt.compareSync(pin, this.pin);
  },
});

userSchema.statics = {
  roles,

  checkDuplicatePhoneError(err) {
    if (err.code === 11000) {
      var error = new Error('Phone already taken');
      error.errors = [
        {
          field: 'phone',
          location: 'body',
          messages: ['Phone already taken'],
        },
      ];
      error.status = httpStatus.CONFLICT;
      return error;
    }

    return err;
  },

  async findAndCheck(payload) {
    const { phone, pin } = payload;
    if (!phone) throw new CustomError('Phone must be provided for login');

    const user = await this.findOne({ phone: phone }).exec();
    if (!user) throw new CustomError(`No user associated with ${phone}`, httpStatus.NOT_FOUND);

    const pinOK = await user.pinMatches(pin);

    if (!pinOK) throw new CustomError(`Pin mismatch`, httpStatus.UNAUTHORIZED);

    if (!user.active) throw new CustomError(`User not activated`, httpStatus.UNAUTHORIZED);

    return user;
  },
};

userSchema.plugin(require('mongoose-paginate'));

module.exports = mongoose.model('users', userSchema);
