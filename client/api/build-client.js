import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    // we are on the server !
    // requests should be made to http://SERVICENAME.NAMESPACE.svc.cluster.local
    // (this URL has been used to access service with cross namespace)
    return axios.create({
      baseURL: "http://www.bookstore.monster/",
      headers: req.headers
    });
  } else {
    // we are on the client !
    // requests can be made with a base url of ''
    return axios.create({
      baseURL: '/',
    });
  }

}
