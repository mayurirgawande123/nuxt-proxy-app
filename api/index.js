const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer()
const API_URL = 'https://1dentalmob-test-fnapp.azurewebsites.net/api/CreateUser'

export default function (req, res, next) {
  console.log(req);
  console.log(API_URL);
  proxy.web(req, res, {
    target: API_URL,
    secure: false,
	changeOrigin: true,
    headers: { 'x-functions-key': 'PPTbJtZ/tbN1/udC5ynylLFaVjEn68NrKpUklfhp2pmqvnS/u2n62Q==' }

  })
}