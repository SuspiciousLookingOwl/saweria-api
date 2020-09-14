import axios from "axios";
import applyCaseMiddleware from "axios-case-converter";

export default applyCaseMiddleware(axios.create());