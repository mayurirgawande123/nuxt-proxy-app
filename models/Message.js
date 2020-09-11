class Message {
  constructor(name, text, id, userid ) {
    this.name = name;
    this.text = text;
    this.id = id;
    this.userid = userid;
    this.time = new Date().toString().slice(15, 24);
  }
}

module.exports = () => {
  return Message
}