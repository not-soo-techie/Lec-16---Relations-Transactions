import app from "./app.js";
import { config } from "dotenv";

config()

const PORT = process.env.PORT || 4545

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})

