// tests/utils/mockHttp.js
const createMockRequest = (overrides = {}) => {
  return {
    method: 'GET',
    url: '/',
    headers: {},
    body: {},
    params: {},
    query: {},
    ip: '127.0.0.1',
    ...overrides
  };
};

const createMockResponse = () => {
  const res = {
    statusCode: 200,
    headers: {},
    _data: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this._data = data;
      return this;
    },
    send: function(data) {
      this._data = data;
      return this;
    },
    end: function() {
      this._ended = true;
      return this;
    },
    getHeader: function(name) {
      return this.headers[name.toLowerCase()];
    },
    setHeader: function(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    }
  };
  return res;
};

const createNextFunction = () => {
  return jest.fn();
};

module.exports = {
  createMockRequest,
  createMockResponse,
  createNextFunction
};