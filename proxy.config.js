/***
 @author kritsu
 @date 2018/9/29 9:55
 **/
module.exports = {
  "/api": {
    target: "http://localhost",
    pathRewrite: {
      "/api": "/api"
    }
  },
  "/image": {
    target: "http://localhost",
    pathRewrite: {
      "/image": "/image"
    }
  },
  "/cover": {
    target: "http://localhost",
    pathRewrite: {
      "/cover": "/cover"
    }
  },
  "/icon": {
    target: "http://localhost",
    pathRewrite: {
      "/icon": "/icon"
    }
  }
}
