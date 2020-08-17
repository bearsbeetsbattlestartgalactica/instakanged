const { func } = require('@hapi/joi');

const crudControllerClass = class {
  constructor({ model, idfield = '_id', schema = undefined, returnMiddleware = true }) {
    this._model = model;
    this._idfield = idfield;
    this._schema = schema;
    this._returnMiddleware = returnMiddleware;
  }

  async _fragment(fn, returnMiddleware, data, cb) {
    const _returnMiddleware = returnMiddleware || this._returnMiddleware;
    const _cb = async (model, result) => {
      try {
        const _result = await cb(model, result);
        if (!_result) return result;
        return _result;
      } catch (err) {
        return result;
      }
    };
    if (_returnMiddleware) {
      return async (req, res, next) => {
        try {
          res
            .status(200)
            .json({
              success: true,
              result: await _cb(this._model, await fn(req)),
            })
            .end();
        } catch (err) {
          next(err);
        }
      };
    } else if (!_returnMiddleware && data) {
      return {
        success: true,
        result: await _cb(this._model, await fn(data)),
      };
    } else {
      try {
        next({ message: 'No data given to raw crud function' });
      } catch (err) {
        throw 'No data given to raw crud function';
      }
    }
  }

  async create({ returnMiddleware = undefined, data = undefined, cb = undefined }) {
    const fn = async data => {
      this._schema && this._schema.validate(data.body);
      return await this._model.create(data.body);
    };
    return await this._fragment(fn, returnMiddleware, data, cb);
  }

  async get({
    idfield = undefined,
    filter = undefined,
    filterActive = true,
    returnMiddleware = undefined,
    data = undefined,
    cb = undefined,
  }) {
    const fn = async data => {
      const _filter = filter || {
        ...(!!data.query[idfield || this._idfield] && {
          [idfield || this._idfield]:
            data.query[idfield || this._idfield] || data.body[idfield || this._idfield],
          ...(Object.keys(this._model.schema.paths).includes('active') &&
            filterActive && { active: true }),
        }),
      };
      return await this._model.find(_filter);
    };
    return await this._fragment(fn, returnMiddleware, data, cb);
  }

  async update({
    idfield = undefined,
    filter = undefined,
    returnMiddleware = undefined,
    data = undefined,
    cb = undefined,
  }) {
    const fn = async data => {
      const idValue =
        data.query[idfield || this._idfield] || data.body[idfield || this._idfield] || undefined;
      const _filter = filter || { ...(!!idValue && { [idfield || this._idfield]: idValue }) };
      this._schema && this._schema.validate(data.body);
      const { createdAt, __v, createdBy, updatedBy, meta, ...rest } = data.body;
      return await this._model.findOneAndUpdate(_filter, rest, { new: true });
    };
    return await this._fragment(fn, returnMiddleware, data, cb);
  }

  async remove({
    idfield = undefined,
    filter = undefined,
    returnMiddleware = undefined,
    data = undefined,
    cb = undefined,
  }) {
    const fn = async data => {
      const _filter = filter || {
        ...(!!data.query[idfield || this._idfield] && {
          [idfield || this._idfield]:
            data.query[idfield || this._idfield] || data.body[idfield || this._idfield],
        }),
      };
      return await this._model.findOneAndRemove(_filter);
    };
    return await this._fragment(fn, returnMiddleware, data, cb);
  }
};

module.exports = ({ model, idfield = '_id', schema = undefined, returnMiddleware = true }) => {
  return new crudControllerClass({
    model: model,
    idfield: idfield,
    schema: schema,
    returnMiddleware: returnMiddleware,
  });
};
