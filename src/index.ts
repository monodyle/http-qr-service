import http from 'node:http'
import { URL } from 'node:url'
import { QRCode } from 'sqrc'

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

  const qr = new QRCode({
    value: content,
    logoImage: 'https://images2.imgbox.com/1b/48/FG6MDv15_o.png',
    removeQrCodeBehindLogo: true,
    size: 600,
    logoWidth: 100,
    quietZone: 10,
    logoPadding: 4,
    logoPaddingStyle: 'square',
    ecLevel: 'M',
    qrStyle: 'dots',
    fgColor: '#1C1F25',
    bgColor: '#FFF',
    eyeRadius: [
      [48, 48, 8, 48],
      [48, 48, 48, 8],
      [48, 8, 48, 48]
    ]
  })

  const buffer = await qr.render()

  res.end(buffer)
}

const server = http.createServer(requestListener)

const host = 'localhost'
const port = 3000

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
})
