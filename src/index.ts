import { Resvg } from '@resvg/resvg-js'
import http from 'node:http'
import satori from 'satori'
import { html } from 'satori-html'
import QRCode from 'easyqrcodejs-nodejs'
import { URL } from 'node:url'

const logo = `<img src="https://images2.imgbox.com/be/0c/mpTLarKc_o.png" style="width:128px;height:128px;position:absolute;left:256px;top:256px;border-radius:128px;border:8px solid #fff;" />`

const requestListener = async function (
  req: http.IncomingMessage,
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage
  }
) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
  const content = url.searchParams.get('content')

  if (!content) {
    res.writeHead(404)
    res.end('not found')
    return
  }

  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'max-age=31536000')
  res.writeHead(200)

  var qrcode = new QRCode({
    text: content,
    width: 640 - 48,
    height: 640 - 48,
    correctLevel: QRCode.CorrectLevel.H,
    quietZone: 24
  })
  const data = await qrcode.toSVGText()
  const template = html(
    `<div style="width:640px;height:640px;position:relative;display:flex;">${data}${logo}</div>`
  )
  const svg = await satori(template, {
    width: 640,
    height: 640,
    fonts: []
  })
  const resvg = new Resvg(svg, {
    background: '#fff'
  })
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  res.end(pngBuffer)
}

const server = http.createServer(requestListener)

const host = 'localhost'
const port = 3000

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
})
