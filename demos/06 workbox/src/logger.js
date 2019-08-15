export default {
  log: (...args) => {
    console.log(...args);
  },
  warn: (...args) => {
    const [arg1, ...argtmps] = args;
    console.log(
      `%c${arg1}`,
      'background-color: #f5c30d;border-radius: 4px;color: #fff;padding: 2px 5px;font-size: 12px;',
      ...argtmps
    );
  },
  success: (...args) => {
    const [arg1, ...argtmps] = args;
    console.log(
      `%c${arg1}`,
      'background-color: #56d00b;border-radius: 4px;color: #fff;padding: 2px 5px;font-size: 12px;',
      ...argtmps
    );
  },
  error: (...args) => {
    const [arg1, ...argtmps] = args;
    console.log(
      `%c${arg1}`,
      'background-color: red;border-radius: 4px;color: #fff;padding: 2px 5px;font-size: 12px;',
      ...argtmps
    );
  }
};
