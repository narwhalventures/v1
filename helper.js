const messages = require("./messages")

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

module.exports = {
  formatBytes: (a,b=2,k=1024) => {with(Math){let d=floor(log(a)/log(k));return 0==a?"0 Bytes":parseFloat((a/pow(k,d)).toFixed(max(0,b)))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}},
  isAdminMsg: (msg) => {
    return msg.member.hasPermission("ADMINISTRATOR");
  },
  randomReward: () => {
    const rewards = messages.rewards;
    const percentage = Math.round(Math.random() * 100);
    var total = 0;
    for (const reward in rewards) {
      total += rewards[reward]["chance"];
      if (total >= percentage) return reward;
    }
    return "Invalid Item";
  },
  question: async (msg, toSend) => {
    const filter = (m) => m.author.id === msg.author.id;
    await msg.channel.send(toSend);
    var collected;
    try {
      collected = await msg.channel.awaitMessages(filter, { max: 1, time: 300000, errors: ["time"] });
    } catch (e) {
      msg.channel.send("Time Out");
    }
    if (collected.first()) {
      return collected.first();
    } else {
      msg.channel.send("Error invalid input");
    } 
  }
};
