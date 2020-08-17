var Promise = require('bluebird');

const get_all = async ({
  model,
  view,
  path,
  pagename,
  filter = {},
  coldata = { searchcols: [] },
  sort = undefined,
  link = undefined,
  populate = undefined,
  action = { callback: async (model, data) => {}, text: undefined },
  filterCallback = async (e, i, model) => {},
  log = false,
}) => {
  return async (req, res, next) => {
    const _model = model;
    const _sort = sort || { updatedAt: -1 };
    const _link = link;
    const _populate = populate;

    const paginationLimit = parseInt(req.query.resultsperpage) || 25;
    const currentpage = parseInt(req.query.page) || 1;
    const searchtext = req.query.searchtext || '';

    coldata.cols =
      coldata.cols ||
      Object.keys(_model.schema.paths).filter(
        x => !['createdAt', `__v`, `createdBy`, `updatedBy`, `meta`].includes(x)
      );

    const _filter = {
      ...filter,
      ...(coldata.searchcols && {
        $or: coldata.searchcols.map(e => {
          return {
            [e]: { $regex: new RegExp(searchtext || '', 'ig') },
          };
        }),
      }),
    };

    if (req.query.actiondata) {
      try {
        const data = JSON.parse(decodeURI(req.query.actiondata));
        await action.callback(_model, data);
      } catch (err) {
        console.log(err);
      }
    }

    try {
      const data = await _model.paginate(_filter, {
        select: coldata.cols.join(' '),
        offset: parseInt(currentpage - 1) * paginationLimit || 0,
        limit: paginationLimit,
        sort: _sort,
        populate: _populate,
        lean: true,
      });

      data.docs = await Promise.filter(data.docs, async (e, i) => {
        Object.keys(e).forEach(k => {
          if (
            e[k] instanceof Object &&
            !['createdAt', `__v`, `createdBy`, `updatedBy`, `meta`, '_id'].includes(k)
          ) {
            for (const [key, value] of Object.entries(e[k])) {
              e[`${k.toString()}.${key}`] = value;
              if (
                value instanceof Object &&
                !['createdAt', `__v`, `createdBy`, `updatedBy`, `meta`, '_id'].includes(key)
              ) {
                for (const [key1, value1] of Object.entries(value)) {
                  e[`${k.toString()}.${key}.${key1}`] = value1;
                }
              }
            }
          }
        });
        e.updatedAt &&
          (e.updatedAt =
            e.updatedAt.toLocaleTimeString('en-US') + ' , ' + e.updatedAt.toLocaleDateString('en-US'));
        let tmp = await filterCallback(e, i, _model);
        if (tmp === undefined) {
          return true;
        } else {
          return tmp;
        }
      });

      log && console.log(data);

      res.render(view, {
        listdata: {
          rows: data.docs,
          cols: coldata.cols,
          colnames: coldata.colnames || coldata.cols,
          searchtext: req.query.searchtext,
          pagecount: parseInt(data.total / paginationLimit) + 1,
          currentpage: currentpage,
          action: action.text ? { text: action.text || 'Action' } : undefined,
          link: false,
          showsearch: !!coldata.searchcols,
          currentpath: path,
        },
        pagename: pagename,
      });
    } catch (err) {
      console.log(err);
    }
  };
};

module.exports.get_all = get_all;
