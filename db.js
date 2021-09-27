const fs = require("fs");

module.exports = {
  storeData: async (data, path) => {
    try {
      await fs.promises.writeFile(path, JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  },

  loadData: (path) => {
    try {
      return JSON.parse(fs.readFileSync(path, "utf8"));
    } catch (err) {
      // console.error(err);
      return {};
    }
  }
}
