exports.handler = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify([
      {
        id: 1,
        name: 'awesome book'
      },
      {
        id: 2,
        name: 'すごい本'
      }
    ])
  }
}
