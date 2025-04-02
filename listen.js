const app = require("./app");

const { PORT = 3000 } = process.env;

app.listen(PORT, "0.0.0.0", (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server listening on http://0.0.0.0:${PORT}...`);
  }
});
