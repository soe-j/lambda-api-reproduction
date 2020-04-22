exports.handler = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      Message: 'Hello',
      'User-Agent': event.headers['User-Agent']
    })
  }
}
